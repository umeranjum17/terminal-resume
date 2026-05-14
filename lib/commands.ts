import { copy, profile } from "@/content/profile";

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

function externalLink(url: string, label: string, className = "text-blue underline") {
  return `<a href="${safeHref(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${h(label)}</a>`;
}

function internalLink(
  url: string,
  label: string,
  className = "text-blue underline hover:text-orange"
) {
  return `<a href="${safeHref(url)}" class="${className}">${h(label)}</a>`;
}

const textColorMap = {
  orange: "text-orange",
  green: "text-green",
  blue: "text-blue",
  purple: "text-purple",
  yellow: "text-yellow",
} as const;

function skillBar(level: number) {
  const filled = Math.round(level / 5);
  return `${"█".repeat(filled)}${"░".repeat(Math.max(0, 20 - filled))}`;
}

export const BOOT_LINES = copy.terminal.bootLines.map(
  (line) => `[ <span class='text-green'>OK</span> ] ${h(line)}`
);

export const ASCII_BANNER = `<span class="text-orange glow-orange font-bold text-lg">${h(profile.name.toLowerCase())}</span> <span class="text-muted">·</span> <span class="text-text">${h(profile.role.toLowerCase())}</span> <span class="text-muted">·</span> <span class="text-blue glow-blue">${h(profile.focus.toLowerCase())}</span> <span class="text-muted">·</span> <span class="text-text">${h(profile.location.toLowerCase())}</span>`;

export const AUTO_COMMANDS = ["about", "experience", "projects", "stack", "contact"] as const;

export const QUICK_COMMANDS = ["neofetch", "highlights", "resume", "social", "help"] as const;

export type CommandResult = string | null;
type CommandHandler = string | (() => CommandResult);

