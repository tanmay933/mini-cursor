require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const fs = require('fs');

const { Server } = require('socket.io');
const pty = require('node-pty');

const filesRouter = require('./routes/files');
const chatRouter = require('./routes/chat');
const diffRouter = require('./routes/diff');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/files', filesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/diff', diffRouter);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  let ptyProcess = null;

  socket.on('start-terminal', ({ rootPath }) => {
    try {
      if (ptyProcess) {
        ptyProcess.kill();
        ptyProcess = null;
      }

      const shell =
        process.platform === 'win32'
          ? 'powershell.exe'
          : process.env.SHELL || '/bin/zsh';

      const cwd = rootPath && typeof rootPath === 'string' && fs.existsSync(rootPath) ? rootPath : process.cwd();

      console.log('Starting terminal...');
      console.log('Shell:', shell);
      console.log('CWD:', cwd);

      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd,
        env: process.env,
      });

      ptyProcess.onData((data) => {
        socket.emit('terminal-output', data);
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        console.log('Terminal exited:', exitCode, signal);

        socket.emit('terminal-exit', {
          exitCode,
          signal,
        });

        ptyProcess = null;
      });
    } catch (error) {
      console.error('PTY START ERROR:', error);

      socket.emit('terminal-error', {
        message: error.message,
      });
    }
  });

  socket.on('terminal-input', (data) => {
    try {
      if (ptyProcess) {
        ptyProcess.write(data);
      }
    } catch (error) {
      console.error('PTY WRITE ERROR:', error);
    }
  });

  socket.on('resize-terminal', ({ cols, rows }) => {
    try {
      if (ptyProcess) {
        ptyProcess.resize(cols, rows);
      }
    } catch (error) {
      console.error('PTY RESIZE ERROR:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);

    try {
      if (ptyProcess) {
        ptyProcess.kill();
        ptyProcess = null;
      }
    } catch (error) {
      console.error('PTY CLEANUP ERROR:', error);
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});