import { describe, expect, it } from "vitest";
import { moneyBossesDevelopmentOrigins } from "./_core/moneyBossesDevelopmentOrigins";

describe("Money Bosses development preview origins", () => {
  it("leaves production unchanged", () => {
    expect(moneyBossesDevelopmentOrigins("production", "3004", "https://preview.example.com")).toEqual([]);
  });
  it("accepts only local current port and one explicit HTTPS origin", () => {
    expect(moneyBossesDevelopmentOrigins("development", "3004", "https://preview.example.com")).toEqual(["http://localhost:3004", "http://127.0.0.1:3004", "https://preview.example.com"]);
  });
  it("rejects invalid ports and credential-bearing or path-bearing origins", () => {
    expect(moneyBossesDevelopmentOrigins("development", "invalid", "https://preview.example.com")).toEqual([]);
    for (const origin of ["http://example.com", "https://user:pass@example.com", "https://example.com/path"]) expect(moneyBossesDevelopmentOrigins("development", "3004", origin)).toHaveLength(2);
  });
});
