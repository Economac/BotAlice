require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir el index.html como archivo estático
app.use(express.static('.'));

// Endpoint que reemplaza la Netlify Function
app.post('/api/getToken', async (req, res) => {
  const DIRECT_LINE_SECRET = process.env.DIRECTLINESECRET;

  if (!DIRECT_LINE_SECRET) {
    return res.status(500).json({ error: 'Secret no configurado' });
  }

  try {
    const response = await fetch(
      'https://directline.botframework.com/v3/directline/tokens/generate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(200).json({
        error: `Error ${response.status}`,
        detail: responseText,
      });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json({
      token: data.token,
      conversationId: data.conversationId,
    });

  } catch (err) {
    return res.status(500).json({ error: `Error interno: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🤖 Alice lista en http://localhost:${PORT}/index.html`);
});