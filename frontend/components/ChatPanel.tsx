'use client';
import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaCode } from 'react-icons/fa';
import DiffViewer from './DiffViewer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  workspacePath: string;
  activeFileContent: string;
  activeFilePath: string | null;
  onApplyCode: (newContent: string) => void;
}

export default function ChatPanel({
  workspacePath,
  activeFileContent,
  activeFilePath,
  onApplyCode,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [proposedCode, setProposedCode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const extractCodeBlock = (text: string): string | null => {
    const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  const send = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setStreaming('');
    setShowDiff(false);

    try {
      const resp = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const { text } = JSON.parse(data);
              fullResponse += text;
              setStreaming(fullResponse);
            } catch {}
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullResponse }]);
      setStreaming('');

      const code = extractCodeBlock(fullResponse);
      if (code && activeFilePath) {
        setProposedCode(code);
        setShowDiff(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error from AI.' }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const applyCode = () => {
    if (proposedCode) {
      onApplyCode(proposedCode);
      setShowDiff(false);
      setProposedCode(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="px-3 py-2 border-b border-gray-700 font-semibold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-2">
        <FaRobot />
        <span>AI Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={'max-w-[90%] p-2.5 rounded-lg text-sm leading-relaxed ' +
                (msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm')}
            >
              <div className="flex items-center space-x-1 mb-1 opacity-70 text-xs">
                {msg.role === 'user' ? <FaUser size={10} /> : <FaRobot size={10} />}
                <span>{msg.role === 'user' ? 'You' : 'AI'}</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {isStreaming && streaming && (
          <div className="flex justify-start">
            <div className="max-w-[90%] p-2.5 rounded-lg rounded-bl-sm bg-gray-800 text-gray-200 text-sm">
              <div className="flex items-center space-x-1 mb-1 opacity-70 text-xs">
                <FaRobot size={10} />
                <span>AI typing…</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans">{streaming}</pre>
            </div>
          </div>
        )}
        {showDiff && proposedCode && activeFileContent && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-1 text-xs text-yellow-400">
              <FaCode size={10} />
              <span>Proposed changes (diff)</span>
            </div>
            <DiffViewer oldText={activeFileContent} newText={proposedCode} />
            <div className="flex space-x-2">
              <button onClick={applyCode} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-medium">Accept</button>
              <button onClick={() => setShowDiff(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs">Reject</button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-700 flex items-center space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask AI to write or edit code…"
          className="flex-1 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isStreaming}
        />
        <button
          onClick={send}
          disabled={isStreaming || !input.trim()}
          className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
        >
          <FaPaperPlane size={16} />
        </button>
      </div>
    </div>
  );
}
