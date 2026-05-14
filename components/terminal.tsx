"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { copy, profile } from "@/content/profile";
import {
  ASCII_BANNER,
  AUTO_COMMANDS,
  QUICK_COMMANDS,
  COMMAND_NAMES,
  executeCommand,
} from "@/lib/commands";

// ─── Types ──────────────────────────────────────────────────────

interface TerminalLine {
  id: number;
  type: "banner" | "input" | "output" | "section-header" | "cta";
  content: string;
}

let lineId = 0;

function makeSectionHeader(name: string): string {
  return `<div class="flex items-center gap-2 mt-5 mb-2 text-xs"><span class="text-muted shrink-0 opacity-60">┌────</span><span class="text-yellow section-header-line uppercase tracking-wider">${name}</span><span class="text-muted flex-1" style="border-bottom:1px solid currentColor;opacity:0.2;height:1px;margin-left:4px;"></span><span class="text-muted shrink-0 opacity-60">┐</span></div>`;
}

// ─── Line Animation Variants ────────────────────────────────────

const lineVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    filter: "blur(3px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ─── Boot Sequence Component ─────────────────────────────────────

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const bootLines = copy.terminal.bootLines;
  const [currentLine, setCurrentLine] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLine >= bootLines.length) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setVisibleLines((prev) => [...prev, bootLines[currentLine]]);
      setCurrentLine((prev) => prev + 1);
    }, 350);

    return () => clearTimeout(timer);
  }, [currentLine, bootLines, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="space-y-1"
    >
      {visibleLines.map((line, i) => (
        <motion.div
          key={i}
          variants={lineVariants}
          initial="hidden"
          animate="visible"
          className="text-xs text-muted font-mono"
        >
          <span className="text-green glow-green mr-2">[ OK ]</span>
          {line}
        </motion.div>
      ))}
      {currentLine < bootLines.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-xs text-muted"
        >
          <span className="text-green glow-green mr-2">[ .. ]</span>
          {bootLines[currentLine]}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Animated Line Renderer ─────────────────────────────────────

function AnimatedLine({
  line,
  onCmdClick,
}: {
  line: TerminalLine;
  onCmdClick: (cmd: string) => void;
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const cmd = target.getAttribute("data-cmd");
      if (cmd) {
        e.stopPropagation();
        onCmdClick(cmd);
      }
    },
    [onCmdClick]
  );

  return (
    <motion.div
      key={line.id}
      layout="position"
      variants={lineVariants}
      initial="hidden"
      animate="visible"
      className="leading-relaxed"
    >
      {line.type === "input" ? (
        <div className="flex gap-2 items-center">
          <span className="prompt-symbol shrink-0 select-none text-sm">❯</span>
          <span className="text-text text-sm">{line.content}</span>
        </div>
      ) : line.type === "section-header" ? (
        <div dangerouslySetInnerHTML={{ __html: line.content }} />
      ) : line.type === "cta" ? (
        <CTABlock />
      ) : (
        <div
          className={
            line.type === "banner"
              ? "whitespace-pre-wrap my-4 text-sm sm:text-base"
              : line.type === "output"
                ? "pl-0 sm:pl-4 text-sm"
                : ""
          }
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: line.content }}
        />
      )}
    </motion.div>
  );
}

// ─── Main Terminal Component ────────────────────────────────────

