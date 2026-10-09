import { Router } from "express";
import { timingSafeEqual } from "crypto";
import { appendHubSpotContactNote, syncContactToHubSpot } from "../../hubspotSync";
import { deliverAmaniInquiryEmails } from "./emailDelivery";
import { appendAmaniEvent, createAmaniInquiry, setAmaniHubSpotSync } from "./repository";
import { AMANI_RELATIONSHIP_OWNER, amaniInquirySchema } from "./types";

export const amaniRouter = Router();

const attempts = new Map<string, number[]>();
const MAX_ATTEMPTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function enabled() {
  return process.env.AMANI_INQUIRY_CAPTURE_ENABLED === "true";
}

function clientKey(req: any) {
  return String(req.ip || req.headers["x-forwarded-for"] || "unknown");
}

function allowAttempt(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS_PER_WINDOW) {
    attempts.set(key, recent);
    return false;
  }
  attempts.set(key, [...recent, now]);
  return true;
}

function isAuthorizedInternalTest(req: any) {
  const configured = process.env.AMANI_INTERNAL_TEST_TOKEN ?? "";
  const supplied = typeof req.get === "function" ? req.get("x-amani-internal-test") : undefined;
  if (!supplied || configured.length !== supplied.length || configured.length === 0) return false;
  return timingSafeEqual(Buffer.from(configured), Buffer.from(supplied));
}

function internalTestEnabled() {
  return process.env.AMANI_INTERNAL_TEST_ENABLED === "true";
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstname: parts.shift() || fullName.trim(), lastname: parts.join(" ") };
}

function structuredHubSpotNote(input: ReturnType<typeof amaniInquirySchema.parse> & { isInternalTest: boolean }, submittedAt: string) {
  const utm = input.utm ?? {};
  return [
    "AMANI WEBSITE INQUIRY",
    `Submitted: ${submittedAt}`,
    `Relationship owner: ${AMANI_RELATIONSHIP_OWNER}`,
    `Implementation owner: ${AMANI_RELATIONSHIP_OWNER}`,
    `Handoff destination: ${AMANI_RELATIONSHIP_OWNER}`,
    `Source: ${input.source || "Amani Website"}`,
    `Landing page: ${input.landingPage || input.sourcePath || "Not provided"}`,
    `UTM: ${utm.source || ""} / ${utm.medium || ""} / ${utm.campaign || ""}`,
    `Organization / brand: ${input.organization || input.brandOrSocial || "Not provided"}`,
    `Role: ${input.role || "Not provided"}`,
    `City: ${input.city || "Not provided"}`,
    `Opportunity: ${input.goal}`,
    `Primary challenge: ${input.challenge}`,
    `Stage: ${input.stage}`,
    `Timeline: ${input.timeline}`,
    `Investment: ${input.investment || "Not provided"}`,
    `Additional context: ${input.notes || "Not provided"}`,
    input.isInternalTest ? "Internal test record: yes" : "Internal test record: no",
  ].join("\n");
}

// Protected staging-only path. This is intentionally registered before the
// public capture gate and never calls HubSpot, email, or notification code.
amaniRouter.post("/creator/amani/internal-test/inquiries", async (req: any, res) => {
  if (!internalTestEnabled() || !isAuthorizedInternalTest(req)) {
    return res.status(404).json({ error: "Not found" });
  }

  const key = clientKey(req);
  if (!allowAttempt(key)) return res.status(429).json({ error: "Please wait a few minutes before trying again." });

  const parsed = amaniInquirySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please complete the required internal test inquiry details.",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const stored = await createAmaniInquiry(
      { ...parsed.data, isInternalTest: true },
      {
        referrer: typeof req.get === "function" ? req.get("referer") : undefined,
        ip: key,
        eventActor: "amani_internal_test",
      },
    );
    await setAmaniHubSpotSync({
      opportunityId: stored.opportunity.id,
      relationshipId: stored.relationship.id,
      status: "disabled",
    });
    console.info("[Amani] Internal test inquiry stored; external gates remain disabled", {
      inquiryId: stored.opportunity.id,
      created: stored.created,
    });
    return res.status(201).json({
      success: true,
      message: "Internal Amani test inquiry stored.",
      inquiryId: stored.opportunity.id,
      created: stored.created,
      internalTest: true,
    });
  } catch (error) {
    console.error("[Amani] Internal test inquiry failed", error);
    return res.status(500).json({ error: "The internal Amani test inquiry could not be saved." });
  }
});

amaniRouter.use("/creator/amani", (_req, res, next) => {
  if (!enabled()) return res.status(404).json({ error: "Not found" });
  return next();
});

