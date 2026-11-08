
import { useEffect, useRef, useState } from "react";

declare global { interface Window { cv: any; } }

const SLOTS = [
  { id: "1", name: "Archive 01 — Red Shirt" },
  { id: "2", name: "Archive 02 — Wicker Chair / Jets" },
  { id: "3", name: "Archive 03 — Red Cap / Gold Chains" },
];

const DB_NAME = "money-bosses-atlanta-archives";
const DB_STORE = "targets";

function openTargetDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveTarget(id: string, value: string) {
  const db = await openTargetDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadTargets(): Promise<Record<string,string>> {
  const db = await openTargetDb();
  const result: Record<string,string> = {};
  await Promise.all(SLOTS.map((slot) => new Promise<void>((resolve) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(slot.id);
    req.onsuccess = () => {
      if (typeof req.result === "string" && req.result) result[slot.id] = req.result;
      resolve();
    };
    req.onerror = () => resolve();
  })));
  db.close();
  return result;
}

async function normalizeImageFile(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });

  if (!raw) throw new Error("Could not read image.");

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not decode image."));
      element.src = raw;
    });

    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // JPEG is consistently supported by iPhone Safari and Android Chrome,
    // and keeps the target small enough for mobile browser storage.
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    // If the browser cannot transcode the selected format, keep the original.
    return raw;
  }
}

export default function AtlantaArchiveScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [status, setStatus] = useState("Loading image scanner…");
  const [targets, setTargets] = useState<Record<string,string>>({});
  const [matched, setMatched] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const targetDescriptors = useRef<any[]>([]);
  const cameraStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const lastTriggered = useRef<string | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    (async () => {
      const saved = await loadTargets().catch(() => ({} as Record<string,string>));

      // Migrate the first prototype's localStorage images into IndexedDB.
      // iPhone Safari's small localStorage quota could hold two large photos
      // but fail on the third one.
      for (const s of SLOTS) {
        const key = "mb-archive-target-" + s.id;
        const legacy = localStorage.getItem(key);
        if (legacy && !saved[s.id]) {
          saved[s.id] = legacy;
          try {
            await saveTarget(s.id, legacy);
            localStorage.removeItem(key);
          } catch {
            // Keep the in-memory target even if migration fails.
          }
        }
      }
      setTargets(saved);
    })();

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

  async function onUpload(slotId: string, file?: File) {
    if (!file) return;
    setStatus("Loading Archive " + slotId + "…");

    try {
      const value = await normalizeImageFile(file);
      setTargets((old) => ({ ...old, [slotId]: value }));

      try {
        await saveTarget(slotId, value);
        localStorage.removeItem("mb-archive-target-" + slotId);
        setStatus("Archive " + slotId + " loaded. You can scan it now.");
      } catch (error) {
        console.error(error);
        setStatus("Archive " + slotId + " is loaded for this session. Keep this page open and scan it now.");
      }
    } catch (error) {
      console.error(error);
      setStatus("That image could not be read. Try choosing it again.");
    }
  }

  async function startCamera() {
    const video = videoRef.current;
    if (!video) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("This browser cannot use the camera. Open this page in Safari on iPhone or Chrome on Android.");
      return;
    }

    cameraStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = null;

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        // Some Android devices reject facingMode constraints. Fall back to
        // any available camera instead of failing the scanner.
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      cameraStream.current = stream;

      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx && !audioContext.current) audioContext.current = new Ctx();
        await audioContext.current?.resume?.();
      } catch {}

      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.autoplay = true;
      video.srcObject = stream;
      await video.play();
      setStatus("Scanning… keep the full garment image inside the frame.");
    } catch (error: any) {
      console.error(error);
      if (error?.name === "NotAllowedError") {
        setStatus("Camera permission is off. Allow camera access for this site, then tap START IMAGE SCANNER again.");
      } else {
        setStatus("The camera could not start. Use Safari on iPhone or Chrome on Android and try again.");
      }
    }
  }

  useEffect(() => {
    return () => {
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      targetDescriptors.current.forEach((target) => target.des?.delete?.());
    };
  }, []);

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

          if (lastTriggered.current !== best.id) {
            lastTriggered.current = best.id;
            setUnlocked(true);

            try {
              const ctx = audioContext.current;
              if (ctx) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(520, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);
                gain.gain.setValueAtTime(0.0001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
                osc.connect(gain).connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
              }
            } catch {}

            window.setTimeout(() => setUnlocked(false), 2200);
          }
        } else if (best?.good >= 8) {
          setMatched(null);
          setStatus("Almost there… move closer and hold steady.");
        } else {
          setMatched(null);
          if (lastTriggered.current) lastTriggered.current = null;
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
          <div style={{ fontSize:13, opacity:.72, marginBottom:12 }}>Works on iPhone Safari and Android Chrome. Load the same three exact images you sent the manufacturer. They stay saved on this device.</div>
          <div style={{ display:"grid", gap:10 }}>
            {SLOTS.map((slot) => (
              <label key={slot.id} style={{ display:"flex", gap:10, alignItems:"center", background:"#0f0f0f", borderRadius:12, padding:10, border:"1px solid #2b2b2b" }}>
                {targets[slot.id] ? <img src={targets[slot.id]} style={{ width:58, height:72, objectFit:"cover", borderRadius:7 }} /> : <div style={{ width:58, height:72, borderRadius:7, background:"#252525" }} />}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{slot.name}</div>
                  <div style={{ fontSize:12, opacity:.6 }}>{targets[slot.id] ? "Loaded" : "Tap to load image"}</div>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" onChange={(e) => onUpload(slot.id, e.target.files?.[0])} style={{ maxWidth:115 }} />
              </label>
            ))}
          </div>
        </section>

        {unlocked && matchedSlot && (
          <div style={{
            position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(0,0,0,.92)", color:"#f4eee2", textAlign:"center", padding:24
          }}>
            <div>
              <div style={{ fontSize:13, letterSpacing:5, opacity:.7, marginBottom:12 }}>MONEY BOSSES</div>
              <div style={{ fontSize:38, fontWeight:900, lineHeight:1 }}>ARCHIVE UNLOCKED</div>
              <div style={{ marginTop:14, fontSize:18, fontWeight:700 }}>{matchedSlot.name}</div>
            </div>
          </div>
        )}

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
