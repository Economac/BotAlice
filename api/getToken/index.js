module.exports = async function (context, req) {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
    return;
  }

  const DIRECT_LINE_SECRET = process.env.DIRECTLINESECRET;

  if (!DIRECT_LINE_SECRET) {
    context.res = {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Secret no configurado' })
    };
    return;
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
      context.res = {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Error ${response.status}`, detail: responseText })
      };
      return;
    }

    const data = JSON.parse(responseText);
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ token: data.token, conversationId: data.conversationId })
    };

  } catch (err) {
    context.res = {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: `Error interno: ${err.message}` })
    };
  }
};