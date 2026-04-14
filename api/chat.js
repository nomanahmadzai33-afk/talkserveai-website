import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const now = new Date();
  const houstonTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const todayFull = `${days[houstonTime.getDay()]}, ${months[houstonTime.getMonth()]} ${houstonTime.getDate()}, ${houstonTime.getFullYear()}`;

  const getDay = (d) => {
    const idx = days.indexOf(d);
    let diff = idx - houstonTime.getDay();
    if (diff <= 0) diff += 7;
    const t = new Date(houstonTime);
    t.setDate(houstonTime.getDate() + diff);
    return `${d}, ${months[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}`;
  };

  const SYSTEM_PROMPT = `You are Layla, friendly AI assistant for Tolo Kabab House, Houston TX. Warm and professional like a real human receptionist.

TODAY IN HOUSTON: ${todayFull}
UPCOMING: Monday=${getDay('Monday')}, Tuesday=${getDay('Tuesday')}, Wednesday=${getDay('Wednesday')}, Thursday=${getDay('Thursday')}, Friday=${getDay('Friday')}, Saturday=${getDay('Saturday')}, Sunday=${getDay('Sunday')}

DATE RULES: Always resolve relative dates (tomorrow, this Friday, next week) to EXACT full dates like "Friday, April 18, 2026". Never use relative dates alone in confirmations.

RESTAURANT: Tolo Kabab House | Houston TX | (832) 430-1032 | 100% Halal | Free parking
HOURS: Mon 11AM-9:30PM | Tue-Thu 11:30AM-9:30PM | Fri-Sat 11:30AM-10PM | Sun 11AM-10PM
MENU: Lamb Kabab $14, Chicken Kabab $13, Chapli Kabab $13, Mix Platter $18, Quabili Palau $15 (SIGNATURE MUST TRY), Chicken Palau $14, Mantu $13, Bolani $8 vegetarian, Shorwa $9, Korma $14, Fresh Naan $2, Firnee $5, Baklava $4

RESERVATION - collect all 5 naturally: guests, date (full), time, full name, contact number.
After all 5 confirm: "Perfect! Name: [name], Date: [full date], Time: [time], Guests: [number], Contact: [phone]. Is everything correct? We look forward to seeing you!"

LANGUAGE: Auto-detect and respond in same language. Support English, Dari, Pashto, Urdu, Hindi, Spanish, Arabic.
PERSONALITY: Warm, natural, no markdown, no asterisks, plain text only.`;

  try {
    const { messages } = req.body;
    const body = JSON.stringify({model:'gpt-4o-mini',max_tokens:500,messages:[{role:'system',content:SYSTEM_PROMPT},...messages]});
    const reply = await new Promise((resolve) => {
      const r = https.request({hostname:'api.openai.com',path:'/v1/chat/completions',method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Length':Buffer.byteLength(body)}
      },(response)=>{
        let data='';
        response.on('data',c=>data+=c);
        response.on('end',()=>{try{resolve(JSON.parse(data).choices?.[0]?.message?.content||"Could you repeat that? 😊");}catch(e){resolve("Call us at (832) 430-1032 📞");}});
      });
      r.on('error',()=>resolve("Call us at (832) 430-1032 📞"));
      r.write(body);r.end();
    });
    return res.status(200).json({reply});
  } catch(e){return res.status(200).json({reply:"Call us at (832) 430-1032 📞"});}
}
