'use client';
import { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  path: string;
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onSelectionChange: (selected: string) => void;
}

export default function Editor({ path, content, onChange, onSave, onSelectionChange }: EditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount = (editor: any) => {
    editorRef.current = editor;
    editor.addCommand(2048 | 49, () => onSave()); // Ctrl+S
    editor.onDidChangeCursorSelection(() => {
      const sel = editor.getModel()?.getValueInRange(editor.getSelection()) || '';
      onSelectionChange(sel);
    });
  };

  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rs: 'rust', go: 'go', java: 'java', rb: 'ruby',
    cpp: 'cpp', c: 'c', html: 'html', css: 'css', json: 'json',
    md: 'markdown', yml: 'yaml', yaml: 'yaml', sh: 'shell', bash: 'shell',
  };
  const language = languageMap[ext || ''] || 'plaintext';

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme="vs-dark"
      value={content}
      onChange={(val) => onChange(val || '')}
      onMount={handleMount}
      options={{
        minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
        fontSize: 13,
        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        bracketPairColorization: { enabled: true },
        padding: { top: 8 },
      }}
    />
  );
}