const commandMap: Record<string, CommandHandler> = {
  help: `<span class="text-yellow">${h(copy.terminal.commandsLabel)}</span>  ${[
    "about",
    "highlights",
    "experience",
    "projects",
    "stack",
    "skills",
    "resume",
    "contact",
    "social",
    "neofetch",
  ]
    .map((cmd) => `<span class="text-green cursor-pointer" data-cmd="${h(cmd)}">${h(cmd)}</span>`)
    .join(" · ")}
<span class="text-muted">${h(copy.terminal.utilsLabel)}</span>     <span class="text-muted">whoami · clear · ls · pwd · date</span>
<span class="text-muted">${h(copy.terminal.tipsLabel)}</span>      <span class="text-muted">${h(copy.terminal.tips)}</span>`,

  whoami: `<span class="text-orange glow-orange">${h(profile.name.toLowerCase())}</span> — ${h(profile.role.toLowerCase())}, ${h(profile.focus.toLowerCase())}, ${h(profile.location.toLowerCase())}.`,

  about: `<span class="text-orange glow-orange">${h(profile.role.toLowerCase())}</span> at <span class="text-blue glow-blue">${h(profile.currentCompany.toLowerCase())}</span> — ${h(profile.currentTeam.toLowerCase())} team.

${h(profile.headline)}
${h(profile.summary)}

previously: ${profile.experience
    .slice(1)
    .map((job) => `<span class="text-blue glow-blue">${h(job.company.toLowerCase())}</span>`)
    .join(" · ")}

by night: ${profile.projects.map((project) => `<span class="text-purple glow-purple">${h(project.name.toLowerCase())}</span>`).join(" · ")}

i believe in ${profile.terminal.beliefs.map((belief) => `<span class="text-orange glow-orange">${h(belief)}</span>`).join(", ")}
and ${h(profile.terminal.closingLine)}
based in <span class="text-blue glow-blue">${h(profile.location.toLowerCase())}</span>`,

  highlights: `<span class="text-orange glow-orange">${h(copy.resume.highlights.toUpperCase())}</span>

${profile.highlights.map((highlight) => `<span class="text-muted">▸</span> ${h(highlight)}`).join("\n\n")}`,

  experience: `<span class="text-orange glow-orange">${h(copy.resume.experience.toUpperCase())}</span>

${profile.experience
  .map(
    (
      job
    ) => `<span class="text-blue glow-blue">${h(job.company)}</span>          <span class="text-orange">${h(job.title)}</span>     <span class="text-muted">${h(job.dates)}</span>
<span class="text-muted">  ${h(job.terminalSummary)}</span>`
  )
  .join("\n\n")}

<span class="text-muted">${h(copy.terminal.typeResume)}</span>`,

  projects: `<span class="text-orange glow-orange">${h(copy.resume.selectedProjects.toUpperCase())}</span>

${profile.projects.map((project) => `<span class="text-orange glow-orange">${h(project.name.toUpperCase())}</span>   <span class="text-muted">${h(project.webDescription)}</span>${project.link ? `\n<span class="text-green">${h(project.link)}</span>` : ""}`).join("\n\n")}`,

  stack: `<span class="text-orange glow-orange">${h(copy.resume.technicalStack.toUpperCase())}</span>

${Object.entries(profile.skills)
  .map(
    ([group, entries]) =>
      `<span class="text-yellow">${h(group.toLowerCase())}</span>  <span class="text-text">${h(entries.join(" · "))}</span>`
  )
  .join("\n")}`,

  skills: profile.terminal.skillBars
    .map((skill) => {
      const color = textColorMap[skill.color];
      return `<span class="${color}">${h(skill.name)}</span> <span class="text-green">${skillBar(skill.level)}</span> ${skill.level}%`;
    })
    .join("\n"),

  resume: `<span class="text-blue">→</span> ${internalLink("/resume", copy.terminal.viewFullResume)}  <span class="text-blue">→</span> ${internalLink("/resume?download=true", copy.terminal.downloadPdfLower)}`,

  contact: `<span class="text-orange">${h(copy.terminal.email)}</span>     <span class="text-blue glow-blue">${h(profile.email)}</span>
<span class="text-orange">${h(copy.terminal.web)}</span>       ${externalLink(profile.websiteUrl, profile.website)}
<span class="text-orange">${h(copy.terminal.github)}</span>    ${externalLink(profile.githubUrl, profile.github)}
<span class="text-orange">${h(copy.terminal.linkedin)}</span>  ${externalLink(profile.linkedinUrl, profile.linkedin)}
<span class="text-muted">${h(copy.terminal.fastestContact)}</span>`,

  social: `<span class="text-orange">${h(copy.terminal.github)}</span>    ${externalLink(profile.githubUrl, profile.github)}
<span class="text-orange">${h(copy.terminal.linkedin)}</span>  ${externalLink(profile.linkedinUrl, profile.linkedin)}
<span class="text-orange">${h(copy.terminal.web)}</span>       ${externalLink(profile.websiteUrl, profile.website)}`,

  neofetch: () => {
    return `<div class="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
<pre class="text-blue leading-none text-xs hidden sm:block">       /\\
       /  \\
      /\\   \\
     /  ..  \\
    /  '  '  \\
   / ..'  '.. \\
  /_____/\\_____\\</pre>
<div class="flex flex-col gap-0.5">
<span><span class="text-orange font-bold glow-orange">${h(profile.name.split(" ")[0].toLowerCase())}</span><span class="text-muted">@</span><span class="text-orange font-bold glow-orange">${h(profile.location.toLowerCase())}</span></span>
<span class="text-muted">──────────────</span>
<span><span class="text-orange">${h(copy.terminal.os)}</span> ${h(profile.terminal.os)}</span>
<span><span class="text-orange">${h(copy.terminal.editor)}</span> ${h(profile.terminal.editor)}</span>
<span><span class="text-orange">${h(copy.terminal.languages)}</span> ${h(profile.skills.Languages.join(", "))}</span>
<span><span class="text-orange">${h(copy.terminal.focus)}</span> ${h(profile.focus.toLowerCase())} @ ${h(profile.currentCompany)}</span>
<span><span class="text-orange">${h(copy.terminal.events)}</span> ${h(profile.terminal.events)}</span>
<span><span class="text-orange">${h(copy.terminal.side)}</span> ${h(profile.projects.map((project) => project.name.toLowerCase()).join(" · "))}</span>
<span><span class="text-orange">${h(copy.terminal.beyond)}</span> ${h(profile.terminal.neofetchBeyond)}</span>
<span><span class="inline-block w-2.5 h-2.5 bg-red rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-orange rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-yellow rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-green rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-blue rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-purple rounded-sm"></span></span>
</div>
</div>`;
  },

  clear: () => null,

  ls: profile.terminal.files
    .map((file) => {
      const color = file.endsWith("/")
        ? "text-green"
        : file.startsWith(".")
          ? "text-purple"
          : file.endsWith(".pdf")
            ? "text-blue"
            : "text-blue";
      return `<span class="${color}">${h(file)}</span>`;
    })
    .join("  "),

  pwd: `<span class="text-blue">${h(profile.terminal.path)}</span>`,

  date: () => {
    const now = new Date();
    return `<span class="text-text">${now.toUTCString()}</span>`;
  },
};

// Aliases
commandMap.exp = commandMap.experience;
commandMap.hl = commandMap.highlights;

export const COMMAND_NAMES = Object.keys(commandMap).filter((k) => !["exp", "hl"].includes(k));

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();

  const egg = easterEggs[trimmed];
  if (egg !== undefined) return egg;

  const handler = commandMap[trimmed];
  if (handler === undefined) {
    return `<span class="text-red">${h(copy.terminal.commandNotFound)}: ${h(trimmed)}</span>. <span class="text-green">${h(copy.terminal.availableCommandsHint)}</span>`;
  }

  if (typeof handler === "function") return handler();
  return handler;
}

const easterEggs: Record<string, string> = Object.fromEntries(
  Object.entries(profile.terminal.easterEggs).map(([command, response]) => [
    command,
    `<span class="text-muted">${h(response)}</span>`,
  ])
);
