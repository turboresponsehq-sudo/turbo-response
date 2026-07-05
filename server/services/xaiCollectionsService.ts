/**
 * xAI Collections Service
 * Manages creation, retrieval, and deletion of xAI Collections
 * Used for storing and retrieving knowledge base documents at runtime
 */

import { ENV } from "../_core/env";

interface CollectionResponse {
  collection_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface CollectionsListResponse {
  collections: CollectionResponse[];
}

class XAICollectionsService {
  private managementKey: string;
  private apiBaseUrl = "https://management-api.x.ai/v1";

  constructor() {
    this.managementKey = process.env.XAI_MANAGEMENT_API_KEY || "";
    if (!this.managementKey) {
      throw new Error("XAI_MANAGEMENT_API_KEY is not configured");
    }
  }

  /**
   * Create a new Collection in xAI
   */
  async createCollection(
    name: string,
    description?: string
  ): Promise<CollectionResponse> {
    const response = await fetch(`${this.apiBaseUrl}/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.managementKey}`,
      },
      body: JSON.stringify({
        collection_name: name,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to create collection: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    const data = (await response.json()) as CollectionResponse;
    return data;
  }

  /**
   * List all Collections
   */
  async listCollections(): Promise<CollectionResponse[]> {
    const response = await fetch(`${this.apiBaseUrl}/collections`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.managementKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to list collections: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    const data = (await response.json()) as CollectionsListResponse;
    return data.collections || [];
  }

  /**
   * Get a specific Collection by ID
   */
  async getCollection(collectionId: string): Promise<CollectionResponse> {
    const response = await fetch(`${this.apiBaseUrl}/collections/${collectionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.managementKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to get collection: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    const data = (await response.json()) as CollectionResponse;
    return data;
  }

  /**
   * Delete a Collection by ID
   */
  async deleteCollection(collectionId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/collections/${collectionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.managementKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to delete collection: ${response.status} - ${JSON.stringify(error)}`
      );
    }
  }

  /**
   * Upload a document to a Collection
   */
  async uploadDocument(
    collectionId: string,
    fileName: string,
    fileContent: Buffer | string | Uint8Array,
    metadata?: Record<string, string>
  ): Promise<{ document_id: string }> {
    const formData = new FormData();
    const blob = new Blob([fileContent as any], { type: "application/octet-stream" });
    formData.append("file", blob, fileName);
    formData.append("name", fileName);
    formData.append("content_type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await fetch(
      `${this.apiBaseUrl}/collections/${collectionId}/documents`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.managementKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(
          `Failed to upload document: ${response.status} - ${JSON.stringify(error)}`
        );
      } catch {
        throw new Error(
          `Failed to upload document: ${response.status} - ${text.substring(0, 200)}`
        );
      }
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text) as { document_id: string };
      return data;
    } catch {
      // If response is not JSON, try to extract document_id from text
      throw new Error(`Invalid response format: ${text.substring(0, 200)}`);
    }
  }

  /**
   * List documents in a Collection
   */
  async listDocuments(collectionId: string): Promise<Array<{ document_id: string; name: string }>> {
    const response = await fetch(
      `${this.apiBaseUrl}/collections/${collectionId}/documents`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.managementKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to list documents: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    const data = (await response.json()) as { documents: Array<{ document_id: string; name: string }> };
    return data.documents || [];
  }

  /**
   * Delete a document from a Collection
   */
  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    const response = await fetch(
      `${this.apiBaseUrl}/collections/${collectionId}/documents/${documentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.managementKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to delete document: ${response.status} - ${JSON.stringify(error)}`
      );
    }
  }
}

// Singleton instance
let instance: XAICollectionsService | null = null;

export function getXAICollectionsService(): XAICollectionsService {
  if (!instance) {
    instance = new XAICollectionsService();
  }
  return instance;
}

export type { CollectionResponse, CollectionsListResponse };