export default function Terminal() {
  const [phase, setPhase] = useState<"boot" | "running" | "ready">("boot");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dubaiTime, setDubaiTime] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Dubai time clock
  useEffect(() => {
    const update = () => {
      const now = new Date().toLocaleTimeString("en-US", {
        timeZone: profile.terminal.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setDubaiTime(now);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const focusInput = useCallback(() => {
    if (phase === "ready") {
      inputRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // ─── Boot Sequence ───
  const handleBootComplete = useCallback(() => {
    setPhase("running");

    // Build the full sequence of lines
    const allLines: TerminalLine[] = [];
    allLines.push({ id: lineId++, type: "banner", content: ASCII_BANNER });

    for (const cmd of AUTO_COMMANDS) {
      allLines.push({
        id: lineId++,
        type: "section-header",
        content: makeSectionHeader(cmd),
      });
      allLines.push({ id: lineId++, type: "input", content: cmd });
      const result = executeCommand(cmd);
      if (result !== null) {
        result.split("\n").forEach((line) => {
          allLines.push({ id: lineId++, type: "output", content: line });
        });
      }
    }

    allLines.push({ id: lineId++, type: "cta", content: "" });

    // Reveal lines one by one with staggered timing
    let idx = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const revealNext = () => {
      if (idx >= allLines.length) {
        setPhase("ready");
        return;
      }

      setLines((prev) => [...prev, allLines[idx]]);
      idx++;

      // Determine delay based on next line type
      const next = allLines[idx];
      const delay = !next
        ? 300
        : next.type === "section-header"
          ? 280
          : next.type === "input"
            ? 200
            : next.type === "output"
              ? 40
              : 300;

      timerId = setTimeout(revealNext, delay);
    };

    timerId = setTimeout(revealNext, 250);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // ─── Manual Command Execution ───
  const runCommand = useCallback(
    (cmd: string) => {
      if (isTyping) return;

      if (cmd === "clear") {
        setLines([]);
        setInput("");
        return;
      }

      setIsTyping(true);
      const newLines: TerminalLine[] = [...lines, { id: lineId++, type: "input", content: cmd }];
      setLines(newLines);
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput("");

      // Small delay before output appears (like processing)
      setTimeout(() => {
        const result = executeCommand(cmd);
        if (result !== null) {
          const outputLines = result.split("\n").map((line) => ({
            id: lineId++,
            type: "output" as const,
            content: line,
          }));
          setLines([...newLines, ...outputLines]);
        }
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 0);
      }, 180);
    },
    [lines, isTyping]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    runCommand(trimmed);
  }, [input, isTyping, runCommand]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (!input) return;
        const match = COMMAND_NAMES.find((c) => c.startsWith(input.toLowerCase()));
        if (match) setInput(match);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [handleSubmit, history, historyIndex, input]
  );

  const handleOutputClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const cmd = target.getAttribute("data-cmd");
      if (cmd) {
        e.stopPropagation();
        runCommand(cmd);
      }
    },
    [runCommand]
  );

  return (
    <div className="h-full flex flex-col bg-grid ambient-glow">
      {/* Skip link */}
      <a
        href="/resume"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-bg-elevated focus:text-text focus:rounded-md focus:ring-2 focus:ring-blue/50"
      >
        {copy.terminal.skipToResume}
      </a>

      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-4xl h-full max-h-[90vh] terminal-window rounded-xl overflow-hidden flex flex-col bg-bg-elevated/80 backdrop-blur-sm relative z-10">
          {/* Titlebar */}
          <div className="flex items-center justify-between px-4 py-3 bg-bg-card/80 border-b border-border shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="titlebar-dot bg-red" />
              <div className="titlebar-dot bg-yellow" />
              <div className="titlebar-dot bg-green" />
            </div>
            <span className="text-muted text-xs hidden sm:inline font-mono tracking-wide">
              {profile.terminal.handle}@{profile.terminal.host}: ~
            </span>
            <span className="text-muted text-xs sm:hidden font-mono">~</span>
            <span className="text-muted text-xs font-mono tabular-nums tracking-wide">
              {dubaiTime}{" "}
              <span className="text-muted/50 hidden sm:inline">
                {profile.terminal.timeZoneLabel}
              </span>
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 cursor-text text-sm"
            onClick={(e) => {
              handleOutputClick(e);
              focusInput();
            }}
            aria-live="polite"
            aria-label="Terminal output"
          >
            <div className="max-w-3xl mx-auto space-y-1">
              <AnimatePresence mode="popLayout">
                {phase === "boot" && (
                  <motion.div
                    key="boot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <BootSequence onComplete={handleBootComplete} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {lines.map((line) => (
                  <AnimatedLine key={line.id} line={line} onCmdClick={runCommand} />
                ))}
              </AnimatePresence>

              {/* Input prompt - only show when ready */}
              {phase === "ready" && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  }}
                  className="flex gap-2 items-center pt-1"
                >
                  <span className="prompt-symbol shrink-0 select-none text-sm">❯</span>
                  <span className="text-text text-sm">{input}</span>
                  <span className="w-2 h-5 cursor-solid rounded-sm cursor-blink shrink-0" />
                </motion.div>
              )}

              {/* Scroll anchor */}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Interactive input area */}
          <div className="shrink-0 border-t border-border/60 bg-bg-card/50 backdrop-blur-sm">
            <div className="px-4 sm:px-6 pt-3 pb-1.5">
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
                {QUICK_COMMANDS.map((cmd) => (
                  <motion.button
                    key={cmd}
                    onClick={() => runCommand(cmd)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="cmd-pill px-3 py-1.5 text-xs rounded-md border border-border text-text-dim hover:text-blue hover:border-blue/30 min-h-[28px] flex items-center gap-1.5"
                    aria-label={`Run ${cmd} command`}
                  >
                    <span className="w-1 h-1 rounded-full bg-blue/40" />
                    {cmd}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-2.5">
              <div className="max-w-3xl mx-auto flex items-center gap-2">
                <span className="prompt-symbol shrink-0 text-sm">❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-text text-sm outline-none caret-orange placeholder:text-muted/30 font-mono min-w-0"
                  placeholder={copy.terminal.inputPlaceholder}
                  aria-label="terminal input"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={phase !== "ready" || isTyping}
                />
                {isTyping && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-xs text-muted"
                  >
                    processing...
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CTA Block Component ────────────────────────────────────────

function CTABlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="mt-8 mb-6"
    >
      <div className="border-t border-orange/20" />
      <div className="py-6 flex flex-col items-center gap-5">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/resume"
            className="cta-glow px-5 sm:px-6 py-2.5 text-sm font-semibold text-orange border border-orange/40 rounded-lg hover:bg-orange/10 transition-all duration-200 min-h-[40px] flex items-center gap-2 group"
          >
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            {copy.terminal.viewResume}
          </Link>
          <Link
            href="/resume?download=true"
            className="px-5 sm:px-6 py-2.5 text-sm text-text-dim border border-border rounded-lg hover:text-text hover:border-border-hover transition-all duration-200 min-h-[40px] flex items-center gap-2 group"
          >
            <svg
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {copy.terminal.downloadPdf}
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-xs">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors duration-200 flex items-center gap-1.5 group"
          >
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {copy.terminal.github}
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors duration-200 flex items-center gap-1.5 group"
          >
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {copy.terminal.linkedin}
          </a>
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors duration-200 flex items-center gap-1.5 group"
          >
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            {copy.terminal.web}
          </a>
        </div>
      </div>
      <div className="border-t border-orange/20" />
    </motion.div>
  );
}
