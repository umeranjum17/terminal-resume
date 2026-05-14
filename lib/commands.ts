import { profile } from "@/content/profile";

function h(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return h(value);
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return h(url.toString());
    }
  } catch {
    return "#";
  }
  return "#";
}

function link(url: string, label: string, color = "text-blue") {
  return `<a href="${safeHref(url)}" class="${color} terminal-link" target="_blank" rel="noopener noreferrer">${h(label)}</a>`;
}

function internalLink(url: string, label: string, color = "text-blue") {
  return `<a href="${safeHref(url)}" class="${color} terminal-link">${h(label)}</a>`;
}

export const AUTO_COMMANDS = ["whoami", "experience", "stack", "resume"] as const;

export const QUICK_COMMANDS = [] as const;

export type CommandResult = string | null;
type CommandHandler = string | (() => CommandResult);

const commandMap: Record<string, CommandHandler> = {
  whoami: `<span class="text-orange glow-orange font-semibold">${h(profile.name.toLowerCase())}</span> <span class="text-muted">—</span> ${h(profile.role.toLowerCase())}, ${h(profile.focus.toLowerCase())}, ${h(profile.location.toLowerCase())}.`,

  experience: profile.experience
    .map(
      (job) =>
        `<span class="text-blue glow-blue font-semibold">${h(job.company)}</span>  <span class="text-text-dim">${h(job.title)}</span>  <span class="text-muted">${h(job.dates)}</span>`
    )
    .join("\n"),

  stack: `${Object.entries(profile.skills)
    .map(
      ([group, entries]) =>
        `<div class="text-sm"><span class="text-orange font-medium">${h(group.toLowerCase())}</span><span class="text-muted mx-2">·</span><span class="text-text-dim">${h(entries.join(" · "))}</span></div>`
    )
    .join("\n")}`,

  resume: `<span class="text-orange w-20 inline-block shrink-0">resume</span> ${internalLink("/resume", "view full resume →", "text-blue")}
<span class="text-orange w-20 inline-block shrink-0">download</span> ${internalLink("/resume?download=true", "download pdf →", "text-blue")}`,

  contact: `<span class="text-orange w-16 inline-block shrink-0">email</span>  ${link("mailto:" + profile.email, profile.email, "text-blue")}
<span class="text-orange w-16 inline-block shrink-0">web</span>    ${link(profile.websiteUrl, profile.website, "text-blue")}
<span class="text-orange w-16 inline-block shrink-0">github</span> ${link(profile.githubUrl, profile.github, "text-blue")}
<span class="text-orange w-16 inline-block shrink-0">linkedin</span> ${link(profile.linkedinUrl, profile.linkedin, "text-blue")}`,

  clear: () => null,
};

export const COMMAND_NAMES = Object.keys(commandMap);

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();

  const handler = commandMap[trimmed];
  if (handler === undefined) {
    return `<span class="text-red">command not found: ${h(trimmed)}</span>`;
  }

  if (typeof handler === "function") return handler();
  return handler;
}
