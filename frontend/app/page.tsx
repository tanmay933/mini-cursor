"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import FileTree from "../components/FileTree";
import EditorTabs from "../components/EditorTabs";
import ChatPanel from "../components/ChatPanel";
import TerminalPanel from "../components/TerminalPanelWrapper";

interface OpenFile {
  path: string;
  content: string;
}

export default function Home() {
  const [workspacePath, setWorkspacePath] = useState<string>("");
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [selectedCode, setSelectedCode] = useState("");

  useEffect(() => {
    if (!workspacePath) {
      setFileTree([]);
      setOpenFiles([]);
      setActiveFilePath(null);
      return;
    }
    fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath),
    )
      .then((r) => r.json())
      .then(setFileTree)
      .catch(console.error);
  }, [workspacePath]);

  const openFile = useCallback(
    async (filePath: string) => {
      if (openFiles.find((f) => f.path === filePath)) {
        setActiveFilePath(filePath);
        return;
      }
      const res = await fetch(
        "http://localhost:5001/api/files/content?root=" +
          encodeURIComponent(workspacePath) +
          "&file=" +
          encodeURIComponent(filePath),
      );
      const { content } = await res.json();
      setOpenFiles((prev) => [...prev, { path: filePath, content }]);
      setActiveFilePath(filePath);
    },
    [workspacePath, openFiles],
  );

  const closeFile = useCallback(
    (filePath: string) => {
      setOpenFiles((prev) => prev.filter((f) => f.path !== filePath));
      if (activeFilePath === filePath) {
        const remaining = openFiles.filter((f) => f.path !== filePath);
        setActiveFilePath(
          remaining.length > 0 ? remaining[remaining.length - 1].path : null,
        );
      }
    },
    [activeFilePath, openFiles],
  );

  const updateFileContent = useCallback(
    (filePath: string, newContent: string) => {
      setOpenFiles((prev) =>
        prev.map((f) =>
          f.path === filePath ? { ...f, content: newContent } : f,
        ),
      );
    },
    [],
  );

  const saveFileToDisk = async (filePath: string, content: string) => {
    await fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath) +
        "&file=" +
        encodeURIComponent(filePath),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    );
  };

  const createFile = async (
    type: "file" | "directory",
    relativePath: string,
    content?: string,
  ) => {
    await fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, path: relativePath, content }),
      },
    );
    const res = await fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath),
    );
    setFileTree(await res.json());
  };

  const deleteFile = async (relativePath: string) => {
    await fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath) +
        "&file=" +
        encodeURIComponent(relativePath),
      { method: "DELETE" },
    );
    const res = await fetch(
      "http://localhost:5001/api/files?root=" +
        encodeURIComponent(workspacePath),
    );
    setFileTree(await res.json());
    if (openFiles.find((f) => f.path === relativePath)) {
      closeFile(relativePath);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar
        workspacePath={workspacePath}
        onWorkspaceChange={setWorkspacePath}
        onToggleTerminal={() => setTerminalVisible((v) => !v)}
        terminalVisible={terminalVisible}
      />
      <div className="flex flex-1 min-h-0">
        <div className="w-60 bg-gray-850 border-r border-gray-700 flex flex-col">
          <FileTree
            tree={fileTree}
            onOpenFile={openFile}
            onCreateFile={createFile}
            onDeleteFile={deleteFile}
            workspacePath={workspacePath}
          />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <EditorTabs
              files={openFiles}
              activeFile={activeFilePath}
              onSelectFile={setActiveFilePath}
              onCloseFile={closeFile}
              onContentChange={updateFileContent}
              onSaveFile={saveFileToDisk}
              setSelectedCode={setSelectedCode}
            />
          </div>
          {terminalVisible && (
            <div className="h-48 border-t border-gray-700">
              {" "}
              <TerminalPanel
                key={workspacePath}
                workspacePath={workspacePath}
              />{" "}
            </div>
          )}
        </div>
        <div className="w-96 border-l border-gray-700 flex flex-col">
          <ChatPanel
            workspacePath={workspacePath}
            activeFileContent={
              activeFilePath
                ? openFiles.find((f) => f.path === activeFilePath)?.content ||
                  ""
                : ""
            }
            activeFilePath={activeFilePath}
            onApplyCode={(newContent) => {
              if (activeFilePath) {
                updateFileContent(activeFilePath, newContent);
                saveFileToDisk(activeFilePath, newContent);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
