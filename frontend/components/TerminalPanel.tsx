"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

import "xterm/css/xterm.css";

interface TerminalPanelProps {
  workspacePath: string;
}

export default function TerminalPanel({
  workspacePath,
}: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let socket: any;
    let term: any;

    const initTerminal = async () => {
      if (!terminalRef.current) return;

      const xterm = await import("xterm");

      const Terminal = xterm.Terminal;

      term = new Terminal({
        cols: 100,
        rows: 20,

        cursorBlink: true,

        fontSize: 13,

        fontFamily: "monospace",

        theme: {
          background: "#0d1117",
          foreground: "#c9d1d9",
          cursor: "#58a6ff",
        },
      });

      requestAnimationFrame(() => {
        if (!terminalRef.current) return;

        term.open(terminalRef.current);

        socket = io("http://localhost:5001", {
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          socket.emit("start-terminal", {
            rootPath: workspacePath,
          });
        });

        socket.on("terminal-output", (data: string) => {
          term.write(data);
        });

        socket.on("terminal-error", (err: any) => {
          term.writeln("");
          term.writeln("[Terminal Error]");
          term.writeln(err?.message || "Unknown error");
        });

        term.onData((data: string) => {
          socket.emit("terminal-input", data);
        });
      });
    };

    initTerminal();

    return () => {
      try {
        socket?.disconnect();
        term?.dispose();
      } catch {}
    };
  }, [workspacePath]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] overflow-hidden">
      <div className="h-8 shrink-0 border-b border-gray-700 flex items-center px-3 text-xs text-gray-400">
        Terminal
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div ref={terminalRef} />
      </div>
    </div>
  );
}