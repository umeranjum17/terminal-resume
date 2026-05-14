"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { copy, profile } from "@/content/profile";
import {
  ASCII_BANNER,
  AUTO_COMMANDS,
  QUICK_COMMANDS,
  COMMAND_NAMES,
  executeCommand,
} from "@/lib/commands";

interface TerminalLine {
  id: number;
  type: "banner" | "input" | "output" | "section-header" | "cta";
  content: string;
}

let lineId = 0;

function makeSectionHeader(name: string): string {
  return `<div class="flex items-center gap-2 mt-4 mb-1 text-xs"><span class="text-muted shrink-0">┌────</span><span class="text-yellow glow-orange font-bold uppercase tracking-wider">${name}</span><span class="text-muted flex-1" style="border-bottom:1px solid currentColor;opacity:0.3;height:1px;margin-left:4px;"></span><span class="text-muted shrink-0">┐</span></div>`;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    // Render all content immediately on first paint
    const initial: TerminalLine[] = [];
    initial.push({ id: lineId++, type: "banner", content: ASCII_BANNER });
    for (const cmd of AUTO_COMMANDS) {
      initial.push({ id: lineId++, type: "section-header", content: makeSectionHeader(cmd) });
      initial.push({ id: lineId++, type: "input", content: cmd });
      const result = executeCommand(cmd);
      if (result !== null) {
        result.split("\n").forEach((line) => {
          initial.push({ id: lineId++, type: "output", content: line });
        });
      }
    }
    initial.push({ id: lineId++, type: "cta", content: "" });
    return initial;
  });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dubaiTime, setDubaiTime] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when lines change
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Manual command execution
  const runCommand = useCallback(
    (cmd: string) => {
      const newLines: TerminalLine[] = [...lines, { id: lineId++, type: "input", content: cmd }];
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);

      if (cmd === "clear") {
        setLines([]);
        setInput("");
        return;
      }

      const result = executeCommand(cmd);
      if (result !== null) {
        newLines.push({ id: lineId++, type: "output", content: result });
      }
      setLines(newLines);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [lines]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    runCommand(trimmed);
  }, [input, runCommand]);

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
    <div className="h-full flex flex-col scanlines crt-vignette">
      {/* Skip link */}
      <a
        href="/resume"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-bg-elevated focus:text-text focus:rounded"
      >
        {copy.terminal.skipToResume}
      </a>

      {/* Titlebar */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg-elevated border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow" />
          <div className="w-2.5 h-2.5 rounded-full bg-green" />
        </div>
        <span className="text-muted text-xs hidden sm:inline">
          {profile.terminal.handle}@{profile.terminal.host}: ~
        </span>
        <span className="text-muted text-xs sm:hidden">~</span>
        <span className="text-muted text-xs font-mono tabular-nums">
          {dubaiTime}{" "}
          <span className="text-muted/60 hidden sm:inline">{profile.terminal.timeZoneLabel}</span>
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 cursor-text text-sm"
        onClick={(e) => {
          handleOutputClick(e);
          focusInput();
        }}
        aria-live="polite"
        aria-label="Terminal output"
      >
        <div className="max-w-3xl mx-auto space-y-0.5">
          {lines.map((line) => (
            <div key={line.id} className="leading-relaxed">
              {line.type === "input" ? (
                <div className="flex gap-2">
                  <span className="text-green shrink-0">$</span>
                  <span className="text-text">{line.content}</span>
                </div>
              ) : line.type === "section-header" ? (
                <div dangerouslySetInnerHTML={{ __html: line.content }} />
              ) : line.type === "cta" ? (
                <CTABlock />
              ) : (
                <div
                  className={
                    line.type === "banner"
                      ? "whitespace-pre-wrap my-3 text-base"
                      : line.type === "output"
                        ? "pl-2"
                        : ""
                  }
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />
              )}
            </div>
          ))}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Interactive input */}
      <div className="shrink-0 border-t border-border bg-bg-elevated/50">
        <div className="px-3 sm:px-4 pt-2 pb-1">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-1.5">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => runCommand(cmd)}
                className="px-2.5 py-1 text-xs rounded border border-border text-muted hover:text-orange hover:border-orange/40 transition-colors min-h-[28px]"
                aria-label={`Run ${cmd} command`}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 sm:px-4 py-2">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <span className="text-green shrink-0 text-sm">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-text text-sm outline-none caret-orange placeholder:text-muted/40 font-mono min-w-0"
              placeholder={copy.terminal.inputPlaceholder}
              aria-label="terminal input"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <span className="w-1.5 h-4 bg-orange animate-blink shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CTA Block Component ────────────────────────────────────────

function CTABlock() {
  return (
    <div className="mt-6 mb-4 line-enter">
      <div className="border-t border-orange/40 glow-orange" />
      <div className="py-4 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/resume"
            className="px-4 sm:px-5 py-2.5 text-sm font-bold text-orange border border-orange rounded cta-border-glow cta-glow hover:bg-orange/10 transition-colors min-h-[40px] flex items-center"
          >
            {copy.terminal.viewResume}
          </Link>
          <Link
            href="/resume?download=true"
            className="px-4 sm:px-5 py-2.5 text-sm text-muted border border-border rounded hover:text-text hover:border-muted transition-colors min-h-[40px] flex items-center"
          >
            {copy.terminal.downloadPdf}
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors"
          >
            {copy.terminal.github}
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors"
          >
            {copy.terminal.linkedin}
          </a>
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-blue transition-colors"
          >
            {copy.terminal.web}
          </a>
        </div>
      </div>
      <div className="border-t border-orange/40 glow-orange" />
    </div>
  );
}
