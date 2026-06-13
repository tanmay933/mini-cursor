const express = require('express');
const router = express.Router();
const { streamAIResponse } = require('../services/aiService');

router.post('/', async function (req, res) {
  const messages = req.body.messages;
  if (!messages) return res.status(400).json({ error: 'Messages required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  try {
    await streamAIResponse(messages, function (chunk) {
      res.write('data: ' + JSON.stringify({ text: chunk }) + '\n\n');
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error(err);
    res.write('data: ' + JSON.stringify({ error: 'Stream failed' }) + '\n\n');
    res.end();
  }
});

module.exports = router;
