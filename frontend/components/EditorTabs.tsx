'use client';
import Editor from './Editor';
import { FaTimes, FaCircle } from 'react-icons/fa';

interface OpenFile {
  path: string;
  content: string;
}

interface EditorTabsProps {
  files: OpenFile[];
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onCloseFile: (path: string) => void;
  onContentChange: (path: string, content: string) => void;
  onSaveFile: (path: string, content: string) => void;
  setSelectedCode: (code: string) => void;
}

export default function EditorTabs({
  files,
  activeFile,
  onSelectFile,
  onCloseFile,
  onContentChange,
  onSaveFile,
  setSelectedCode,
}: EditorTabsProps) {
  const active = files.find((f) => f.path === activeFile);
  return (
    <div className="flex flex-col h-full">
      <div className="flex bg-gray-850 border-b border-gray-700 overflow-x-auto scrollbar-thin">
        {files.map((file) => (
          <div
            key={file.path}
            className={'flex items-center px-3 py-1.5 text-xs cursor-pointer border-r border-gray-700 space-x-2 min-w-[80px] max-w-[180px] ' +
              (file.path === activeFile
                ? 'bg-gray-950 text-blue-400 border-t-2 border-t-blue-400'
                : 'text-gray-400 hover:bg-gray-800')}
            onClick={() => onSelectFile(file.path)}
          >
            <FaCircle size={6} className="text-green-400 flex-shrink-0" />
            <span className="flex-1 truncate">{file.path.split('/').pop()}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onCloseFile(file.path); }}
              className="text-gray-500 hover:text-red-400 flex-shrink-0"
            >
              <FaTimes size={10} />
            </button>
          </div>
        ))}
        {files.length === 0 && <div className="px-3 py-1.5 text-xs text-gray-500 italic">No files open</div>}
      </div>
      <div className="flex-1 min-h-0">
        {active ? (
          <Editor
            path={active.path}
            content={active.content}
            onChange={(val) => onContentChange(active.path, val)}
            onSave={() => onSaveFile(active.path, active.content)}
            onSelectionChange={setSelectedCode}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 select-none">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">Open a file from the explorer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
