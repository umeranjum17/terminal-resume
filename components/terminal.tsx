"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import {
  BOOT_LINES,
  ASCII_BANNER,
  COMMAND_NAMES,
  executeCommand,
} from "@/lib/commands";

interface TerminalLine {
  id: number;
  type: "boot" | "banner" | "input" | "output";
  content: string;
}

let lineId = 0;

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dubaiTime, setDubaiTime] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Dubai clock
  useEffect(() => {
    const update = () => {
      const now = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Dubai",
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

  // Boot sequence
  useEffect(() => {
    if (booted) return;

    if (reducedMotion.current) {
      setLines([
        { id: lineId++, type: "boot", content: "system ready." },
        { id: lineId++, type: "banner", content: ASCII_BANNER },
      ]);
      setBooted(true);
      return;
    }

    let cancelled = false;
    const bootLines: TerminalLine[] = [];

    async function boot() {
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (cancelled) return;
        bootLines.push({
          id: lineId++,
          type: "boot",
          content: BOOT_LINES[i],
        });
        setLines([...bootLines]);
        await new Promise((r) => setTimeout(r, 140));
      }

      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      bootLines.push({
        id: lineId++,
        type: "banner",
        content: ASCII_BANNER,
      });
      setLines([...bootLines]);
      setBooted(true);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [booted]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (booted) focusInput();
  }, [booted, focusInput]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newLines: TerminalLine[] = [
      ...lines,
      {
        id: lineId++,
        type: "input",
        content: trimmed,
      },
    ];

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      setInput("");
      return;
    }

    const result = executeCommand(trimmed);
    if (result !== null) {
      newLines.push({
        id: lineId++,
        type: "output",
        content: result,
      });
    }

    setLines(newLines);
    setInput("");
  }, [input, lines]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const newIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
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
        const match = COMMAND_NAMES.find((c) =>
          c.startsWith(input.toLowerCase())
        );
        if (match) setInput(match);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [handleSubmit, history, historyIndex, input]
  );

  return (
    <div className="h-full flex flex-col scanlines crt-vignette">
      {/* Skip link */}
      <a
        href="/resume"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-bg-elevated focus:text-text focus:rounded"
      >
        Skip to resume
      </a>

      {/* Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red" />
          <div className="w-3 h-3 rounded-full bg-yellow" />
          <div className="w-3 h-3 rounded-full bg-green" />
        </div>
        <span className="text-muted text-xs sm:text-sm">
          umer@dubai: ~ — zsh
        </span>
        <span className="text-muted text-xs font-mono tabular-nums">
          {dubaiTime} <span className="text-muted/60">GST</span>
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 cursor-text"
        onClick={focusInput}
      >
        <div className="max-w-4xl mx-auto space-y-1">
          {lines.map((line) => (
            <div key={line.id} className="leading-relaxed">
              {line.type === "input" ? (
                <div className="flex gap-2">
                  <span className="text-green shrink-0">❯</span>
                  <span className="text-text">{line.content}</span>
                </div>
              ) : (
                <div
                  className={
                    line.type === "banner" ? "whitespace-pre-wrap my-4" : ""
                  }
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input row */}
      {booted && (
        <div className="shrink-0 border-t border-border bg-bg px-4 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <span className="text-green shrink-0">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-text outline-none caret-orange placeholder:text-muted/40 font-mono"
              placeholder="type a command..."
              aria-label="terminal input"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <span className="w-2 h-5 bg-orange animate-blink" />
          </div>
        </div>
      )}
    </div>
  );
}
