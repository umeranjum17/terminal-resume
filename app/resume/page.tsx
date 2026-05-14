"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { copy, profile, type TagColor } from "@/content/profile";
import {
  Mail,
  Globe,
  MapPin,
  Download,
  ArrowLeft,
  Briefcase,
  Code2,
  GraduationCap,
  Cpu,
  Sparkles,
  Zap,
  Terminal,
  ExternalLink,
  Database,
  Server,
  Layers,
  MessageSquare,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function fadeIn(delay = 0) {
  return {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };
}

function Tag({ children, color = "orange" }: { children: React.ReactNode; color?: TagColor }) {
  const colorMap = {
    orange: "text-orange border-orange/30 bg-orange/5",
    blue: "text-blue border-blue/30 bg-blue/5",
    green: "text-green border-green/30 bg-green/5",
    purple: "text-purple border-purple/30 bg-purple/5",
    yellow: "text-yellow border-yellow/30 bg-yellow/5",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${colorMap[color]} print:text-gray-700 print:border-gray-300 print:bg-transparent`}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className="flex items-center gap-2 mb-4 print:mb-3">
      <Icon className="w-4 h-4 text-orange print:text-gray-600" />
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-orange print:text-black">
        {children}
      </h2>
      <div className="flex-1 h-px bg-border print:bg-gray-300" />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATS-FRIENDLY PRINT LAYOUT — hidden on screen, visible only when printing
// ═══════════════════════════════════════════════════════════════════════════════

function ATSResume() {
  const skills = Object.entries(profile.skills);

  return (
    <div className="ats-resume">
      <header className="ats-header">
        <h1 className="ats-name">{profile.displayName}</h1>
        <p className="ats-title">
          {profile.role} | {profile.focus} | {profile.location}
        </p>
        <div className="ats-contact">
          <span>{profile.email}</span>
          <span>|</span>
          <span>{profile.github}</span>
          <span>|</span>
          <span>{profile.website}</span>
          <span>|</span>
          <span>{profile.linkedin}</span>
        </div>
      </header>

      <section className="ats-section">
        <h2 className="ats-section-title">{copy.resume.profile}</h2>
        <p className="ats-profile">
          {profile.headline} {profile.summary}
        </p>
      </section>

      <section className="ats-section">
        <h2 className="ats-section-title">{copy.resume.experience}</h2>
        {profile.experience.map((job) => (
          <div className="ats-job" key={`${job.company}-${job.dates}`}>
            <div className="ats-job-header">
              <h3 className="ats-job-title">{job.title}</h3>
              <span className="ats-job-date">{job.dates}</span>
            </div>
            <p className="ats-job-company">
              {job.company} | {job.location}
            </p>
            <ul className="ats-list">
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="ats-section">
        <h2 className="ats-section-title">{copy.resume.selectedProjects}</h2>
        {profile.projects.map((project) => (
          <p className="ats-project-line" key={project.name}>
            <strong>{project.printableName}:</strong> {project.description}
            {project.link ? ` ${project.link}` : ""}
          </p>
        ))}
      </section>

      <section className="ats-section">
        <h2 className="ats-section-title">{copy.resume.skills}</h2>
        <div className="ats-skills-grid">
          {skills.map(([group, entries]) => (
            <p key={group}>
              <strong>{group}:</strong> {entries.join(", ")}
            </p>
          ))}
        </div>
      </section>

      <section className="ats-section">
        <h2 className="ats-section-title">{copy.resume.education}</h2>
        <div className="ats-edu">
          <div>
            <h3 className="ats-edu-degree">{profile.education.degree}</h3>
            <p className="ats-edu-school">{profile.education.school}</p>
          </div>
          <span className="ats-edu-date">
            {profile.education.dates} | {profile.education.detail}
          </span>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB VIEW — Beautiful animated resume
// ═══════════════════════════════════════════════════════════════════════════════

function ResumeContent() {
  const searchParams = useSearchParams();
  const skillGroups = Object.entries(profile.skills);

  useEffect(() => {
    if (searchParams.get("download") === "true") {
      setTimeout(() => window.print(), 400);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-bg print:bg-white">
      {/* Screen-only nav bar */}
      <nav className="print:hidden fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-muted hover:text-orange transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {copy.resume.backToTerminal}
          </Link>
          <button
            onClick={() => window.print()}
            className="group flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-orange border border-orange/40 rounded hover:bg-orange/10 transition-all"
          >
            <Download className="w-4 h-4" />
            {copy.resume.downloadPdf}
          </button>
        </div>
      </nav>

      {/* ATS Print Layout — hidden on screen */}
      <div className="hidden print:block">
        <ATSResume />
      </div>

      {/* Web Layout — hidden when printing */}
      <motion.main
        className="web-resume max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 print:hidden"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <article className="text-text">
          {/* ═══ HEADER ═══ */}
          <motion.header
            variants={fadeIn(0)}
            className="text-center border-b border-border pb-6 mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-orange tracking-tight mb-2">
              {profile.displayName}
            </h1>
            <p className="text-sm sm:text-base text-text mb-4">
              {profile.role} · {profile.focus} · {profile.location}
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs sm:text-sm text-muted">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-1.5 hover:text-orange transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{profile.email}</span>
                <span className="sm:hidden">email</span>
              </a>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span className="hidden sm:inline">{profile.github}</span>
                <span className="sm:hidden">github</span>
              </a>
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{profile.website}</span>
                <span className="sm:hidden">web</span>
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="hidden sm:inline">{profile.linkedin}</span>
                <span className="sm:hidden">linkedin</span>
              </a>
            </div>
          </motion.header>

          {/* ═══ HIGHLIGHTS ═══ */}
          <motion.section variants={fadeIn(0.05)} className="mb-10">
            <SectionTitle icon={Sparkles}>{copy.resume.highlights}</SectionTitle>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.highlights.map((text) => (
                <motion.li
                  key={text}
                  variants={item}
                  className="flex items-start gap-2 text-sm leading-relaxed"
                >
                  <Zap className="w-3.5 h-3.5 text-orange mt-1 shrink-0" />
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* ═══ EXPERIENCE ═══ */}
          <motion.section variants={fadeIn(0.1)} className="mb-10">
            <SectionTitle icon={Briefcase}>{copy.resume.experience}</SectionTitle>
            <div className="space-y-8">
              {profile.experience.map((job) => (
                <motion.div
                  variants={item}
                  className="relative pl-4 sm:pl-5 border-l-2 border-orange/30"
                  key={`${job.company}-${job.dates}`}
                >
                  <div className="absolute -left-[7px] sm:-left-[9px] top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-bg border-2 border-orange" />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-x-4 mb-1">
                    <h3 className="text-sm font-bold text-text">{job.title}</h3>
                    <span className="text-xs text-muted font-mono">{job.dates}</span>
                  </div>
                  <p className="text-xs text-blue mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.company} · {job.location}
                  </p>
                  <ul className="text-sm space-y-2">
                    {job.webBullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-orange mt-1.5">•</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.technologies.map((technology) => (
                      <Tag key={technology} color={job.tagColor}>
                        {technology}
                      </Tag>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══ SELECTED PROJECTS ═══ */}
          <motion.section variants={fadeIn(0.15)} className="mb-10">
            <SectionTitle icon={Code2}>{copy.resume.selectedProjects}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.projects.map((project) => (
                <motion.div
                  key={project.name}
                  variants={item}
                  className="group p-4 rounded-lg border border-border hover:border-orange/40 transition-colors bg-bg-elevated/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-text group-hover:text-orange transition-colors">
                      {project.name}
                    </h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-orange transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-muted mb-3">
                    {project.webDescription}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <Tag key={tag} color="yellow">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══ TECHNICAL STACK ═══ */}
          <motion.section variants={fadeIn(0.2)} className="mb-10">
            <SectionTitle icon={Cpu}>{copy.resume.technicalStack}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillGroups.map(([title, entries], i) => {
                const icons = [Terminal, Server, Database, MessageSquare, Layers, Sparkles];
                const Icon = icons[i] ?? Cpu;

                return (
                  <motion.div
                    key={title}
                    variants={item}
                    className="p-4 rounded-lg border border-border bg-bg-elevated/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-orange" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entries.map((entry) => (
                        <Tag key={entry}>{entry}</Tag>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ═══ EDUCATION ═══ */}
          <motion.section variants={fadeIn(0.25)} className="mb-10">
            <SectionTitle icon={GraduationCap}>{copy.resume.education}</SectionTitle>
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-x-4"
            >
              <div>
                <h3 className="text-sm font-bold text-text">{profile.education.degree}</h3>
                <p className="text-xs text-blue">{profile.education.school}</p>
              </div>
              <span className="text-xs text-muted font-mono">
                {profile.education.dates} · {profile.education.detail}
              </span>
            </motion.div>
          </motion.section>

          {/* ═══ BEYOND WORK ═══ */}
          <motion.section variants={fadeIn(0.3)} className="mb-10">
            <SectionTitle icon={Sparkles}>{copy.resume.beyondWork}</SectionTitle>
            <motion.p variants={item} className="text-sm text-muted leading-relaxed">
              {profile.beyond}
            </motion.p>
          </motion.section>

          {/* ═══ FOOTER ═══ */}
          <motion.footer
            variants={fadeIn(0.35)}
            className="text-center text-xs text-muted pt-6 border-t border-border"
          >
            <p>
              {copy.resume.builtWith}{" "}
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange hover:underline"
              >
                GitHub
              </a>
            </p>
          </motion.footer>
        </article>
      </motion.main>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense>
      <ResumeContent />
    </Suspense>
  );
}
