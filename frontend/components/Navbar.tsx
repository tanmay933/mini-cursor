'use client';
import { useState } from 'react';
import { FaTerminal, FaFolderOpen } from 'react-icons/fa';

interface NavbarProps {
  workspacePath: string;
  onWorkspaceChange: (path: string) => void;
  onToggleTerminal: () => void;
  terminalVisible: boolean;
}

export default function Navbar({
  workspacePath,
  onWorkspaceChange,
  onToggleTerminal,
  terminalVisible,
}: NavbarProps) {
  const [input, setInput] = useState(workspacePath);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onWorkspaceChange(input.trim());
  };

  return (
    <nav className="bg-gray-850 border-b border-gray-700 flex items-center px-4 py-2 space-x-3">
      <span className="text-lg font-bold text-blue-400 tracking-wide">⚡ Mini Cursor</span>
      <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-2">
        <FaFolderOpen className="text-gray-400" />
        <input
          type="text"
          placeholder="Enter workspace path…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-gray-750 text-gray-200 rounded px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Load
        </button>
      </form>
      <button
        onClick={onToggleTerminal}
        className={'p-2 rounded text-sm ' + (terminalVisible ? 'bg-blue-600 text-white' : 'bg-gray-750 text-gray-400')}
        title="Toggle Terminal"
      >
        <FaTerminal />
      </button>
    </nav>
  );
}
