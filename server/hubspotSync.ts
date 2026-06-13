/**
 * HubSpot Sync Module
 * Handles syncing intake leads and conversations to HubSpot CRM
 */

import axios from 'axios';

const HUBSPOT_API_KEY = process.env.HUBSPOT_PRIVATE_APP_TOKEN || '';

if (!HUBSPOT_API_KEY) {
  console.warn('[HubSpot] HUBSPOT_PRIVATE_APP_TOKEN not set in environment');
}
const HUBSPOT_BASE = 'https://api.hubapi.com';

interface ContactData {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  hs_lead_status?: string;
  lifecyclestage?: string;
}

/**
 * Search for existing contact by email to avoid duplicates
 */
export async function findContactByEmail(email: string): Promise<string | null> {
  try {
    const response = await axios.post(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/search`,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const results = response.data.results || [];
    return results.length > 0 ? results[0].id : null;
  } catch (error) {
    console.error('[HubSpot] Error searching for contact:', error);
    return null;
  }
}

/**
 * Create a new contact in HubSpot
 */
export async function createContact(data: ContactData): Promise<string | null> {
  try {
    const response = await axios.post(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts`,
      {
        properties: data,
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id || null;
  } catch (error) {
    console.error('[HubSpot] Error creating contact:', error);
    return null;
  }
}

/**
 * Update an existing contact in HubSpot
 */
export async function updateContact(contactId: string, data: ContactData): Promise<boolean> {
  try {
    await axios.patch(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/${contactId}`,
      {
        properties: data,
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return true;
  } catch (error) {
    console.error('[HubSpot] Error updating contact:', error);
    return false;
  }
}

/**
 * Sync or create a contact in HubSpot
 * Returns the HubSpot contact ID
 */
export async function syncContactToHubSpot(data: ContactData): Promise<string | null> {
  if (!data.email) {
    console.warn('[HubSpot] Cannot sync contact without email');
    return null;
  }

  // Check if contact already exists
  const existingId = await findContactByEmail(data.email);

  if (existingId) {
    // Update existing contact
    const updated = await updateContact(existingId, data);
    if (updated) {
      console.log(`[HubSpot] Updated contact ${existingId} for ${data.email}`);
      return existingId;
    }
  } else {
    // Create new contact
    const newId = await createContact(data);
    if (newId) {
      console.log(`[HubSpot] Created contact ${newId} for ${data.email}`);
      return newId;
    }
  }

  return null;
}
