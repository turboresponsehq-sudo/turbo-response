import { Router } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { sendOwnerNotification } from "../services/auditEmailService";

export const aiLearningRouter = Router();

const attempts = new Map<string, number[]>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

function allowAttempt(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= maxAttempts) return false;
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function list(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => text(item, 120)).filter(Boolean).slice(0, 8);
  if (typeof value === "string" && value.trim()) return [value.trim().slice(0, 120)];
  return [];
}

aiLearningRouter.post("/ai-learning-intake", async (req: any, res) => {
  const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
  if (!allowAttempt(String(key))) return res.status(429).json({ error: "Please wait a few minutes before submitting again." });

  const name = text(req.body?.name, 255);
  const email = text(req.body?.email, 320).toLowerCase();
  const phone = text(req.body?.phone, 100);
  const experience = text(req.body?.experience, 80);
  const learningInterests = list(req.body?.learningInterest);
  const goal = text(req.body?.goal, 5000);
  const learningStyle = text(req.body?.learningStyle, 80);
  const anythingElse = text(req.body?.anythingElse, 5000);

  if (req.body?.website) return res.status(201).json({ success: true, message: "Intake received." });
  if (!name || !email || !experience || !learningInterests.length || !goal || !learningStyle) {
    return res.status(400).json({ error: "Please complete the required intake fields." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });

  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Intake storage is temporarily unavailable." });
    const result = await db.execute(sql`
      INSERT INTO ai_learning_intakes
        (name, email, phone, experience, learning_interests, goal, learning_style, anything_else)
      VALUES
        (${name}, ${email}, ${phone || null}, ${experience}, ${JSON.stringify(learningInterests)}, ${goal}, ${learningStyle}, ${anythingElse || null})
      RETURNING id, submitted_at
    `);
    const rows = Array.isArray(result) ? result : ((result as { rows?: unknown[] }).rows ?? []);
    const submission = rows[0] as { id?: number; submitted_at?: string } | undefined;
    sendOwnerNotification("New AI Learning Intake", [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Experience: ${experience}`,
      `Wants to learn: ${learningInterests.join(", ")}`,
      `Goal: ${goal}`,
      `Learning style: ${learningStyle}`,
      `Submitted: ${submission?.submitted_at || new Date().toISOString()}`,
    ]).catch((error) => console.warn("[AI Learning] Owner notification failed:", error));
    return res.status(201).json({ success: true, message: "Got it. I’ll review your intake and follow up with you.", id: submission?.id });
  } catch (error) {
    console.error("[AI Learning] Intake save failed", error);
    return res.status(500).json({ error: "We could not save your intake. Please try again." });
  }
});
