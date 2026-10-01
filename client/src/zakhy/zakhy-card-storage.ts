export const ZAKHY_CARD_URL = "https://turboresponsehq.ai/zakhy/connect";
export const ZAKHY_CARD_STORAGE_KEY = "zakhy-card-local-contacts-v1";

export type ZakhyCardContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  identityCategory: string;
  interestCategories: string[];
  interest: string;
  notes: string;
  source: "Zakhy Card";
  sourceDetail: "In Person QR" | "NFC" | "Direct Link";
  capturedAt: string;
  lastContact: string;
  nextFollowUp: string;
  followUpStatus: "new" | "contacted" | "follow-up due" | "cold";
  eventType: "contact_created" | "contact_updated";
};

export type ZakhyCardDraft = Omit<ZakhyCardContact, "id" | "capturedAt" | "lastContact" | "nextFollowUp" | "followUpStatus" | "eventType" | "source"> & {
  sourceDetail?: ZakhyCardContact["sourceDetail"];
};

export function normalizeContactValue(value: string) {
  return value.trim().toLowerCase();
}

export function findDuplicateContact(contacts: ZakhyCardContact[], draft: ZakhyCardDraft) {
  const email = normalizeContactValue(draft.email);
  const phone = normalizeContactValue(draft.phone).replace(/\D/g, "");
  const company = normalizeContactValue(draft.company);
  const name = normalizeContactValue(draft.name);

  const byEmail = email && contacts.find((contact) => normalizeContactValue(contact.email) === email);
  if (byEmail) return { contact: byEmail, match: "email" as const };

  const byPhone = phone && contacts.find((contact) => normalizeContactValue(contact.phone).replace(/\D/g, "") === phone);
  if (byPhone) return { contact: byPhone, match: "phone" as const };

  const byNameCompany = name && company && contacts.find((contact) => normalizeContactValue(contact.name) === name && normalizeContactValue(contact.company) === company);
  if (byNameCompany) return { contact: byNameCompany, match: "name + company" as const };

  return null;
}

export function upsertLocalContact(contacts: ZakhyCardContact[], draft: ZakhyCardDraft) {
  const duplicate = findDuplicateContact(contacts, draft);
  const now = new Date().toISOString();
  if (duplicate) {
    const updated = contacts.map((contact) => contact.id === duplicate.contact.id ? {
      ...contact,
      ...draft,
      interest: draft.interestCategories.join(", "),
      source: "Zakhy Card" as const,
      sourceDetail: draft.sourceDetail || contact.sourceDetail,
      lastContact: now,
      eventType: "contact_updated" as const,
    } : contact);
    return { contacts: updated, contact: updated.find((contact) => contact.id === duplicate.contact.id)!, duplicate: true, match: duplicate.match };
  }

  const contact: ZakhyCardContact = {
    ...draft,
    interest: draft.interestCategories.join(", "),
    id: `local-${Date.now()}`,
    source: "Zakhy Card",
    sourceDetail: draft.sourceDetail || "In Person QR",
    capturedAt: now,
    lastContact: now,
    nextFollowUp: "",
    followUpStatus: "new",
    eventType: "contact_created",
  };
  return { contacts: [contact, ...contacts], contact, duplicate: false, match: null };
}

export function loadLocalContacts(): ZakhyCardContact[] {
  try {
    const raw = window.localStorage.getItem(ZAKHY_CARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) as ZakhyCardContact[] : [];
  } catch {
    return [];
  }
}

export function saveLocalContacts(contacts: ZakhyCardContact[]) {
  window.localStorage.setItem(ZAKHY_CARD_STORAGE_KEY, JSON.stringify(contacts));
}

export function makeVCard() {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Zakhy",
    "ORG:Zakhy Builds AI",
    "TITLE:Creator Automation Systems",
    "EMAIL:turboresponsehq@gmail.com",
    "URL:https://turboresponsehq.ai/zakhybuildsai",
    "URL;TYPE=Instagram:https://instagram.com/zakhybuildsai",
    "NOTE:Automating systems for creators and creator businesses.",
    "END:VCARD",
  ].join("\r\n");
}
