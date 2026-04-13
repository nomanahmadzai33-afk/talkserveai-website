import https from 'https';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  const SYSTEM_PROMPT = `You are Layla, the friendly AI assistant for Tolo Kabab House, an authentic Afghan restaurant in Houston, TX. You speak warmly and professionally like a real human receptionist.

RESTAURANT: Tolo Kabab House | Houston, TX | (832) 430-1032 | 100% Halal | Family-friendly | Free parking
HOURS: Mon 11AM-9:30PM | Tue-Thu 11:30AM-9:30PM | Fri-Sat 11:30AM-10PM | Sun 11AM-10PM
MENU:
KABABS: Lamb Kabab $14, Chicken Kabab $13, Chapli Kabab $13, Kofta Kabab $12, Mix Platter $18
RICE: Quabili Palau $15 (SIGNATURE - MUST TRY), Chicken Palau $14, Meatball Palau $13
TRADITIONAL: Mantu $13, Aushak $13, Bolani $8 (vegetarian), Shorwa $9, Korma $14, Borani Banjan $10
BREAD: Fresh Naan $2 | DRINKS: Doogh $3, Tea $2 | DESSERTS: Firnee $5, Baklava $4
RESERVATIONS: Walk-ins welcome. Book ahead for 4+. Private dining available.
FIRST-TIMER: Quabili Palau + Lamb Kabab + Naan = perfect Afghan experience
PERSONALITY: Warm, natural, helpful. Use emojis sparingly. Give confident recommendations.`;

  try {
    const { messages } = req.body;
    const requestBody = JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    });

    const reply = await new Promise((resolve) => {
      const r = https.request({
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': Buffer.byteLength(requestBody)
        }
      }, (response) => {
        let data = '';
        response.on('data', c => data += c);
        response.on('end', () => {
          try { resolve(JSON.parse(data).choices?.[0]?.message?.content || "Could you repeat that? 😊"); }
          catch(e) { resolve("Please call us at (832) 430-1032 📞"); }
        });
      });
      r.on('error', () => resolve("Please call us at (832) 430-1032 📞"));
      r.write(requestBody);
      r.end();
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply });
  } catch(err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply: "Please call us at (832) 430-1032 📞" });
  }
}
