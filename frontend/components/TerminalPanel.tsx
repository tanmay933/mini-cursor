'use client';
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  workspacePath: string;
}

export default function TerminalPanel({ workspacePath }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const socket = useRef<Socket | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!workspacePath) return;

    term.current = new Terminal({
      theme: { background: '#0d1117', foreground: '#c9d1d9', cursor: '#58a6ff' },
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      allowProposedApi: true,
    });
    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    if (terminalRef.current) {
      term.current.open(terminalRef.current);
      setTimeout(() => fitAddon.current?.fit(), 50);
    }

    socket.current = io('http://localhost:5001');
    socket.current.emit('start-terminal', { rootPath: workspacePath });
    socket.current.on('terminal-output', (data: string) => {
      term.current?.write(data);
    });
    term.current.onData((data) => {
      socket.current?.emit('terminal-input', data);
    });

    const handleResize = () => {
      fitAddon.current?.fit();
      const dims = term.current?.cols && term.current?.rows ? { cols: term.current.cols, rows: term.current.rows } : null;
      if (dims) socket.current?.emit('resize-terminal', dims);
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.current?.disconnect();
      term.current?.dispose();
    };
  }, [workspacePath]);

  return (
    <div className="h-full w-full bg-[#0d1117]">
      <div className="bg-gray-850 border-b border-gray-700 px-3 py-1 text-xs text-gray-400 uppercase tracking-wide flex items-center space-x-2">
        <span>▸ Terminal</span>
        <span className="text-gray-600 text-[10px]">{workspacePath || 'no workspace'}</span>
      </div>
      <div ref={terminalRef} className="h-[calc(100%-28px)] w-full" />
    </div>
  );
}
