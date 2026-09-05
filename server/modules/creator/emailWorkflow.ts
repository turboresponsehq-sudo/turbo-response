import { appendCreatorLeadEvent } from "./creatorLeadRepository";
import { deliverCreatorLeadEmails, type CreatorEmailDeliveryResult } from "./emailDelivery";
import type { CreatorLeadEmailData } from "./emailTemplates";

export type CreatorEmailEventWriter = typeof appendCreatorLeadEvent;

async function recordSafely(
  writeEvent: CreatorEmailEventWriter,
  event: Parameters<CreatorEmailEventWriter>[0],
): Promise<void> {
  try {
    await writeEvent(event);
  } catch (error) {
    // The lead already exists. Logging an event failure must never turn a
    // successfully stored Creator inquiry into a failed intake response.
    console.error("[CreatorEmail] Unable to record email outcome", error);
  }
}

/**
 * Runs only after the Creator lead and its lead_created event have persisted.
 * Email outcomes are recorded only in creator_lead_events.
 */
export async function processCreatorLeadEmailWorkflow(
  lead: CreatorLeadEmailData,
  options: {
    deliver?: (data: CreatorLeadEmailData) => Promise<CreatorEmailDeliveryResult>;
    writeEvent?: CreatorEmailEventWriter;
  } = {},
): Promise<CreatorEmailDeliveryResult> {
  const deliver = options.deliver ?? deliverCreatorLeadEmails;
  const writeEvent = options.writeEvent ?? appendCreatorLeadEvent;
  const result = await deliver(lead);
  const baseKey = `creator-lead:${lead.leadId}`;

  if (result.status === "suppressed") {
    await recordSafely(writeEvent, {
      creatorLeadId: lead.leadId,
      eventType: "email_suppressed",
      actor: "creator_email_safety_gate",
      idempotencyKey: `${baseKey}:email-suppressed`,
      payload: { reason: "CREATOR_EMAIL_SENDING_ENABLED is not true." },
    });
    return result;
  }

  if (result.admin === "sent") {
    await recordSafely(writeEvent, {
      creatorLeadId: lead.leadId,
      eventType: "admin_email_sent",
      actor: "creator_email_delivery",
      idempotencyKey: `${baseKey}:admin-email-sent`,
      payload: { recipient: "ZAKHY_ADMIN_EMAIL" },
    });
  }

  if (result.creator === "sent") {
    await recordSafely(writeEvent, {
      creatorLeadId: lead.leadId,
      eventType: "creator_confirmation_sent",
      actor: "creator_email_delivery",
      idempotencyKey: `${baseKey}:creator-confirmation-sent`,
      payload: { recipient: "creator" },
    });
  }

  for (const failure of result.failures) {
    await recordSafely(writeEvent, {
      creatorLeadId: lead.leadId,
      eventType: "email_failed",
      actor: "creator_email_delivery",
      idempotencyKey: `${baseKey}:email-failed:${failure.recipient}`,
      payload: { recipient: failure.recipient, reason: failure.reason },
    });
  }

  return result;
}
