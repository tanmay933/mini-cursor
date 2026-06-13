require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');

const filesRouter = require('./routes/files');
const chatRouter = require('./routes/chat');
const diffRouter = require('./routes/diff');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/files', filesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/diff', diffRouter);

io.on('connection', (socket) => {
  let ptyProcess = null;

  socket.on('start-terminal', ({ rootPath }) => {
    if (ptyProcess) ptyProcess.kill();
    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh';
    const cwd = rootPath || process.cwd();
    ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd,
      env: process.env,
    });
    ptyProcess.onData((data) => socket.emit('terminal-output', data));
    ptyProcess.onExit(({ exitCode, signal }) => {
      socket.emit('terminal-exit', { exitCode, signal });
      ptyProcess = null;
    });
    socket.on('terminal-input', (data) => {
      if (ptyProcess) ptyProcess.write(data);
    });
    socket.on('resize-terminal', ({ cols, rows }) => {
      if (ptyProcess) ptyProcess.resize(cols, rows);
    });
    socket.on('disconnect', () => {
      if (ptyProcess) ptyProcess.kill();
    });
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log('Backend listening on http://localhost:' + PORT);
});
