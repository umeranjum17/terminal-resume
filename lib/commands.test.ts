import { describe, it, expect } from "vitest";
import { executeCommand } from "@/lib/commands";

describe("executeCommand", () => {
  it("returns output for known commands", () => {
    const result = executeCommand("help");
    expect(result).toContain("commands:");
  });

  it("returns null for clear", () => {
    const result = executeCommand("clear");
    expect(result).toBeNull();
  });

  it("returns error for unknown commands", () => {
    const result = executeCommand("notarealcommand");
    expect(result).toContain("command not found");
  });

  it("escapes unknown command output", () => {
    const result = executeCommand("<img src=x onerror=alert(1)>");
    expect(result).toContain("&lt;img");
    expect(result).not.toContain("<img");
  });

  it("adds safe rel attributes to external links", () => {
    const result = executeCommand("contact");
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("handles aliases", () => {
    const exp = executeCommand("exp");
    const experience = executeCommand("experience");
    expect(exp).toBe(experience);
  });
});
