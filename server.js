// Servidor intermediário do Jarvis
// Guarda a chave da API da Claude em segredo e repassa as mensagens do app.
//
// Como rodar:
//   1. npm install express cors node-fetch dotenv
//   2. crie um arquivo .env com: CLAUDE_API_KEY=sua-chave-aqui
//   3. node server.js
//
// Depois, publique esse servidor em algum lugar gratuito (Render, Railway, Fly.io)
// e cole o endereço dele na variável SERVER_URL do App.js.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Mensagem vazia.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system:
          'Você é o JARVIS, assistente pessoal do usuário. Responda sempre em português do Brasil, de forma curta, educada e chamando o usuário de "senhor".',
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const reply = data?.content?.[0]?.text || 'Não consegui pensar numa resposta, senhor.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao falar com a API.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Jarvis server rodando na porta ${PORT}`));