amaniRouter.get("/creator/amani/health", (_req, res) => {
  return res.json({
    service: "Amani Creator Automations",
    captureEnabled: enabled(),
    hubSpotSyncEnabled: process.env.AMANI_HUBSPOT_SYNC_ENABLED === "true",
    emailSendingEnabled: process.env.AMANI_EMAIL_SENDING_ENABLED === "true",
  });
});

amaniRouter.post("/creator/amani/inquiries", async (req: any, res) => {
  const key = clientKey(req);
  if (!allowAttempt(key)) return res.status(429).json({ error: "Please wait a few minutes before submitting again." });

  const parsed = amaniInquirySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please complete the required inquiry details.",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  if (parsed.data.website) {
    return res.status(201).json({ success: true, message: "Inquiry received." });
  }

  try {
    const inquiry = { ...parsed.data, isInternalTest: isAuthorizedInternalTest(req) };
    const stored = await createAmaniInquiry(inquiry, {
      referrer: typeof req.get === "function" ? req.get("referer") : undefined,
      ip: key,
    });

    const syncEnabled = process.env.AMANI_HUBSPOT_SYNC_ENABLED === "true";
    const skipTestSync = stored.opportunity.isInternalTest && process.env.AMANI_HUBSPOT_SYNC_INTERNAL_TESTS !== "true";
    if (!syncEnabled || skipTestSync) {
      await setAmaniHubSpotSync({
        opportunityId: stored.opportunity.id,
        relationshipId: stored.relationship.id,
        status: "disabled",
      });
    } else {
      try {
        const { firstname, lastname } = splitName(inquiry.fullName);
        const contactId = await syncContactToHubSpot({
          firstname,
          lastname,
          email: inquiry.email.toLowerCase(),
          phone: inquiry.phone || undefined,
          company: inquiry.organization || undefined,
          website: inquiry.brandOrSocial || undefined,
          lead_source: "Amani Website",
          hs_lead_status: "NEW",
          lifecyclestage: "lead",
        });
        const noteId = contactId
          ? await appendHubSpotContactNote(contactId, structuredHubSpotNote(inquiry, stored.opportunity.createdAt))
          : null;
        if (!contactId || !noteId) throw new Error("HubSpot contact or note sync was incomplete");
        await setAmaniHubSpotSync({
          opportunityId: stored.opportunity.id,
          relationshipId: stored.relationship.id,
          contactId,
          noteId,
          status: "synced",
        });
        await appendAmaniEvent({
          opportunityId: stored.opportunity.id,
          eventType: "hubspot_contact_and_note_synced",
          actor: "amani_hubspot_sync",
          idempotencyKey: `amani-opportunity:${stored.opportunity.id}:hubspot-contact-note`,
          payload: { contactId, noteId },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 300) : "HubSpot synchronization failed";
        console.error("[Amani] HubSpot sync failed after inquiry storage", error);
        await setAmaniHubSpotSync({
          opportunityId: stored.opportunity.id,
          relationshipId: stored.relationship.id,
          status: "failed",
          error: message,
        });
        await appendAmaniEvent({
          opportunityId: stored.opportunity.id,
          eventType: "hubspot_sync_failed",
          actor: "amani_hubspot_sync",
          idempotencyKey: `amani-opportunity:${stored.opportunity.id}:hubspot-failed`,
          payload: { message },
        });
      }
    }

    const emailDelivery = await deliverAmaniInquiryEmails({
      fullName: inquiry.fullName,
      email: inquiry.email,
      organization: inquiry.organization,
      goal: inquiry.goal,
      challenge: inquiry.challenge,
      stage: inquiry.stage,
      timeline: inquiry.timeline,
      investment: inquiry.investment,
      source: inquiry.source || "Amani Website",
      relationshipOwner: AMANI_RELATIONSHIP_OWNER,
      implementationOwner: AMANI_RELATIONSHIP_OWNER,
      nextAction: "Review inquiry and recommend the next relationship or campaign action.",
    });
    await appendAmaniEvent({
      opportunityId: stored.opportunity.id,
      eventType: emailDelivery.status === "sent" ? "notification_sent" : emailDelivery.status === "suppressed" ? "notification_suppressed" : "notification_failed",
      actor: "amani_notification_workflow",
      idempotencyKey: `amani-opportunity:${stored.opportunity.id}:notification:${emailDelivery.status}`,
      payload: { visitor: emailDelivery.visitor, internal: emailDelivery.internal, failures: emailDelivery.failures },
    });

    return res.status(201).json({
      success: true,
      message: "Your inquiry is in. Amani and the team will review the opportunity and follow up with the right next step.",
      inquiryId: stored.opportunity.id,
      created: stored.created,
    });
  } catch (error) {
    console.error("[Amani] Inquiry capture failed", error);
    return res.status(500).json({ error: "We could not save your inquiry. Please try again." });
  }
});
