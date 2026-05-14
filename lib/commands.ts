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

function externalLink(
  url: string,
  label: string,
  className = "text-blue hover:text-orange transition-colors duration-200"
) {
  return `<a href="${safeHref(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${h(label)}</a>`;
}

function internalLink(
  url: string,
  label: string,
  className = "text-blue hover:text-orange transition-colors duration-200"
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

export const ASCII_BANNER = `<span class="text-orange glow-orange font-bold text-sm sm:text-base tracking-wide">${h(profile.name.toLowerCase())}</span> <span class="text-muted/60 mx-1">·</span> <span class="text-text">${h(profile.role.toLowerCase())}</span> <span class="text-muted/60 mx-1">·</span> <span class="text-blue glow-blue">${h(profile.focus.toLowerCase())}</span> <span class="text-muted/60 mx-1">·</span> <span class="text-text">${h(profile.location.toLowerCase())}</span>`;

export const AUTO_COMMANDS = ["about", "experience", "projects", "stack", "contact"] as const;

export const QUICK_COMMANDS = ["neofetch", "highlights", "resume", "social", "help"] as const;

export type CommandResult = string | null;
type CommandHandler = string | (() => CommandResult);

const commandMap: Record<string, CommandHandler> = {
  help: `<span class="text-yellow font-semibold">${h(copy.terminal.commandsLabel)}</span>  ${[
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
    .map(
      (cmd) =>
        `<span class="text-green glow-green cursor-pointer cmd-link" data-cmd="${h(cmd)}">${h(cmd)}</span>`
    )
    .join(" <span class='text-muted/40'>·</span> ")}
<span class="text-muted/60 block mt-1">${h(copy.terminal.utilsLabel)}     <span class="text-muted/80">whoami · clear · ls · pwd · date</span></span>
<span class="text-muted/60">${h(copy.terminal.tipsLabel)}      <span class="text-muted/80">${h(copy.terminal.tips)}</span></span>`,

  whoami: `<span class="text-orange glow-orange font-semibold">${h(profile.name.toLowerCase())}</span> <span class="text-muted/60">—</span> ${h(profile.role.toLowerCase())}, ${h(profile.focus.toLowerCase())}, ${h(profile.location.toLowerCase())}.`,

  about: `<span class="text-orange glow-orange font-semibold">${h(profile.role.toLowerCase())}</span> <span class="text-muted/60">@</span> <span class="text-blue glow-blue font-semibold">${h(profile.currentCompany.toLowerCase())}</span> <span class="text-muted/60">—</span> ${h(profile.currentTeam.toLowerCase())} team.

${h(profile.headline)}
${h(profile.summary)}

<span class="text-muted/60">previously:</span> ${profile.experience
    .slice(1)
    .map(
      (job) =>
        `<span class="text-blue glow-blue cmd-link" data-cmd="experience">${h(job.company.toLowerCase())}</span>`
    )
    .join(" <span class='text-muted/40'>·</span> ")}

<span class="text-muted/60">by night:</span> ${profile.projects.map((project) => `<span class="text-purple glow-purple cmd-link" data-cmd="projects">${h(project.name.toLowerCase())}</span>`).join(" <span class='text-muted/40'>·</span> ")}

<span class="text-muted/60">i believe in</span> ${profile.terminal.beliefs.map((belief) => `<span class="text-orange glow-orange">${h(belief)}</span>`).join(", ")}
<span class="text-muted/60">and</span> ${h(profile.terminal.closingLine)}
<span class="text-muted/60">based in</span> <span class="text-blue glow-blue">${h(profile.location.toLowerCase())}</span>`,

  highlights: `<span class="text-orange glow-orange font-semibold tracking-wide">${h(copy.resume.highlights.toUpperCase())}</span>

${profile.highlights.map((highlight) => `<span class="text-green/60 mr-2">▸</span>${h(highlight)}`).join("\n\n")}`,

  experience: `<span class="text-orange glow-orange font-semibold tracking-wide">${h(copy.resume.experience.toUpperCase())}</span>

${profile.experience
  .map(
    (
      job
    ) => `<span class="text-blue glow-blue font-semibold">${h(job.company)}</span>          <span class="text-orange">${h(job.title)}</span>     <span class="text-muted/50">${h(job.dates)}</span>
<span class="text-muted/70 pl-4">${h(job.terminalSummary)}</span>`
  )
  .join("\n\n")}

<span class="text-muted/50 italic">${h(copy.terminal.typeResume)}</span>`,

  projects: `<span class="text-orange glow-orange font-semibold tracking-wide">${h(copy.resume.selectedProjects.toUpperCase())}</span>

${profile.projects.map((project) => `<span class="text-orange glow-orange font-semibold">${h(project.name.toUpperCase())}</span>   <span class="text-muted/70">${h(project.webDescription)}</span>${project.link ? `\n<span class="text-green/80 text-xs">${h(project.link)}</span>` : ""}`).join("\n\n")}`,

  stack: `<span class="text-orange glow-orange font-semibold tracking-wide">${h(copy.resume.technicalStack.toUpperCase())}</span>

${Object.entries(profile.skills)
  .map(
    ([group, entries]) =>
      `<span class="text-yellow font-medium">${h(group.toLowerCase())}</span>  <span class="text-text-dim">${h(entries.join(" · "))}</span>`
  )
  .join("\n")}`,

  skills: profile.terminal.skillBars
    .map((skill) => {
      const color = textColorMap[skill.color];
      return `<span class="${color} font-medium">${h(skill.name.padEnd(14))}</span> <span class="text-green">${skillBar(skill.level)}</span> <span class="text-muted/60 text-xs">${skill.level}%</span>`;
    })
    .join("\n"),

  resume: `<span class="text-blue">→</span> ${internalLink("/resume", copy.terminal.viewFullResume)}  <span class="text-blue">→</span> ${internalLink("/resume?download=true", copy.terminal.downloadPdfLower)}`,

  contact: `<span class="text-orange font-medium">${h(copy.terminal.email)}</span>     <span class="text-blue glow-blue">${h(profile.email)}</span>
<span class="text-orange font-medium">${h(copy.terminal.web)}</span>       ${externalLink(profile.websiteUrl, profile.website)}
<span class="text-orange font-medium">${h(copy.terminal.github)}</span>    ${externalLink(profile.githubUrl, profile.github)}
<span class="text-orange font-medium">${h(copy.terminal.linkedin)}</span>  ${externalLink(profile.linkedinUrl, profile.linkedin)}

<span class="text-muted/50 italic">${h(copy.terminal.fastestContact)}</span>`,

  social: `<span class="text-orange font-medium">${h(copy.terminal.github)}</span>    ${externalLink(profile.githubUrl, profile.github)}
<span class="text-orange font-medium">${h(copy.terminal.linkedin)}</span>  ${externalLink(profile.linkedinUrl, profile.linkedin)}
<span class="text-orange font-medium">${h(copy.terminal.web)}</span>       ${externalLink(profile.websiteUrl, profile.website)}`,

  neofetch: () => {
    return `<div class="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
<pre class="text-blue leading-none text-xs hidden sm:block opacity-80">       /\\
       /  \\
      /\\   \\
     /  ..  \\
    /  '  '  \\
   / ..'  '.. \\
  /_____/\\_____\\</pre>
<div class="flex flex-col gap-0.5">
<span><span class="text-orange font-bold glow-orange">${h(profile.name.split(" ")[0].toLowerCase())}</span><span class="text-muted/60">@</span><span class="text-orange font-bold glow-orange">${h(profile.location.toLowerCase())}</span></span>
<span class="text-muted/30">──────────────</span>
<span><span class="text-orange">${h(copy.terminal.os)}</span> <span class="text-text-dim">${h(profile.terminal.os)}</span></span>
<span><span class="text-orange">${h(copy.terminal.editor)}</span> <span class="text-text-dim">${h(profile.terminal.editor)}</span></span>
<span><span class="text-orange">${h(copy.terminal.languages)}</span> <span class="text-text-dim">${h(profile.skills.Languages.join(", "))}</span></span>
<span><span class="text-orange">${h(copy.terminal.focus)}</span> <span class="text-text-dim">${h(profile.focus.toLowerCase())} @ ${h(profile.currentCompany)}</span></span>
<span><span class="text-orange">${h(copy.terminal.events)}</span> <span class="text-text-dim">${h(profile.terminal.events)}</span></span>
<span><span class="text-orange">${h(copy.terminal.side)}</span> <span class="text-text-dim">${h(profile.projects.map((project) => project.name.toLowerCase()).join(" · "))}</span></span>
<span><span class="text-orange">${h(copy.terminal.beyond)}</span> <span class="text-text-dim">${h(profile.terminal.neofetchBeyond)}</span></span>
<span class="mt-1"><span class="inline-block w-2.5 h-2.5 bg-red rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-orange rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-yellow rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-green rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-blue rounded-sm"></span> <span class="inline-block w-2.5 h-2.5 bg-purple rounded-sm"></span></span>
</div>
</div>`;
  },

  clear: () => null,

  ls: profile.terminal.files
    .map((file) => {
      const color = file.endsWith("/")
        ? "text-green glow-green"
        : file.startsWith(".")
          ? "text-purple glow-purple"
          : file.endsWith(".pdf")
            ? "text-blue glow-blue"
            : "text-blue glow-blue";
      return `<span class="${color} font-medium">${h(file)}</span>`;
    })
    .join("  "),

  pwd: `<span class="text-blue glow-blue">${h(profile.terminal.path)}</span>`,

  date: () => {
    const now = new Date();
    return `<span class="text-text-dim">${now.toUTCString()}</span>`;
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
    return `<span class="text-red glow-red">${h(copy.terminal.commandNotFound)}: ${h(trimmed)}</span>. <span class="text-green">${h(copy.terminal.availableCommandsHint)}</span>`;
  }

  if (typeof handler === "function") return handler();
  return handler;
}

const easterEggs: Record<string, string> = Object.fromEntries(
  Object.entries(profile.terminal.easterEggs).map(([command, response]) => [
    command,
    `<span class="text-muted/70 italic">${h(response)}</span>`,
  ])
);
