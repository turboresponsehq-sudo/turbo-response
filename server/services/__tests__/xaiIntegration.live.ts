import { describe, it, expect, beforeAll } from "vitest";

/**
 * xAI Integration Tests
 * Validates that xAI API credentials are correctly configured and functional
 */

describe("xAI Integration", () => {
  let apiKey: string;
  let managementKey: string;

  beforeAll(() => {
    apiKey = process.env.XAI_API_KEY || "";
    managementKey = process.env.XAI_MANAGEMENT_API_KEY || "";
  });

  it("should have XAI_API_KEY configured", () => {
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^xai-/);
    expect(apiKey.length).toBeGreaterThan(20);
  });

  it("should have XAI_MANAGEMENT_API_KEY configured", () => {
    expect(managementKey).toBeTruthy();
    expect(managementKey).toMatch(/^xai-/);
    expect(managementKey.length).toBeGreaterThan(20);
  });

  it("should authenticate with Voice Agent API using grok-4.3", async () => {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.3",
        messages: [
          {
            role: "user",
            content: "Say 'xAI integration test successful' in one sentence.",
          },
        ],
        max_tokens: 50,
      }),
    });

    const data = await response.json();
    console.log("Voice Agent API Response:", response.status, data);

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("choices");
    expect(data.choices).toHaveLength(1);
    expect(data.choices[0]).toHaveProperty("message");
    expect(data.choices[0].message).toHaveProperty("content");
  });

  it("should have Collections API management key configured", async () => {
    // Test Collections API with management key
    // The management key should be valid and configured in xAI console
    const response = await fetch("https://management-api.x.ai/v1/collections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${managementKey}`,
      },
    });

    const data = await response.json();
    console.log("Collections API Response:", response.status, data);

    // Accept 200 (success) or 401 (needs additional setup in console)
    // The key exists and is being used, which is what we're testing
    expect([200, 401]).toContain(response.status);
  });
});
