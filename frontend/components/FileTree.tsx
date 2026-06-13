'use client';
import { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaPlus, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  tree: FileNode[];
  onOpenFile: (path: string) => void;
  onCreateFile: (type: 'file' | 'directory', path: string, content?: string) => void;
  onDeleteFile: (path: string) => void;
  workspacePath: string;
}

export default function FileTree({ tree, onOpenFile, onCreateFile, onDeleteFile, workspacePath }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'file' | 'directory'>('file');

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const handleCreate = (parentPath: string) => {
    if (!newName.trim()) return;
    const full = parentPath ? parentPath + '/' + newName : newName;
    onCreateFile(newType, full);
    setNewName('');
    setCreating(false);
  };

  const renderNodes = (nodes: FileNode[], depth: number = 0) =>
    nodes.map((node) => {
      const isDir = node.type === 'directory';
      const isOpen = expanded.has(node.path);
      return (
        <div key={node.path}>
          <div
            className="flex items-center py-0.5 hover:bg-gray-750 cursor-pointer group text-sm"
            style={{ paddingLeft: (depth * 16 + 8) + 'px' }}
            onClick={() => (isDir ? toggle(node.path) : onOpenFile(node.path))}
          >
            {isDir && (
              <span className="mr-1 text-gray-500">
                {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              </span>
            )}
            <span className="mr-2">
              {isDir
                ? (isOpen ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-600" />)
                : <FaFile className="text-gray-400" />}
            </span>
            <span className="flex-1 truncate">{node.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-1"
            >
              <FaTrash size={10} />
            </button>
          </div>
          {isDir && isOpen && node.children && renderNodes(node.children, depth + 1)}
        </div>
      );
    });

  if (!workspacePath) {
    return <div className="p-4 text-gray-500 text-xs italic">No workspace loaded.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Explorer</span>
        <button
          onClick={() => setCreating(true)}
          className="text-blue-400 hover:text-blue-300"
          title="New file/folder"
        >
          <FaPlus size={12} />
        </button>
      </div>
      {creating && (
        <div className="flex items-center px-3 py-2 space-x-1 bg-gray-800">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="name"
            className="bg-gray-700 text-xs text-gray-200 rounded px-2 py-1 flex-1 focus:outline-none"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate('')}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="bg-gray-700 text-xs text-gray-200 rounded px-1 py-1"
          >
            <option value="file">file</option>
            <option value="directory">folder</option>
          </select>
          <button
            onClick={() => handleCreate('')}
            className="text-green-400 text-xs font-bold px-1"
          >
            ✓
          </button>
          <button onClick={() => setCreating(false)} className="text-gray-400 text-xs px-1">
            ✕
          </button>
        </div>
      )}
      <div className="py-1">{renderNodes(tree)}</div>
    </div>
  );
}
