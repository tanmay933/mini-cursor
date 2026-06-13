const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function readTree(dirPath, basePath) {
  if (!basePath) basePath = dirPath;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.map(function (entry) {
    const full = path.join(dirPath, entry.name);
    const rel = path.relative(basePath, full);
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: rel,
        type: 'directory',
        children: readTree(full, basePath),
      };
    }
    return { name: entry.name, path: rel, type: 'file' };
  });
}

router.get('/', function (req, res) {
  const rootPath = req.query.root || process.cwd();
  try {
    res.json(readTree(rootPath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

router.get('/content', function (req, res) {
  const rootPath = req.query.root || process.cwd();
  const filePath = req.query.file;
  if (!filePath) return res.status(400).json({ error: 'File path required' });
  try {
    const content = fs.readFileSync(path.join(rootPath, filePath), 'utf8');
    res.json({ content: content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

router.post('/', function (req, res) {
  const rootPath = req.query.root || process.cwd();
  const type = req.body.type;
  const relPath = req.body.path;
  const content = req.body.content;
  if (!type || !relPath) return res.status(400).json({ error: 'Missing type or path' });
  const full = path.join(rootPath, relPath);
  try {
    if (type === 'directory') {
      fs.mkdirSync(full, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content || '', 'utf8');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

router.put('/', function (req, res) {
  const rootPath = req.query.root || process.cwd();
  const filePath = req.query.file;
  if (!filePath) return res.status(400).json({ error: 'File path required' });
  try {
    fs.writeFileSync(path.join(rootPath, filePath), req.body.content, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/', function (req, res) {
  const rootPath = req.query.root || process.cwd();
  const filePath = req.query.file;
  if (!filePath) return res.status(400).json({ error: 'File path required' });
  try {
    fs.rmSync(path.join(rootPath, filePath), { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
