import { describe, it, expect } from "vitest";
import { executeCommand } from "@/lib/commands";
import { profile } from "@/content/profile";

describe("executeCommand", () => {
  it("returns output for known commands", () => {
    const result = executeCommand("whoami");
    expect(result).toContain(profile.name.toLowerCase());
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

  it("includes stack data", () => {
    const result = executeCommand("stack");
    expect(result).toContain("languages");
    expect(result).toContain("TypeScript");
  });

  it("includes experience data", () => {
    const result = executeCommand("experience");
    expect(result).toContain(profile.experience[0].company);
  });

  it("includes resume links", () => {
    const result = executeCommand("resume");
    expect(result).toContain("/resume");
    expect(result).toContain("download");
  });
});
