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

export const AUTO_COMMANDS = ["whoami", "neofetch", "stack", "contact"] as const;

export const QUICK_COMMANDS = [] as const;

export type CommandResult = string | null;
type CommandHandler = string | (() => CommandResult);

const commandMap: Record<string, CommandHandler> = {
  whoami: `<span class="text-orange glow-orange font-semibold">${h(profile.name.toLowerCase())}</span> <span class="text-muted">—</span> ${h(profile.role.toLowerCase())}, ${h(profile.focus.toLowerCase())}, ${h(profile.location.toLowerCase())}.`,

  neofetch: () => {
    return `<div class="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm">
<pre class="text-blue leading-none text-xs hidden sm:block opacity-70">       /\\
       /  \\
      /\\   \\
     /  ..  \\
    /  '  '  \\
   / ..'  '.. \\
  /_____/\\_____\\</pre>
<div class="flex flex-col gap-0.5">
<span><span class="text-orange font-bold glow-orange">${h(profile.name.split(" ")[0].toLowerCase())}</span><span class="text-muted">@</span><span class="text-orange font-bold glow-orange">${h(profile.location.toLowerCase())}</span></span>
<span class="text-muted/30">──────────────</span>
<span><span class="text-orange">os</span>     <span class="text-text-dim">${h(profile.terminal.os)}</span></span>
<span><span class="text-orange">editor</span> <span class="text-text-dim">${h(profile.terminal.editor)}</span></span>
<span><span class="text-orange">lang</span>   <span class="text-text-dim">${h(profile.skills.Languages.join(", "))}</span></span>
<span><span class="text-orange">focus</span>  <span class="text-text-dim">${h(profile.focus.toLowerCase())} @ ${h(profile.currentCompany)}</span></span>
<span><span class="text-orange">events</span> <span class="text-text-dim">${h(profile.terminal.events)}</span></span>
<span class="mt-1"><span class="inline-block w-2 h-2 bg-red rounded-sm"></span> <span class="inline-block w-2 h-2 bg-orange rounded-sm"></span> <span class="inline-block w-2 h-2 bg-yellow rounded-sm"></span> <span class="inline-block w-2 h-2 bg-green rounded-sm"></span> <span class="inline-block w-2 h-2 bg-blue rounded-sm"></span> <span class="inline-block w-2 h-2 bg-purple rounded-sm"></span></span>
</div>
</div>`;
  },

  stack: `${Object.entries(profile.skills)
    .map(
      ([group, entries]) =>
        `<span class="text-orange w-28 inline-block shrink-0">${h(group.toLowerCase())}</span><span class="text-text-dim">${h(entries.join(" · "))}</span>`
    )
    .join("\n")}`,

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
