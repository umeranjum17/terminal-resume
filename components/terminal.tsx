"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { profile } from "@/content/profile";
import { AUTO_COMMANDS, executeCommand } from "@/lib/commands";

// ─── Types ──────────────────────────────────────────────────────

interface LineItem {
  id: number;
  type: "input" | "output";
  content: string;
}

let lineId = 0;

// ─── PromptLine: types the command character by character ───────

function PromptLine({ text, cursor }: { text: string; cursor: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green font-semibold select-none shrink-0">$</span>
      <span className="text-text">{text}</span>
      {cursor && (
        <span className="inline-block w-2 h-4 bg-text/80 rounded-sm cursor-blink shrink-0 ml-0.5" />
      )}
    </div>
  );
}

// ─── OutputLine: the command result, fades in ───────────────────

function OutputLine({ content }: { content: string }) {
  return (
    <div
      className="text-sm text-text-dim leading-relaxed output-fade"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// ─── Main Terminal Component ────────────────────────────────────

export default function Terminal() {
  const [lines, setLines] = useState<LineItem[]>([]);
  const [typingText, setTypingText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [dubaiTime, setDubaiTime] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Dubai time
  useEffect(() => {
    const update = () => {
      setDubaiTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: profile.terminal.timeZone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
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
  }, [lines, typingText, scrollToBottom]);

  // ─── Main Presentation Loop ───
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const runCycle = async () => {
      await sleep(600);
      if (cancelled) return;

      for (let i = 0; i < AUTO_COMMANDS.length; i++) {
        if (cancelled) return;
        const cmd = AUTO_COMMANDS[i];

        await typeCommand(cmd);
        if (cancelled) return;

        await sleep(200);
        if (cancelled) return;

        const result = executeCommand(cmd);
        if (result !== null) {
          setLines((prev) => [
            ...prev,
            { id: lineId++, type: "input", content: cmd },
            ...result.split("\n").map((line) => ({
              id: lineId++,
              type: "output" as const,
              content: line,
            })),
          ]);
        }
        if (cancelled) return;

        await sleep(3500);
        if (cancelled) return;
      }

      await sleep(2500);
      if (cancelled) return;

      setLines([]);
      await sleep(800);
      if (cancelled) return;

      hasStarted.current = false;
    };

    function typeCommand(cmd: string): Promise<void> {
      return new Promise((resolve) => {
        setTypingText("");
        setShowCursor(true);

        let i = 0;
        const typeNext = () => {
          if (cancelled) {
            resolve();
            return;
          }
          i++;
          if (i >= cmd.length) {
            setTypingText(cmd);
            setShowCursor(false);
            resolve();
            return;
          }
          setTypingText(cmd.slice(0, i));
          const speed = 40 + Math.random() * 25;
          timer = setTimeout(typeNext, speed);
        };
        timer = setTimeout(typeNext, 80);
      });
    }

    function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => {
        timer = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });
    }

    runCycle();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Status bar */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 border-b border-border text-xs text-muted select-none">
        <span className="font-mono tracking-wide">
          {profile.terminal.handle}@{profile.terminal.host}
        </span>
        <span className="font-mono tabular-nums">
          {dubaiTime} {profile.terminal.timeZoneLabel}
        </span>
      </div>

      {/* Terminal body — full bleed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        aria-live="polite"
        aria-label="Terminal output"
      >
        <div className="max-w-2xl">
          {lines.map((line) =>
            line.type === "input" ? (
              <PromptLine key={line.id} text={line.content} cursor={false} />
            ) : (
              <OutputLine key={line.id} content={line.content} />
            )
          )}

          {typingText && <PromptLine text={typingText} cursor={showCursor} />}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
