const express = require('express');
const diff = require('diff');
const router = express.Router();

router.post('/', function (req, res) {
  const oldText = req.body.oldText;
  const newText = req.body.newText;
  if (oldText === undefined || newText === undefined) {
    return res.status(400).json({ error: 'Both oldText and newText required' });
  }
  const changes = diff.createTwoFilesPatch('old', 'new', oldText, newText);
  res.json({ diff: changes });
});

module.exports = router;
