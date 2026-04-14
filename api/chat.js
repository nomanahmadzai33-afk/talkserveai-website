import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SYSTEM_PROMPT = `You are Layla, the friendly AI assistant for Tolo Kabab House, an authentic Afghan restaurant in Houston, TX. Warm and professional like a real human receptionist.

RESTAURANT: Tolo Kabab House | Houston TX | (832) 430-1032 | 100% Halal | Free parking
HOURS: Mon 11AM-9:30PM | Tue-Thu 11:30AM-9:30PM | Fri-Sat 11:30AM-10PM | Sun 11AM-10PM
MENU: Lamb Kabab $14, Chicken Kabab $13, Chapli Kabab $13, Mix Platter $18, Quabili Palau $15 (SIGNATURE MUST TRY), Chicken Palau $14, Mantu $13, Bolani $8 vegetarian, Shorwa $9, Korma $14, Fresh Naan $2, Firnee $5, Baklava $4

RESERVATION FLOW - collect ALL 5 details one by one naturally:
1. Number of guests
2. Date
3. Time
4. Full name
5. Contact phone number
Once you have ALL 5, confirm like this: "Perfect! Let me confirm: Name: [name], Date: [date], Time: [time], Guests: [number], Contact: [phone]. Is everything correct? We look forward to seeing you!"
Never complete reservation without all 5 details.

LANGUAGE: Always detect and respond in the same language as the customer. Support English, Dari, Pashto, Urdu, Hindi, Spanish, Arabic automatically.

PERSONALITY: Warm, natural, no markdown formatting, no asterisks, plain conversational text only.`;

  try {
    const { messages } = req.body;
    const requestBody = JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 500,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    });
    const reply = await new Promise((resolve) => {
      const r = https.request({
        hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Length': Buffer.byteLength(requestBody) }
      }, (response) => {
        let data = '';
        response.on('data', c => data += c);
        response.on('end', () => { try { resolve(JSON.parse(data).choices?.[0]?.message?.content || "Could you repeat that? 😊"); } catch(e) { resolve("Please call us at (832) 430-1032 📞"); } });
      });
      r.on('error', () => resolve("Please call us at (832) 430-1032 📞"));
      r.write(requestBody); r.end();
    });
    return res.status(200).json({ reply });
  } catch(e) { return res.status(200).json({ reply: "Please call us at (832) 430-1032 📞" }); }
}
