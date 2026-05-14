# Terminal Portfolio

[![CI](https://github.com/umeranjum17/terminal-resume/actions/workflows/ci.yml/badge.svg)](https://github.com/umeranjum17/terminal-resume/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/umeranjum17/terminal-resume)

An open-source terminal-style portfolio and one-page resume built with Next.js 16, Tailwind CSS v4, and Framer Motion.

**Live demo:** [umer.sh](https://umer.sh)

The project is designed so most forks only edit one file:

```txt
content/profile.ts
```

That file owns the profile, contact links, resume content, projects, skills, education, terminal output, metadata source values, and locale-ready content structure.

## Features

- Terminal-style homepage with command history, autocomplete (Tab), arrow-key recall, `Ctrl+L` to clear, click-to-run quick commands, and a Skip-to-Resume link.
- Rich animated web resume at `/resume`.
- Print-friendly, ATS-compatible one-page resume via `/resume?download=true` (auto-prints on load).
- Locale-ready content model through `profiles.en`, with room for `profiles.ar`, `profiles.fr`, etc.
- Dynamically generated Open Graph + Twitter card image via `next/og` — auto-updates from your profile.
- Centralized profile data used by the terminal, resume, SEO metadata, sitemap, and `robots.txt`.
- `prefers-reduced-motion` aware (scanlines, glow, blink, line-enter all disabled).
- Output is HTML-escaped at the command layer (`commandMap`) and unit-tested for XSS.
- No backend or database required — fully static.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Requires **Node.js >= 20** and **pnpm 11+** (see `.nvmrc` and `package.json` `packageManager`).

## Customize

Edit [`content/profile.ts`](content/profile.ts).

For a basic fork, update:

- `name`, `role`, `focus`, `location`
- `email`, `website`, `websiteUrl`, `github`, `githubUrl`, `linkedin`, `linkedinUrl`
- `headline`, `summary`, `highlights`
- `experience`, `projects`, `skills`, `education`
- `terminal.handle`, `terminal.host`, `terminal.timeZone`, `terminal.timeZoneLabel`

To add another language, copy `englishProfile`, translate, and register it:

```ts
export const profiles = {
  en: englishProfile,
  ar: arabicProfile,
} as const;
```

The app currently uses `defaultLocale`. The structure is locale-ready, but route-based locale switching is not wired up yet — add it when you need it.

Most visual and terminal-specific personalization also lives in `profile.ts`:

- Terminal handle, host, timezone, `neofetch` rows, skill bars, easter eggs
- Resume print content
- SEO metadata source values
- Social links and project links

Avoid editing component files for personal copy unless you are changing layout or behavior.

## Build

```bash
pnpm build
pnpm start
```

## Scripts

| Command             | Purpose                  |
| ------------------- | ------------------------ |
| `pnpm dev`          | Start dev server         |
| `pnpm build`        | Production build         |
| `pnpm start`        | Serve production build   |
| `pnpm lint`         | ESLint                   |
| `pnpm test`         | Vitest run               |
| `pnpm test:watch`   | Vitest watch mode        |
| `pnpm format`       | Prettier write           |
| `pnpm format:check` | Prettier check (CI gate) |

CI runs format check, lint, tests, and build on every PR (`.github/workflows/ci.yml`).

## Deploy To Your Domain

The easiest path is **Vercel**:

1. Push the repo to GitHub.
2. Click **Deploy** above (or import the project in Vercel manually).
3. Keep the default build settings:
   - Framework: Next.js
   - Install: `pnpm install`
   - Build: `pnpm build`
4. Add your domain under Vercel **Project → Settings → Domains**.
5. Update DNS where the domain is registered:
   - Apex (e.g. `example.com`): Vercel-recommended `A` record.
   - `www.example.com`: Vercel-recommended `CNAME`.
6. **Update `content/profile.ts`:**
   - Set `website` to your bare domain (e.g. `"example.com"`).
   - Set `websiteUrl` to your full URL (e.g. `"https://example.com"`).
   - Update `email`, `github*`, `linkedin*`.

`websiteUrl` is the source for `metadataBase`, the canonical URL, the sitemap, `robots.txt`, and the OG image route — change it once and the rest follows.

### Other hosts

The project is fully static (`○ Static` in the Next build output) and works on any platform that can serve a Next.js 16 app:

- **Cloudflare Pages**, **Netlify**: use their Next.js adapter.
- **Self-hosted (`pnpm start`)**: requires a Node 20+ runtime.

For pure static export to a CDN (no Node), set `output: "export"` in `next.config.ts` — note this disables the dynamic `opengraph-image` route, so you'd need to drop a static `app/opengraph-image.png` instead.

## Resume PDF

Visit `/resume?download=true` or click **Download PDF**. The print stylesheet is tuned for A4 one-page output.

For best results, keep the print resume concise:

- 1 short profile paragraph
- 2-6 bullets for the current role
- 1-2 bullets for older roles
- 2-3 selected projects
- Compact skills grouped by category

Translated resumes often run longer than English. Verify the generated PDF manually before publishing.

## Project Structure

```
app/
  layout.tsx            Root layout, SEO metadata
  page.tsx              Terminal homepage
  globals.css           Theme variables, animations, print styles
  opengraph-image.tsx   Dynamic OG image via next/og
  twitter-image.tsx     Re-exports OG image for Twitter cards
  robots.ts             Generated /robots.txt
  sitemap.ts            Generated /sitemap.xml
  resume/page.tsx       Animated web resume + ATS print layout
components/
  terminal.tsx          Interactive terminal client component
lib/
  commands.ts           Command registry, HTML escape, output builders
  commands.test.ts      Vitest unit tests
content/
  profile.ts            All personal data, copy, easter eggs
public/
  favicon.svg
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bugs and feature ideas welcome — open an issue or discussion.

## Security

Report vulnerabilities privately per [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) — fork it, ship your own portfolio, attribution appreciated but not required.
