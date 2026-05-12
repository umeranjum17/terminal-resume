export const BOOT_LINES = [
  "[ <span class='text-green'>OK</span> ] Reached target Local File Systems.",
  "[ <span class='text-green'>OK</span> ] Started Load Kernel Modules.",
  "[ <span class='text-green'>OK</span> ] Mounting /home/umer/projects/...",
  "[ <span class='text-green'>OK</span> ] Starting reconciliation.service ...",
  "[ <span class='text-green'>OK</span> ] Reached target Multi-User System.",
  "[ <span class='text-green'>OK</span> ] Started indie-hacker.timer (caffeine-driven).",
];

export const ASCII_BANNER = `<span class="text-orange"> _   _ __  __ _____ ____
| | | |  \\/  | ____|  _ \\
| | | | |\\/| |  _| | |_) |
| |_| | |  | | |___|  _ <
 \\___/|_|  |_|_____|_| \\_\\</span>

<span class="text-muted">senior software engineer · payments infrastructure · dubai</span>
<span class="text-border">─────────────────────────────────────────────────────</span>
<span class="text-muted">type</span> <span class="text-green">help</span> <span class="text-muted">to see available commands</span>`;

export type CommandResult = string | null;
type CommandHandler = string | (() => CommandResult);

const commandMap: Record<string, CommandHandler> = {
  help: `<span class="text-yellow">available commands:</span>

  <span class="text-green">about</span>       <span class="text-muted">—</span> who i am and what i do
  <span class="text-green">experience</span>  <span class="text-muted">—</span> work history <span class="text-muted">(alias: exp)</span>
  <span class="text-green">projects</span>    <span class="text-muted">—</span> things i've built
  <span class="text-green">skills</span>      <span class="text-muted">—</span> tech stack <span class="text-muted">(alias: stack)</span>
  <span class="text-green">resume</span>      <span class="text-muted">—</span> view or download resume
  <span class="text-green">contact</span>     <span class="text-muted">—</span> how to reach me
  <span class="text-green">social</span>      <span class="text-muted">—</span> links to profiles
  <span class="text-green">neofetch</span>    <span class="text-muted">—</span> system info
  <span class="text-green">whoami</span>      <span class="text-muted">—</span> username
  <span class="text-green">clear</span>       <span class="text-muted">—</span> clear terminal
  <span class="text-green">ls</span>          <span class="text-muted">—</span> list directory
  <span class="text-green">pwd</span>         <span class="text-muted">—</span> print working directory
  <span class="text-green">date</span>        <span class="text-muted">—</span> current date/time`,

  whoami: `<span class="text-orange">umer</span> — senior software engineer, fintech / payments infrastructure, based in dubai.`,

  about: `<span class="text-yellow">┌─ about ─────────────────────────────────────────────┐</span>

  i'm a <span class="text-orange">senior software engineer</span> focused on
  <span class="text-blue">payments infrastructure</span> in the fintech space.

  by day i design ledgers, reconciliation engines,
  and event-driven systems that move money across
  african corridors — <span class="text-green">ZAR</span>, <span class="text-green">NGN</span>, <span class="text-green">ZMW</span>, <span class="text-green">KES</span>.

  by night i build indie products: an AI model
  aggregator (<span class="text-purple">cognifi</span>), a modular AI workstation
  (<span class="text-purple">lumina</span>), and a multi-agent dev orchestration
  tool (<span class="text-purple">flux</span>).

  i believe in <span class="text-orange">double-entry bookkeeping</span>,
  <span class="text-orange">hexagonal architecture</span>, and shipping
  things that work over things that impress.

  currently based in <span class="text-blue">dubai</span> 🇦🇪

<span class="text-yellow">└─────────────────────────────────────────────────────┘</span>`,

  experience: `<span class="text-yellow">── work experience ──────────────────────────────────</span>

<span class="text-orange">SENIOR SOFTWARE ENGINEER</span> · <span class="text-blue">[Current Company]</span>
<span class="text-muted">dubai · payments infrastructure · 20XX – present</span>

  <span class="text-muted">▸</span> Designed hexagonal-architecture ledger service on
    Modern Treasury — clean provider abstraction,
    transactional outbox + CDC, CQRS read models.
  <span class="text-muted">▸</span> Built payment reconciliation engine with multi-
    dimensional charge flow (FULL_RECON / MATCH_ONLY /
    CLEAR_ONLY / NONE) and Adjustment entity pattern.
  <span class="text-muted">▸</span> Drove cross-system fee variance analysis between
    v1 and v2 payment systems in BigQuery.
  <span class="text-muted">▸</span> Owns payments state machine across ZAR / NGN /
    ZMW / KES corridors.

  <span class="text-muted">stack:</span> <span class="text-green">TypeScript · PostgreSQL · MongoDB · Redpanda
         Kafka · SNS/SQS · BigQuery · Modern Treasury</span>

<span class="text-orange">SOFTWARE ENGINEER</span> · <span class="text-blue">[Prior Roles]</span>
<span class="text-muted">~7 years full-stack · MERN · Next.js · React Native</span>

  <span class="text-muted">▸</span> Shipped production web and mobile across fintech
    and consumer products.
  <span class="text-muted">▸</span> Enough greenfield projects to know when not to
    start one.`,

  projects: `<span class="text-yellow">── projects ─────────────────────────────────────────</span>

<span class="text-orange">COGNIFI</span> — <span class="text-muted">credit-based AI model aggregator</span>
  One bill, 10+ LLM providers, model switching
  mid-conversation. Live with paying users.
  Currently solving retention.
  <span class="text-muted">stack:</span> <span class="text-green">Next.js · TypeScript · Stripe · LLM SDKs</span>

<span class="text-orange">LUMINA POWERHOUSE</span> — <span class="text-muted">modular AI workstation</span>
  A real cockpit, not a chat box. 10+ providers,
  RAG memory, 900+ plugins. Notable LinkedIn
  engagement for the niche.
  <span class="text-muted">stack:</span> <span class="text-green">Next.js · TypeScript · vector store · plugin SDK</span>

<span class="text-orange">FLUX</span> — <span class="text-muted">multi-agent dev orchestration</span>
  Spawning specialised Claude Code instances and
  coordinating them on real work. Still cooking.
  <span class="text-muted">stack:</span> <span class="text-green">TypeScript · Claude Code · agent protocols</span>`,

  skills: `<span class="text-yellow">── tech stack ───────────────────────────────────────</span>

  <span class="text-orange">TypeScript</span>    <span class="text-green">████████████████████</span><span class="text-muted">░░</span>  95%
  <span class="text-orange">Node.js</span>       <span class="text-green">███████████████████</span><span class="text-muted">░░░</span>  90%
  <span class="text-orange">React/Next</span>    <span class="text-green">███████████████████</span><span class="text-muted">░░░</span>  90%
  <span class="text-orange">PostgreSQL</span>    <span class="text-green">██████████████████</span><span class="text-muted">░░░░</span>  85%
  <span class="text-orange">MongoDB</span>       <span class="text-green">█████████████████</span><span class="text-muted">░░░░░</span>  80%
  <span class="text-orange">Kafka/Redpanda</span><span class="text-green">████████████████</span><span class="text-muted">░░░░░░</span>  75%
  <span class="text-orange">AWS</span>           <span class="text-green">████████████████</span><span class="text-muted">░░░░░░</span>  75%
  <span class="text-orange">Docker</span>        <span class="text-green">███████████████</span><span class="text-muted">░░░░░░░</span>  70%
  <span class="text-orange">Python</span>        <span class="text-green">██████████████</span><span class="text-muted">░░░░░░░░</span>  65%
  <span class="text-orange">Go</span>            <span class="text-green">████████████</span><span class="text-muted">░░░░░░░░░░</span>  55%`,

  resume: `<span class="text-yellow">── resume ───────────────────────────────────────────</span>

  <span class="text-blue">→</span> <a href="/resume" class="text-blue underline hover:text-orange">view full resume</a> <span class="text-muted">(opens /resume route)</span>
  <span class="text-blue">→</span> <a href="/resume.pdf" class="text-blue underline hover:text-orange" download>download PDF</a> <span class="text-muted">(resume.pdf)</span>`,

  contact: `<span class="text-yellow">── contact ──────────────────────────────────────────</span>

  <span class="text-orange">email</span>     <span class="text-blue">[email protected]</span>
  <span class="text-orange">calendar</span>  <span class="text-blue">cal.com/[handle]</span>
  <span class="text-orange">signal</span>    <span class="text-muted">on request</span>

  <span class="text-muted">fastest reply: email with a one-line subject.</span>
  <span class="text-muted">slowest: LinkedIn DM.</span>`,

  social: `<span class="text-yellow">── social ───────────────────────────────────────────</span>

  <span class="text-orange">github</span>    <a href="https://github.com/[handle]" class="text-blue underline" target="_blank">github.com/[handle]</a>
  <span class="text-orange">x</span>         <a href="https://x.com/[handle]" class="text-blue underline" target="_blank">x.com/[handle]</a> <span class="text-muted">← the honest one</span>
  <span class="text-orange">linkedin</span>  <a href="https://linkedin.com/in/[handle]" class="text-blue underline" target="_blank">linkedin.com/in/[handle]</a> <span class="text-muted">← the corporate one</span>
  <span class="text-orange">read.cv</span>   <a href="https://read.cv/[handle]" class="text-blue underline" target="_blank">read.cv/[handle]</a>`,

  neofetch: () => {
    return `<div class="flex flex-col md:flex-row gap-4 md:gap-8">
<pre class="text-blue">                   -\`
                  .o+\`
                 \`ooo/
                \`+oooo:
               \`+oooooo:
               -+oooooo+:
             \`/:-:++oooo+:
            \`/++++/+++++++:
           \`/++++++++++++++:
          \`/+++ooooooooooooo/\`
         ./ooosssso++osssssso+\`
        .oossssso-\`\`\`\`/ossssss+\`
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
   \`/ossssso+/:-        -:/+osssso+-
  \`+sso+:-\`                 \`.-/+oso:
 \`++:.                           \`-/+/
 .\`                                 \`</pre>
<div class="flex flex-col gap-0.5">
  <span><span class="text-orange font-bold">umer</span><span class="text-muted">@</span><span class="text-orange font-bold">dubai</span></span>
  <span class="text-muted">──────────────────</span>
  <span><span class="text-orange">OS</span>: Arch Linux x86_64</span>
  <span><span class="text-orange">Host</span>: MacBook Pro 16"</span>
  <span><span class="text-orange">Kernel</span>: 6.6.x-zen</span>
  <span><span class="text-orange">Shell</span>: zsh 5.9</span>
  <span><span class="text-orange">DE</span>: Hyprland</span>
  <span><span class="text-orange">Terminal</span>: kitty</span>
  <span><span class="text-orange">Editor</span>: neovim + claude code</span>
  <span><span class="text-orange">Lang</span>: TypeScript, Go, Python</span>
  <span><span class="text-orange">Uptime</span>: ~7 years in tech</span>
  <span><span class="text-orange">Focus</span>: payments infra</span>
  <span></span>
  <span><span class="inline-block w-3 h-3 bg-red rounded-sm"></span> <span class="inline-block w-3 h-3 bg-orange rounded-sm"></span> <span class="inline-block w-3 h-3 bg-yellow rounded-sm"></span> <span class="inline-block w-3 h-3 bg-green rounded-sm"></span> <span class="inline-block w-3 h-3 bg-blue rounded-sm"></span> <span class="inline-block w-3 h-3 bg-purple rounded-sm"></span></span>
</div>
</div>`;
  },

  clear: () => null,

  ls: `<span class="text-blue">about.txt</span>  <span class="text-green">projects/</span>  <span class="text-blue">resume.pdf</span>  <span class="text-green">skills/</span>  <span class="text-purple">.config/</span>  <span class="text-muted">.env</span>`,

  pwd: `<span class="text-blue">/home/umer/portfolio</span>`,

  date: () => {
    const now = new Date();
    return `<span class="text-text">${now.toUTCString()}</span>`;
  },
};

