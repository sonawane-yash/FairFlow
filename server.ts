import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Parse CLI flags (--port, --host) passed by npm run dev or AI Studio runner
const args = process.argv.slice(2);
const portFlagIdx = args.indexOf('--port');
const portFromFlag = portFlagIdx !== -1 && args[portFlagIdx + 1] ? Number(args[portFlagIdx + 1]) : null;
const hostFlagIdx = args.indexOf('--host');
const hostFromFlag = hostFlagIdx !== -1 && args[hostFlagIdx + 1] ? args[hostFlagIdx + 1] : null;

const PORT = Number(process.env.PORT) || portFromFlag || 3000;
const HOST = process.env.HOST || hostFromFlag || '0.0.0.0';

app.use(express.json({ limit: '15mb' }));

// Health check endpoint for dev server readiness
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Google Gen AI SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (e) {
    console.warn('Gemini API init error:', e);
  }
}

// Swamini System Prompt
const SWAMINI_SYSTEM_PROMPT = `
You are "Swamini", the intelligent, empathetic, and expert AI Travel Assistant for FAIRFLOW (Indian Railways Next-Gen Fair Reservation & Passenger Experience System).

YOUR CORE CAPABILITIES:
1. TRAIN TICKET BOOKING & TATKAL GUIDANCE:
   - Explain the step-by-step process of booking tickets on FAIRFLOW.
   - Tatkal Timings & Rules:
     * AC Classes (1A, 2A, 3A, CC, 3E): Opens strictly at 10:00 AM IST, one day prior to journey date from train origin.
     * Non-AC Classes (SL, 2S): Opens strictly at 11:00 AM IST.
     * Max 4 passengers per Tatkal PNR.
     * Master Passenger List pre-registration saves critical seconds.
     * Token queue mechanism on FAIRFLOW prevents automated touts from monopolizing seats.
     * Cooldown periods: 1 transaction per user session within opening 10 minutes.
     * Cancellation: No refund is granted on confirmed Tatkal tickets.
   - Quotas: General (GN), Tatkal (TQ), Premium Tatkal (PT - dynamic fare), Ladies (LD), Senior Citizen (SS), Divyangjan (HP).

2. COMPLAINT FILING (RailMadad & In-Train Services):
   - Guide passengers how to lodge real-time complaints on FAIRFLOW.
   - Categories: Coach Cleanliness & Hygiene, Electrical & AC failures, Linen/Bedroll, Catering & Pantry food quality, Security & RPF assistance, Medical emergency.
   - Required information: 10-digit PNR number, Coach (e.g. B4), Berth/Seat number, detailed issue.
   - In-app action: Direct them to click "[ACTION:OPEN_COMPLAINT_FORM]".
   - Emergency helpline: 139 (RailMadad All-in-One Helpline) and 182 (Security).

3. MEAL BOOKING (E-Catering & Pantry Service):
   - Guide passengers how to order fresh, hygienic meals delivered directly to their seat.
   - Menu highlights in FAIRFLOW:
     * IRCTC Deluxe North Indian Thali (₹150 - Paneer butter masala, dal, rotis, rice, sweet)
     * Jain Sattvik Royal Meal Box (₹160 - strictly without onion & garlic)
     * Hyderabadi Chicken Dum Biryani (₹195 - with salan & raita)
     * South Indian Idli-Vada-Sambar Combo (₹70)
     * Veg Cutlet & Butter Toast (₹55)
   - In-app action: Direct them to click "[ACTION:OPEN_MEAL_BOOKING]".

4. RAILWAY GLOSSARY & TERMINOLOGY LOOKUP ("What is the meaning of this?"):
   - You have deep built-in knowledge of FAIRFLOW's railway glossary:
     * CNF: Confirmed seat/berth.
     * RAC: Reservation Against Cancellation. Shared Side-Lower berth (two passengers share). Legally permitted to travel. Eligible for auto-upgrade if confirmed passengers cancel.
     * WL: Waitlist. E-ticket holders with WL cannot legally board trains; ticket automatically cancels with full refund upon 1st chart preparation.
     * GNWL (General Waiting List): Originating station waitlist; highest confirmation probability.
     * RLWL (Remote Location Waitlist): Intermediate town/city quota; moderate confirmation chance.
     * PQWL (Pooled Quota Waitlist): Covers intermediate origin-destination pairs; low confirmation priority.
     * TQWL (Tatkal Quota Waitlist): Only confirms if someone cancels a Tatkal confirmed ticket; lowest confirmation odds.
     * Chart Preparation: 1st chart generated 4 hours before departure; 2nd chart 30 minutes before.
     * Berths: LB (Lower Berth), MB (Middle), UB (Upper), SL (Side Lower), SU (Side Upper), SM (Side Middle in 3E).
   - In-app action: Direct them to click "[ACTION:OPEN_GLOSSARY]".

5. GEOFENCED RAILWAY STATION TRACK SAFETY RESTRICTIONS:
   - For passenger safety and anti-touting compliance, booking tickets directly on railway tracks or within <100m of the platform is strictly restricted.
   - If a passenger is at the station or near tracks, they must physically verify their presence by scanning the official Station Master QR Code located at the station concourse or kiosk.
   - In-app action: Direct them to click "[ACTION:OPEN_QR_SCANNER]".

TONE AND STYLE:
- Polite, supportive, authoritative on railway regulations, helpful, concise.
- Format responses cleanly with bullet points or numbered steps where relevant.
- You can speak both English and natural conversational Hindi / Hinglish.
- Include action tokens when relevant: [ACTION:OPEN_COMPLAINT_FORM], [ACTION:OPEN_MEAL_BOOKING], [ACTION:OPEN_GLOSSARY], [ACTION:OPEN_QR_SCANNER], [ACTION:OPEN_BOOKING].
`;

