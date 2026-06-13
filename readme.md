# Mini Cursor

A lightweight, local-first AI code editor inspired by Cursor and Windsurf. Built to run entirely on your machine with no cloud dependencies, telemetry, or account requirements.

## What this is

I built Mini Cursor as a focused experiment in what a minimal, streaming AI IDE should look like. It’s not trying to replace VS Code or bundle 500 extensions. Instead, it strips things down to the essentials: a file explorer, a real Monaco editor, and an AI chat workflow that can actually edit your code with visual diff previews.

Everything runs locally, the UI is dark-themed by default, and the architecture is kept simple enough that you can read through it and extend it yourself.

## Features

- 📁 **File Explorer** — Browse, create, and delete files/folders in any local directory
- 🖥️ **Monaco Editor** — Full syntax highlighting, multi-tab support, and `Ctrl/Cmd + S` saving
- 🤖 **AI Chat Panel** — Streamed responses with automatic code block extraction
- 🔍 **Diff Preview** — Visual side-by-side diff before applying AI changes to your file
- 💻 **Integrated Terminal** — PTY terminal architecture using `xterm.js` + `node-pty`
- 📂 **Workspace Support** — Point to any folder on your machine and start working
- 🔑 **Mock AI Fallback** — Works out of the box without an OpenAI key

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- Tailwind CSS
- Monaco Editor (`@monaco-editor/react`)
- xterm.js + xterm-addon-fit
- Socket.IO client

### Backend

- Node.js + Express
- Socket.IO + `node-pty`
- OpenAI SDK (optional)
- `diff` (for patch generation)

## How to Use

1. Paste an absolute workspace path (for example `/Users/you/Projects/my-app`) into the top navbar and hit **Load**
2. The file tree will populate automatically
3. Click files to open them in the editor
4. Use the AI chat panel to generate or modify code
5. AI-generated code can be previewed before applying changes

## AI Configuration

By default, the IDE uses a mock AI that streams text locally. This means you can test the UI, streaming behavior, and diff flow without spending credits.

To use real OpenAI responses:

- Add your key to `backend/.env`
- The backend automatically switches to `gpt-3.5-turbo` with streaming enabled
- If the key is missing or invalid, it gracefully falls back to the mock

## Known Limitations & Next Steps

This is intentionally kept lightweight. A few things you’ll notice are missing (by design or for now):

- No AI autocomplete (tab-to-complete) yet — chat-only for now
- File changes in the OS aren’t auto-synced back to the editor (reload the workspace to refresh)
- Windows terminal requires `node-pty` build tools to compile
- No built-in git UI (the terminal handles that for now)

If you fork this, the codebase is structured to be friendly to additions. The API routes are separated, the React components are decoupled, and the streaming logic is isolated. Feel free to swap the AI provider, add linting, or wire up a file watcher.

## License

MIT. Do whatever you want with it. Credits appreciated but not required.