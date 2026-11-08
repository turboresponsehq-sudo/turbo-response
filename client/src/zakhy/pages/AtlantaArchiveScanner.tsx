
import { useEffect, useRef, useState } from "react";

declare global { interface Window { cv: any; } }

const SLOTS = [
  { id: "1", name: "Archive 01 — Red Shirt" },
  { id: "2", name: "Archive 02 — Wicker Chair / Jets" },
  { id: "3", name: "Archive 03 — Red Cap / Gold Chains" },
];

export default function AtlantaArchiveScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [status, setStatus] = useState("Loading image scanner…");
  const [targets, setTargets] = useState<Record<string,string>>({});
  const [matched, setMatched] = useState<string | null>(null);
  const targetDescriptors = useRef<any[]>([]);
  const busy = useRef(false);

  useEffect(() => {
    const saved: Record<string,string> = {};
    for (const s of SLOTS) {
      const v = localStorage.getItem("mb-archive-target-" + s.id);
      if (v) saved[s.id] = v;
    }
    setTargets(saved);

    const load = () => new Promise<void>((resolve, reject) => {
      if (window.cv?.ORB) return resolve();
      const prior = document.querySelector("script[data-mb-opencv]") as HTMLScriptElement | null;
      if (prior) {
        const t = setInterval(() => {
          if (window.cv?.ORB) { clearInterval(t); resolve(); }
        }, 120);
        setTimeout(() => { clearInterval(t); reject(new Error("Scanner engine timed out.")); }, 20000);
        return;
      }
      const s = document.createElement("script");
      s.src = "https://docs.opencv.org/4.x/opencv.js";
      s.async = true;
      s.setAttribute("data-mb-opencv","1");
      s.onload = () => {
        const t = setInterval(() => {
          if (window.cv?.ORB) { clearInterval(t); resolve(); }
        }, 120);
        setTimeout(() => { clearInterval(t); reject(new Error("Scanner engine timed out.")); }, 20000);
      };
      s.onerror = () => reject(new Error("Could not load scanner engine."));
      document.head.appendChild(s);
    });

    load().then(() => {
      setEngineReady(true);
      setStatus("Load the three exact artwork images once, then start the camera.");
    }).catch((e) => setStatus(e.message));
  }, []);

  async function rebuildDescriptors(nextTargets: Record<string,string>) {
    if (!window.cv?.ORB) return;
    targetDescriptors.current.forEach((t) => t.des?.delete?.());
    targetDescriptors.current = [];

    const cv = window.cv;
    const orb = new cv.ORB(1200);

    for (const slot of SLOTS) {
      const src = nextTargets[slot.id];
      if (!src) continue;
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = src;
      });
      const c = document.createElement("canvas");
      const maxW = 720;
      const scale = Math.min(1, maxW / img.width);
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);

      const mat = cv.imread(c);
      const gray = new cv.Mat();
      cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
      const kp = new cv.KeyPointVector();
      const des = new cv.Mat();
      orb.detectAndCompute(gray, new cv.Mat(), kp, des);
      targetDescriptors.current.push({ id: slot.id, name: slot.name, des });
      mat.delete(); gray.delete(); kp.delete();
    }
    orb.delete();
  }

  useEffect(() => {
    if (!engineReady) return;
    rebuildDescriptors(targets).catch(() => {});
  }, [engineReady, targets]);

  function onUpload(slotId: string, file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      localStorage.setItem("mb-archive-target-" + slotId, value);
      setTargets((old) => ({ ...old, [slotId]: value }));
      setStatus("Target saved. Load all three, then start the camera.");
    };
    reader.readAsDataURL(file);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Scanning… keep the full garment image inside the frame.");
    } catch {
      setStatus("Camera access is required. Allow camera permission and try again.");
    }
  }

  useEffect(() => {
    if (!engineReady) return;
    const timer = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || busy.current || !targetDescriptors.current.length) return;
      busy.current = true;

      try {
        const cv = window.cv;
        const w = 520;
        const ratio = video.videoWidth ? video.videoHeight / video.videoWidth : 0.75;
        canvas.width = w;
        canvas.height = Math.max(320, Math.round(w * ratio));
        canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
        const orb = new cv.ORB(1000);
        const kp = new cv.KeyPointVector();
        const des = new cv.Mat();
        orb.detectAndCompute(gray, new cv.Mat(), kp, des);

        let best: any = null;
        if (!des.empty()) {
          for (const t of targetDescriptors.current) {
            if (!t.des || t.des.empty()) continue;
            const matcher = new cv.BFMatcher(cv.NORM_HAMMING, false);
            const matches = new cv.DMatchVectorVector();
            matcher.knnMatch(t.des, des, matches, 2);
            let good = 0;
            for (let i = 0; i < matches.size(); i++) {
              const mv = matches.get(i);
              if (mv.size() >= 2) {
                const m = mv.get(0), n = mv.get(1);
                if (m.distance < 0.72 * n.distance && m.distance < 72) good++;
              }
              mv.delete();
            }
            matches.delete();
            matcher.delete();
            if (!best || good > best.good) best = { ...t, good };
          }
        }

        if (best?.good >= 16) {
          setMatched(best.id);
          setStatus("Recognized: " + best.name);
        } else if (best?.good >= 8) {
          setMatched(null);
          setStatus("Almost there… move closer and hold steady.");
        } else {
          setMatched(null);
          setStatus("Scanning… point at the full printed image.");
        }

        frame.delete(); gray.delete(); kp.delete(); des.delete(); orb.delete();
      } catch (e) {
        console.error(e);
      } finally {
        busy.current = false;
      }
    }, 700);

    return () => clearInterval(timer);
  }, [engineReady]);

  const matchedSlot = SLOTS.find((s) => s.id === matched);

  return (
    <main style={{ minHeight:"100vh", background:"#090909", color:"#f4eee2", padding:"20px", fontFamily:"Arial, sans-serif" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <header style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontWeight:900, fontSize:34, letterSpacing:1 }}>MONEY BOSSES</div>
          <div style={{ fontSize:13, letterSpacing:5, opacity:.72 }}>ATLANTA ARCHIVES</div>
        </header>

        <section style={{ background:"#151515", border:"1px solid #3a342d", borderRadius:16, padding:14, marginBottom:16 }}>
          <div style={{ fontWeight:800, marginBottom:6 }}>TEST SETUP — ONE TIME ON THIS PHONE</div>
          <div style={{ fontSize:13, opacity:.72, marginBottom:12 }}>Load the same three exact images you sent the manufacturer. They stay saved on this device.</div>
          <div style={{ display:"grid", gap:10 }}>
            {SLOTS.map((slot) => (
              <label key={slot.id} style={{ display:"flex", gap:10, alignItems:"center", background:"#0f0f0f", borderRadius:12, padding:10, border:"1px solid #2b2b2b" }}>
                {targets[slot.id] ? <img src={targets[slot.id]} style={{ width:58, height:72, objectFit:"cover", borderRadius:7 }} /> : <div style={{ width:58, height:72, borderRadius:7, background:"#252525" }} />}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{slot.name}</div>
                  <div style={{ fontSize:12, opacity:.6 }}>{targets[slot.id] ? "Loaded" : "Tap to load image"}</div>
                </div>
                <input type="file" accept="image/*" onChange={(e) => onUpload(slot.id, e.target.files?.[0])} style={{ maxWidth:115 }} />
              </label>
            ))}
          </div>
        </section>

        <section style={{ position:"relative", overflow:"hidden", borderRadius:18, border:"1px solid #51483d", background:"#111" }}>
          <video ref={videoRef} muted playsInline style={{ width:"100%", minHeight:320, display:"block", objectFit:"cover", background:"#111" }} />
          <canvas ref={canvasRef} style={{ display:"none" }} />
          <div style={{ position:"absolute", inset:"12%", border:"2px solid rgba(244,238,226,.7)", borderRadius:16, pointerEvents:"none" }} />
          {matchedSlot && (
            <div style={{ position:"absolute", left:14, right:14, bottom:14, background:"rgba(0,0,0,.88)", border:"1px solid #8e754f", borderRadius:12, padding:14 }}>
              <div style={{ fontWeight:900, fontSize:19 }}>{matchedSlot.name}</div>
              <div style={{ fontSize:13, opacity:.78, marginTop:5 }}>IMAGE RECOGNIZED — this is where music, Grok video, interviews, or the archive story will launch.</div>
            </div>
          )}
        </section>

        <button onClick={startCamera} disabled={!engineReady || Object.keys(targets).length < 1}
          style={{ width:"100%", marginTop:14, padding:"16px", borderRadius:12, border:0, fontWeight:900, fontSize:16, background:"#f4eee2", color:"#111" }}>
          {engineReady ? "START IMAGE SCANNER" : "LOADING SCANNER…"}
        </button>

        <p style={{ textAlign:"center", minHeight:48, opacity:.8, lineHeight:1.45 }}>{status}</p>

        <a href="/zakhybuildsai/portfolio/story-of-atlanta"
          style={{ display:"block", textAlign:"center", color:"#f4eee2", fontWeight:700, padding:"12px", border:"1px solid #3a342d", borderRadius:12, textDecoration:"none" }}>
          OPEN STORY OF ATLANTA — BACKUP
        </a>
      </div>
    </main>
  );
}
