'use client';

export default function DiffViewer() {
  return (
    <div className="w-full h-[150px] border border-gray-600 rounded-md flex items-center justify-center text-gray-400 text-sm">
      Diff Viewer Temporarily Disabled
    </div>
  );
}
// 'use client';
// import { useEffect, useRef } from 'react';
// import * as monaco from 'monaco-editor';

// interface DiffViewerProps {
//   oldText: string;
//   newText: string;
// }

// export default function DiffViewer({ oldText, newText }: DiffViewerProps) {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;
//     const originalModel = monaco.editor.createModel(oldText, 'text/plain');
//     const modifiedModel = monaco.editor.createModel(newText, 'text/plain');
//     const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
//       theme: 'vs-dark',
//       readOnly: true,
//       automaticLayout: true,
//       minimap: { enabled: false },
//       scrollBeyondLastLine: false,
//       renderSideBySide: true,
//     });
//     diffEditor.setModel({ original: originalModel, modified: modifiedModel });
//     const lineCount = Math.max(oldText.split('\n').length, newText.split('\n').length);
//     const height = Math.min(Math.max(lineCount * 20, 80), 350);
//     containerRef.current.style.height = height + 'px';
//     return () => {
//       diffEditor.dispose();
//       originalModel.dispose();
//       modifiedModel.dispose();
//     };
//   }, [oldText, newText]);

//   return <div ref={containerRef} className="w-full border border-gray-600 rounded-md overflow-hidden" style={{ height: '150px' }} />;
// }