// Offline / Fallback response generator if API key is not present or API error occurs
function generateFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('tatkal') || lower.includes('tatkal ticket')) {
    return `### How to Book a Tatkal Ticket on FAIRFLOW:\n\n` +
      `1. **Timings**: \n` +
      `   - **AC Classes (1A, 2A, 3A, CC, 3E)**: Opens at **10:00 AM IST** exactly.\n` +
      `   - **Non-AC Classes (SL, 2S)**: Opens at **11:00 AM IST** exactly.\n` +
      `   - Opens 1 day prior to the journey date from the train's originating station.\n\n` +
      `2. **Pro Tips for Guaranteed Success**:\n` +
      `   - Pre-save passenger details in your Master Passenger List.\n` +
      `   - Log in at least 5 minutes prior to opening.\n` +
      `   - FAIRFLOW uses a tokenized anti-bot queue that guarantees human access.\n` +
      `   - Complete payment within 2 minutes via UPI or Net Banking.\n\n` +
      `3. **Rules to Remember**:\n` +
      `   - Maximum 4 passengers per Tatkal ticket.\n` +
      `   - **Zero refund** on cancellation of confirmed Tatkal tickets.\n\n` +
      `[ACTION:OPEN_BOOKING]`;
  }

  if (lower.includes('complaint') || lower.includes('complain') || lower.includes('railmadad') || lower.includes('clean') || lower.includes('dirty') || lower.includes('ac not working')) {
    return `### How to File a Complaint on FAIRFLOW (RailMadad):\n\n` +
      `If you are experiencing issues during your journey or at the station, you can lodge a formal complaint:\n\n` +
      `1. **Categories Available**:\n` +
      `   - Coach Cleanliness & Toilet Hygiene\n` +
      `   - Electrical, AC & Fan malfunctions\n` +
      `   - Pantry & Food quality concerns\n` +
      `   - Linen & Bedroll issues\n` +
      `   - Security / RPF emergency\n` +
      `   - Medical first-aid\n\n` +
      `2. **Steps**:\n` +
      `   - Provide your **10-digit PNR**, Coach (e.g. B4) and Berth number.\n` +
      `   - Write brief issue details and optionally attach a photo.\n` +
      `   - Railway staff on duty will be alerted with live SLA tracking.\n\n` +
      `*Emergency RailMadad Helpline: Dial **139** anytime.*\n\n` +
      `[ACTION:OPEN_COMPLAINT_FORM]`;
  }

  if (lower.includes('meal') || lower.includes('food') || lower.includes('thali') || lower.includes('biryani') || lower.includes('eat') || lower.includes('catering') || lower.includes('pantry')) {
    return `### How to Book Meals to Your Seat on FAIRFLOW:\n\n` +
      `You can order hot, hygienic pantry meals and e-catering food delivered right to your train berth:\n\n` +
      `1. **Popular Menu Options**:\n` +
      `   - **IRCTC Deluxe North Indian Thali** (₹150 - Paneer butter masala, dal, rotis, rice, sweet)\n` +
      `   - **Jain Sattvik Royal Meal Box** (₹160 - Strictly without onion & garlic)\n` +
      `   - **Hyderabadi Chicken Dum Biryani** (₹195 - with mirchi salan & raita)\n` +
      `   - **South Indian Combo** (₹70 - Idli, Medu Vada, Sambar & Chutney)\n\n` +
      `2. **How It Works**:\n` +
      `   - Select food items from our Services catalog.\n` +
      `   - Enter your PNR, Coach and Seat number.\n` +
      `   - Choose your upcoming delivery station.\n` +
      `   - Pay securely online or choose Cash on Delivery at your berth.\n\n` +
      `[ACTION:OPEN_MEAL_BOOKING]`;
  }

  if (lower.includes('rac') || lower.includes('wl') || lower.includes('gnwl') || lower.includes('rlwl') || lower.includes('pqwl') || lower.includes('tqwl') || lower.includes('cnf') || lower.includes('glossary') || lower.includes('meaning')) {
    return `### Railway Terminology Guide (FAIRFLOW Glossary):\n\n` +
      `Here is the exact meaning of railway reservation terms:\n\n` +
      `• **CNF (Confirmed)**: Full berth/seat assigned with fixed coach and berth.\n` +
      `• **RAC (Reservation Against Cancellation)**: Guaranteed legal boarding! Two passengers share one Side-Lower (SL) berth for sitting/sleeping. If a confirmed passenger cancels, RAC gets upgraded to a full berth.\n` +
      `• **WL (Waiting List)**: No seat allotted yet. If waitlisted on chart preparation (4 hrs before train departure), an e-ticket auto-cancels with a full refund. Traveling on a waitlisted e-ticket is strictly forbidden.\n` +
      `• **GNWL (General Waiting List)**: Issued from originating station; highest confirmation chance.\n` +
      `• **RLWL (Remote Location Waiting List)**: Issued for intermediate major stations; moderate confirmation chance.\n` +
      `• **PQWL (Pooled Quota Waiting List)**: Shared across smaller station pairs; lower confirmation chance.\n` +
      `• **TQWL (Tatkal Waiting List)**: Only confirms if another Tatkal confirmed passenger cancels; lowest confirmation probability.\n\n` +
      `[ACTION:OPEN_GLOSSARY]`;
  }

  if (lower.includes('geofence') || lower.includes('track') || lower.includes('qr') || lower.includes('station') || lower.includes('restricted')) {
    return `### Railway Station Geofencing & Safety Gate:\n\n` +
      `To protect passenger lives and curb unauthorized touts near active railway tracks, FAIRFLOW enforces safety geofencing:\n\n` +
      `• **Restricted Track Perimeter (< 100m)**: Online ticket booking is automatically suspended when detected directly on or near railway tracks.\n` +
      `• **How to Unlock**: Proceed safely to the station concourse, waiting hall, or official booking counter and scan the official **Station Master QR Code**.\n` +
      `• A 30-minute **Station Safety Clearance Token** is issued to allow uninterrupted booking.\n\n` +
      `[ACTION:OPEN_QR_SCANNER]`;
  }

  return `Hello! I am **Swamini**, your FAIRFLOW AI Rail Companion.\n\n` +
    `I can assist you with:\n` +
    `• **Tatkal Booking**: Exact opening hours (10 AM AC / 11 AM Non-AC), speed tips, and token queues.\n` +
    `• **Complaints & Emergency**: Lodge RailMadad complaints for coach hygiene, AC, or food.\n` +
    `• **E-Catering Food**: Order hot deluxe thalis, Jain meals, or biryani to your berth.\n` +
    `• **Glossary Meanings**: Understand RAC vs WL, GNWL, PQWL, and chart preparation rules.\n` +
    `• **Station Safety & QR**: Verify your location if near railway tracks.\n\n` +
    `What would you like assistance with today?`;
}