// Aliases
commandMap.exp = commandMap.experience;
commandMap.stack = commandMap.skills;

export const COMMAND_NAMES = Object.keys(commandMap).filter(
  (k) => !["exp", "stack"].includes(k)
);

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();

  // Check easter eggs first
  const egg = easterEggs[trimmed];
  if (egg !== undefined) return egg;

  const handler = commandMap[trimmed];
  if (handler === undefined) {
    return `<span class="text-red">command not found: ${trimmed}</span>. type <span class="text-green">help</span> for available commands.`;
  }

  if (typeof handler === "function") return handler();
  return handler;
}

const easterEggs: Record<string, string> = {
  sudo: `<span class="text-red">umer is not in the sudoers file. this incident will be reported.</span>`,
  "sudo rm -rf /": `<span class="text-red">nice try. not today.</span>`,
  "rm -rf /": `<span class="text-red">permission denied. also, why?</span>`,
  "rm -rf /*": `<span class="text-red">i'm not that kind of terminal.</span>`,
  ":q": `<span class="text-muted">this isn't vim. but i respect the muscle memory.</span>`,
  ":wq": `<span class="text-muted">saved. just kidding — there's nothing to save.</span>`,
  "cd ..": `<span class="text-muted">you're already home.</span>`,
  hello: `<span class="text-green">hey there! 👋 type <span class="text-orange">help</span> to get started.</span>`,
  hi: `<span class="text-green">hi! 👋 type <span class="text-orange">help</span> to get started.</span>`,
  "hire me": `<span class="text-green">bold move. i like it. check <span class="text-orange">contact</span> and let's talk.</span>`,
  pakistan: `<span class="text-green">🇵🇰 zindabad!</span>`,
  "arch btw": `<span class="text-blue">i use arch btw. (yes, unironically.)</span>`,
  vim: `<span class="text-muted">neovim, actually. with lazy.nvim. fight me.</span>`,
  exit: `<span class="text-muted">there is no escape. you live here now.</span>`,
  matrix: `<span class="text-green">wake up, Neo... the payments have you.</span>`,
  coffee: `<span class="text-yellow">☕ brewing... done. black, no sugar. like my terminals.</span>`,
};
