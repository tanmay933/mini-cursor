const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function streamAIResponse(messages, onChunk) {
  if (!openai) {
    await mockStreamResponse(messages, onChunk);
    return;
  }
  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
}

async function mockStreamResponse(messages, onChunk) {
  const lastUserMsg =
    messages.filter((m) => m.role === 'user').pop()?.content || '';
  let text;
  if (
    lastUserMsg.toLowerCase().includes('code') ||
    lastUserMsg.includes('function') ||
    lastUserMsg.includes('component')
  ) {
    text =
      "Here's a simple implementation:\n\n```javascript\n// Generated code\nfunction hello() {\n  console.log('Hello from Mock AI');\n}\nhello();\n```";
  } else {
    text = 'Mock AI echo: "' + lastUserMsg + '"\n\nI can help you write code.';
  }
  for (const char of [...text]) {
    onChunk(char);
    await new Promise((r) => setTimeout(r, 15));
  }
}

module.exports = { streamAIResponse };
