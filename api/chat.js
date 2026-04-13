const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const SYSTEM_PROMPT = `You are Layla, the friendly AI assistant for Tolo Kabab House, an authentic Afghan restaurant in Houston, TX. You speak warmly and professionally like a real human receptionist.

RESTAURANT: Tolo Kabab House | Houston, TX | (832) 430-1032 | 100% Halal | Family-friendly | Free parking
HOURS: Mon 11AM-9:30PM | Tue-Thu 11:30AM-9:30PM | Fri-Sat 11:30AM-10PM | Sun 11AM-10PM

MENU:
KABABS: Lamb Kabab $14, Chicken Kabab $13, Chapli Kabab $13, Kofta Kabab $12, Shami Kabab $12, Mix Platter $18
RICE: Quabili Palau $15 (SIGNATURE - lamb,raisins,carrots,almonds - MUST TRY), Chicken Palau $14, Meatball Palau $13
TRADITIONAL: Mantu $13 (dumplings), Aushak $13, Bolani $8 (vegetarian), Shorwa $9 (soup), Korma $14, Sabzi $13, Borani Banjan $10 (vegetarian)
BREAD: Fresh Naan $2, Tandoori Naan $3
DRINKS: Doogh $3, Green Tea $2, Black Tea $2
DESSERTS: Firnee $5 (rice pudding), Sheer Yakh $4 (ice cream), Baklava $4

RESERVATIONS: Walk-ins welcome. Book ahead for 4+. Call (832) 430-1032. Private dining available.
FIRST-TIMER RECOMMENDATION: Quabili Palau + Lamb Kabab + fresh Naan = perfect Afghan experience

PERSONALITY: Warm, natural, helpful. Use emojis sparingly. Give confident specific recommendations. Keep answers concise but complete. Always offer more help.`;

  try {
    const { messages } = JSON.parse(event.body);
    const requestBody = JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, system: SYSTEM_PROMPT, messages });

    const reply = await new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Length': Buffer.byteLength(requestBody) }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data).content?.[0]?.text || "Could you repeat that? 😊"); }
          catch(e) { resolve("Please call us at (832) 430-1032 and we'll help right away! 📞"); }
        });
      });
      req.on('error', () => resolve("Please call us at (832) 430-1032 📞"));
      req.write(requestBody);
      req.end();
    });

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ reply }) };
  } catch(err) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ reply: "Please call us at (832) 430-1032 📞" }) };
  }
};