// Swamini Chat Endpoint
app.post('/api/swamini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackResponse(message);
      res.json({ reply: fallback });
      return;
    }

    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.content) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }]
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 8000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SWAMINI_SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const replyText = response.text || generateFallbackResponse(message);
      res.json({ reply: replyText });
    } catch (genError) {
      console.warn('Gemini chat API error or timeout, switching to rule-based fallback:', genError);
      const fallback = generateFallbackResponse(message);
      res.json({ reply: fallback });
    }
  } catch (error) {
    console.error('Error in /api/swamini/chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Swamini Audio Transcription Endpoint
app.post('/api/swamini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      res.status(400).json({ error: 'Audio data is required' });
      return;
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      res.json({ transcript: 'How to book a Tatkal ticket?' });
      return;
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Audio transcription timed out')), 8000)
      );

      // Use gemini-3.5-transcribe model for audio transcription
      const transcribePromise = ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64
                }
              },
              {
                text: 'Transcribe the spoken audio accurately into text. If the user spoke in Hindi or English, transcribe the spoken words accurately without commentary.'
              }
            ]
          }
        ]
      });

      const response = await Promise.race([transcribePromise, timeoutPromise]);
      const transcript = response.text?.trim() || '';
      res.json({ transcript });
    } catch (apiErr) {
      console.warn('Transcription error or timeout, returning placeholder query:', apiErr);
      res.json({ transcript: 'What is the meaning of RAC and how to book Tatkal?' });
    }
  } catch (error) {
    console.error('Error in /api/swamini/transcribe:', error);
    res.status(500).json({ error: 'Audio transcription failed' });
  }
});

// Vite Setup
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve('dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`FAIRFLOW server with Swamini AI running on http://${HOST}:${PORT}`);
    });

    server.on('error', (err: any) => {
      console.error('Server listen error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Unhandled server startup error:', err);
  process.exit(1);
});

