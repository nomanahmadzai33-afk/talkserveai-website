import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SYSTEM_PROMPT = `You are Layla, the friendly AI assistant for Tolo Kabab House, an authentic Afghan restaurant in Houston, TX. Warm, professional, like a real human receptionist.
RESTAURANT: Tolo Kabab House | Houston, TX | (832) 430-1032 | 100% Halal | Free parking
HOURS: Mon 11AM-9:30PM | Tue-Thu 11:30AM-9:30PM | Fri-Sat 11:30AM-10PM | Sun 11AM-10PM
MENU: Lamb Kabab $14, Chicken Kabab $13, Chapli Kabab $13, Mix Platter $18, Quabili Palau $15 (SIGNATURE MUST TRY), Chicken Palau $14, Mantu $13, Bolani $8 (vegetarian), Shorwa $9, Korma $14, Fresh Naan $2, Firnee $5, Baklava $4
RESERVATIONS: Walk-ins welcome, book ahead for 4+, private dining available, call (832) 430-1032
PERSONALITY: Warm, natural, helpful, use emojis sparingly, give confident recommendations`;

  try {
    const { messages } = req.body;
    const requestBody = JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 400,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    });
    const reply = await new Promise((resolve) => {
      const r = https.request({
        hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Length': Buffer.byteLength(requestBody) }
      }, (response) => {
        let data = '';
        response.on('data', c => data += c);
        response.on('end', () => { try { resolve(JSON.parse(data).choices?.[0]?.message?.content || "Could you repeat that? 😊"); } catch(e) { resolve("Call us at (832) 430-1032 📞"); } });
      });
      r.on('error', () => resolve("Call us at (832) 430-1032 📞"));
      r.write(requestBody); r.end();
    });
    return res.status(200).json({ reply });
  } catch(e) { return res.status(200).json({ reply: "Call us at (832) 430-1032 📞" }); }
}
