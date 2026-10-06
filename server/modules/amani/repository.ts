import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { AMANI_CLIENT_KEY, AMANI_RELATIONSHIP_OWNER, type AmaniInquiryInput, type AmaniOpportunity } from "./types";

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: unknown[] }).rows as any[] ?? [];
  }
  return [];
}

function nullable(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function cleanObject<T extends Record<string, string | undefined>>(value: T | undefined) {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([, item]) => Boolean(item?.trim())));
}

export async function createAmaniInquiry(input: AmaniInquiryInput, metadata: { referrer?: string; ip?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Amani inquiry storage is unavailable");

  const email = input.email.toLowerCase();
  const relationshipResult = await db.execute(sql`
    INSERT INTO amani_creator_automations.relationships AS amani_relationship (
      creator_client_key, email, full_name, phone, organization, contact_role, city, brand_or_social,
      original_source, landing_page, referrer, utm_data, relationship_type,
      relationship_strength, relationship_owner, implementation_owner, handoff_destination, next_action
    ) VALUES (
      ${AMANI_CLIENT_KEY}, ${email}, ${input.fullName}, ${nullable(input.phone)},
      ${nullable(input.organization)}, ${nullable(input.role)}, ${nullable(input.city)}, ${nullable(input.brandOrSocial)},
      ${input.source?.trim() || "Amani Website"}, ${nullable(input.landingPage || input.sourcePath)},
      ${nullable(metadata.referrer)}, ${JSON.stringify(cleanObject(input.utm))},
      ${"Potential client relationship"}, ${"new"}, ${AMANI_RELATIONSHIP_OWNER},
      ${AMANI_RELATIONSHIP_OWNER}, ${AMANI_RELATIONSHIP_OWNER},
      ${"Review Amani website inquiry and recommend the next action."}
    )
    ON CONFLICT (creator_client_key, email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, amani_relationship.phone),
      organization = COALESCE(EXCLUDED.organization, amani_relationship.organization),
      contact_role = COALESCE(EXCLUDED.contact_role, amani_relationship.contact_role),
      city = COALESCE(EXCLUDED.city, amani_relationship.city),
      brand_or_social = COALESCE(EXCLUDED.brand_or_social, amani_relationship.brand_or_social),
      landing_page = COALESCE(EXCLUDED.landing_page, amani_relationship.landing_page),
      referrer = COALESCE(EXCLUDED.referrer, amani_relationship.referrer),
      utm_data = CASE WHEN EXCLUDED.utm_data::text <> '{}' THEN EXCLUDED.utm_data ELSE amani_relationship.utm_data END,
      updated_at = NOW()
    RETURNING id, hubspot_contact_id
  `);
  const relationship = rowsOf(relationshipResult)[0];
  if (!relationship) throw new Error("Amani relationship could not be saved");

  const opportunityResult = await db.execute(sql`
    INSERT INTO amani_creator_automations.opportunities (
      relationship_id, client_submission_id, opportunity_type, business_pathway,
      what_they_are_building, primary_challenge, operating_stage, timeline,
      budget_range, notes, opportunity_owner, relationship_owner,
      implementation_owner, handoff_destination, next_action, source,
      source_path, landing_page, utm_data, is_internal_test, hubspot_sync_status
    ) VALUES (
      ${Number(relationship.id)}, ${input.clientSubmissionId}, ${input.goal}, ${"Amani Website Inquiry"},
      ${input.goal}, ${input.challenge}, ${input.stage}, ${input.timeline},
      ${nullable(input.investment)}, ${nullable(input.notes)}, ${AMANI_RELATIONSHIP_OWNER},
      ${AMANI_RELATIONSHIP_OWNER}, ${AMANI_RELATIONSHIP_OWNER}, ${AMANI_RELATIONSHIP_OWNER},
      ${"Review inquiry and recommend the next relationship or campaign action."},
      ${input.source?.trim() || "Amani Website"}, ${nullable(input.sourcePath)},
      ${nullable(input.landingPage || input.sourcePath)}, ${JSON.stringify(cleanObject(input.utm))},
      ${Boolean(input.isInternalTest)}, ${process.env.AMANI_HUBSPOT_SYNC_ENABLED === "true" ? "pending" : "disabled"}
    )
    ON CONFLICT (client_submission_id) DO NOTHING
    RETURNING id, relationship_id, client_submission_id, created_at, hubspot_contact_id, hubspot_note_id, hubspot_sync_status, is_internal_test
  `);

  let opportunity = rowsOf(opportunityResult)[0];
  const created = Boolean(opportunity);
  if (!opportunity) {
    const existing = await db.execute(sql`
      SELECT id, relationship_id, client_submission_id, created_at, hubspot_contact_id, hubspot_note_id, hubspot_sync_status, is_internal_test
      FROM amani_creator_automations.opportunities
      WHERE client_submission_id = ${input.clientSubmissionId}
      LIMIT 1
    `);
    opportunity = rowsOf(existing)[0];
  }
  if (!opportunity) throw new Error("Amani opportunity could not be saved");

  const normalized = normalizeOpportunity(opportunity);
  if (created) {
    await appendAmaniEvent({
      opportunityId: normalized.id,
      eventType: "inquiry_submitted",
      actor: "public_amani_website",
      idempotencyKey: `amani-opportunity:${normalized.id}:submitted`,
      payload: {
        source: input.source?.trim() || "Amani Website",
        sourcePath: input.sourcePath ?? null,
        landingPage: input.landingPage ?? input.sourcePath ?? null,
        ipRecorded: Boolean(metadata.ip),
        relationshipOwner: AMANI_RELATIONSHIP_OWNER,
        handoffDestination: AMANI_RELATIONSHIP_OWNER,
      },
    });
  }

  return {
    opportunity: normalized,
    created,
    relationship: {
      id: Number(relationship.id),
      hubspotContactId: relationship.hubspot_contact_id ? String(relationship.hubspot_contact_id) : null,
    },
  };
}

export async function appendAmaniEvent(event: {
  opportunityId: number;
  eventType: string;
  actor: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Amani event storage is unavailable");
  await db.execute(sql`
    INSERT INTO amani_creator_automations.opportunity_events (opportunity_id, event_type, actor, payload, idempotency_key)
    VALUES (${event.opportunityId}, ${event.eventType}, ${event.actor}, ${JSON.stringify(event.payload ?? {})}, ${event.idempotencyKey})
    ON CONFLICT (idempotency_key) DO NOTHING
  `);
}

export async function setAmaniHubSpotSync(input: {
  opportunityId: number;
  relationshipId: number;
  contactId?: string | null;
  noteId?: string | null;
  status: "synced" | "failed" | "disabled";
  error?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Amani inquiry storage is unavailable");

  if (input.contactId) {
    await db.execute(sql`
      UPDATE amani_creator_automations.relationships
      SET hubspot_contact_id = ${input.contactId}, updated_at = NOW()
      WHERE id = ${input.relationshipId}
    `);
  }

  await db.execute(sql`
    UPDATE amani_creator_automations.opportunities
    SET hubspot_contact_id = COALESCE(${input.contactId ?? null}, hubspot_contact_id),
        hubspot_note_id = COALESCE(${input.noteId ?? null}, hubspot_note_id),
        hubspot_sync_status = ${input.status},
        hubspot_sync_error = ${nullable(input.error)},
        updated_at = NOW()
    WHERE id = ${input.opportunityId}
  `);
}

function normalizeOpportunity(value: any): AmaniOpportunity {
  return {
    id: Number(value.id),
    relationshipId: Number(value.relationship_id),
    clientSubmissionId: String(value.client_submission_id),
    createdAt: String(value.created_at),
    hubspotContactId: value.hubspot_contact_id ? String(value.hubspot_contact_id) : null,
    hubspotNoteId: value.hubspot_note_id ? String(value.hubspot_note_id) : null,
    hubspotSyncStatus: value.hubspot_sync_status,
    isInternalTest: Boolean(value.is_internal_test),
  };
}
