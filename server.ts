import { PDFDocument, rgb } from "pdf-lib";
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { initDb, db, sqlite } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, or, and, desc, sql } from 'drizzle-orm';
import { env } from './src/lib/env.ts';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import twilio from 'twilio';
import { z } from 'zod';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const JWT_SECRET = env.JWT_SECRET;

// Init External APIs
const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' as any });
const twilioClient = env.TWILIO_ACCOUNT_SID ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN) : null;

// --- SCHEMAS (Master-Level Validation) ---

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const IdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const DepositSchema = z.object({
  bookingId: z.number().int().positive(),
  amount: z.number().positive()
});

const PricingRuleSchema = z.object({
  name: z.string().min(3),
  condition_type: z.enum(['Utilization', 'Competitor', 'Season']),
  condition_value: z.string(),
  action_type: z.enum(['Increase', 'Decrease']),
  action_value: z.number()
});

const DamageAssessmentSchema = z.object({
  checkInPhotoUrl: z.string().url(),
  checkOutPhotoUrl: z.string().url()
});

const AIResolveSchema = z.object({
  bookingA: z.object({
    id: z.number(),
    customer: z.string(),
    channel: z.string(),
    amount: z.number()
  }),
  bookingB: z.object({
    id: z.number(),
    customer: z.string(),
    channel: z.string(),
    amount: z.number()
  })
});

// --- UTILS & MIDDLEWARE ---

async function logAction(userId: number | null, action: string, entityType: string, entityId: number, details: string) {
  try {
    await db.insert(schema.audit_logs).values({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (err) {
    console.error('CRITICAL: Audit log failed', err);
  }
}

async function sendSMS(customerId: number, phone: string, message: string, bookingId?: number) {
  try {
    if (twilioClient) {
      await twilioClient.messages.create({
        body: message,
        to: phone,
        from: env.TWILIO_PHONE_NUMBER || '+1234567890'
      });
    }
    
    await db.insert(schema.communication_logs).values({
      customer_id: customerId,
      booking_id: bookingId,
      type: 'SMS',
      direction: 'Outbound',
      content: message,
      status: 'Sent'
    });
  } catch (error) {
    console.error('SMS Failed', error);
  }
}

const safeParseAI = (text: string) => {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('AI JSON Parse Error', e, text);
    throw new Error('Invalid AI response format');
  }
};

const checkRole = (roles: string[]) => async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await db.select().from(schema.users).where(eq(schema.users.id, decoded.id)).limit(1);
    if (!user.length || !roles.includes(user[0].role)) return res.status(403).json({ error: 'Forbidden' });
    req.user = user[0];
    next();
  } catch (err) { return res.status(401).json({ error: 'Invalid Token' }); }
};

async function startServer() {
  const app = express();
  const PORT = env.PORT;

  initDb();

  app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for Vite dev mode compatibility
  app.use(cors());
  app.use(express.json());

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

  // --- API ---

  app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad format' });
    const user = (await db.select().from(schema.users).where(eq(schema.users.email, parsed.data.email)).limit(1))[0];
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });

  app.get('/api/audit-logs', checkRole(['Warlord', 'Agent']), async (req: any, res: Response) => {
    res.json(await db.select().from(schema.audit_logs).orderBy(desc(schema.audit_logs.created_at)).limit(50));
  });

  app.get('/api/vehicles', async (req: Request, res: Response) => {
    const query = db.select().from(schema.vehicles);
    if (req.query.only_ghost === 'true') {
      query.where(eq(schema.vehicles.is_ghost, true));
    } else if (req.query.include_ghost !== 'true') {
      query.where(eq(schema.vehicles.is_ghost, false));
    }
    res.json(await query);
  });

  app.post('/api/vehicles/:id/damage-assessment', checkRole(['Warlord', 'Agent']), async (req: any, res: Response) => {
    const idParsed = IdParamSchema.safeParse(req.params);
    const bodyParsed = DamageAssessmentSchema.safeParse(req.body);
    if (!idParsed.success || !bodyParsed.success) return res.status(400).json({ error: 'Bad request' });
    try {
      const prompt = `Assess damage. Respond ONLY JSON: {"newDamageFound": boolean, "damageDescription": string, "estimatedRepairCost": number}. Photos: ${bodyParsed.data.checkOutPhotoUrl}, ${bodyParsed.data.checkInPhotoUrl}`;
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const result = safeParseAI(resp.text);
      if (result.newDamageFound) await logAction(req.user.id, 'DAMAGE_LOGGED', 'Vehicle', idParsed.data.id, result.damageDescription);
      res.json(result);
    } catch (e) { res.status(500).json({ error: 'Fail' }); }
  });

  app.get('/api/vehicles/maintenance-predict', async (req: Request, res: Response) => {
    try {
      const vehicles = await db.select().from(schema.vehicles);
      const results = [];
      for (const v of vehicles) {
        const last = (await db.select().from(schema.maintenance_records).where(eq(schema.maintenance_records.vehicle_id, v.id)).orderBy(desc(schema.maintenance_records.date)).limit(1))[0];
        const prompt = `Predict service for ${v.make} ${v.model}. Respond JSON: {"needsService": boolean, "reason": string, "urgency": "Low|Medium|High"}`;
        const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        results.push({ vehicle_id: v.id, ...safeParseAI(resp.text) });
      }
      res.json(results);
    } catch (e) { res.status(500).json({ error: 'Fail' }); }
  });

  app.post('/api/finance/hold-deposit', checkRole(['Warlord', 'Agent']), async (req: any, res: Response) => {
    const parsed = DepositSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad format' });
    const pi = `pi_mock_${Date.now()}`;
    await db.update(schema.bookings).set({ deposit_status: 'Held', stripe_payment_intent_id: pi }).where(eq(schema.bookings.id, parsed.data.bookingId));
    res.json({ success: true, pi });
  });

  app.get('/api/bookings', async (req: Request, res: Response) => {
    const results = await db.select({
      id: schema.bookings.id, customer_name: schema.customers.name, make: schema.vehicles.make, model: schema.vehicles.model, plate: schema.vehicles.plate, start_date: schema.bookings.start_date, end_date: schema.bookings.end_date, status: schema.bookings.status, total_amount: schema.bookings.total_amount, deposit_status: schema.bookings.deposit_status
    }).from(schema.bookings).innerJoin(schema.vehicles, eq(schema.bookings.vehicle_id, schema.vehicles.id)).innerJoin(schema.customers, eq(schema.bookings.customer_id, schema.customers.id)).orderBy(desc(schema.bookings.start_date));
    res.json(results);
  });

  app.get('/api/bookings/:id/contract', checkRole(['Warlord', 'Agent']), async (req: any, res: Response) => {
    const parsed = IdParamSchema.safeParse(req.params);
    if (!parsed.success) return res.status(400).json({ error: 'Bad ID' });
    try {
      const b = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, parsed.data.id)).limit(1))[0];
      if (!b) return res.status(404).json({ error: 'Not found' });
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      page.drawText(`MiraCars Contract ID: ${b.id}`, { x: 50, y: 750, size: 20 });
      const bytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.send(Buffer.from(bytes));
    } catch (e) { res.status(500).json({ error: 'PDF Fail' }); }
  });

  app.get('/api/reports/financials', async (req: Request, res: Response) => {
    const stats = sqlite.prepare(`SELECT SUM(total_amount) as total_revenue, SUM(profit_margin) as total_profit, COUNT(*) as total_bookings, AVG(total_amount) as avg_booking_value FROM bookings WHERE status IN ('Confirmed', 'Completed')`).get();
    const channelStats = sqlite.prepare(`SELECT channel, SUM(total_amount) as revenue FROM bookings GROUP BY channel`).all();
    const vehicleProfits = sqlite.prepare(`SELECT v.make, v.model, v.plate, SUM(b.profit_margin) as profit, v.class FROM bookings b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.status IN ('Confirmed', 'Completed') GROUP BY v.id ORDER BY profit DESC`).all();
    res.json({ stats, channelStats, vehicleProfits });
  });

  app.get('/api/customers', async (req: Request, res: Response) => {
    res.json(await db.select().from(schema.customers));
  });

  app.post('/api/customers/analyze-risk', async (req: Request, res: Response) => {
    try {
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Risk assessment for: ${req.body.text}. Respond JSON: {"isHighRisk": boolean, "reason": string}` });
      res.json(safeParseAI(resp.text));
    } catch (e) { res.status(500).json({ error: 'Fail' }); }
  });

  app.get('/api/pricing-rules', async (req: Request, res: Response) => {
    res.json(await db.select().from(schema.pricing_rules));
  });

  app.post('/api/pricing-rules', checkRole(['Warlord']), async (req: any, res: Response) => {
    const parsed = PricingRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad format' });
    await db.insert(schema.pricing_rules).values(parsed.data);
    res.json({ success: true });
  });

  app.get('/api/conflicts', (req: Request, res: Response) => {
    const query = sqlite.prepare(`SELECT v.id, v.make, v.model, v.plate, b1.id as b1_id, b1.total_amount as b1_amount, b2.id as b2_id, b2.total_amount as b2_amount FROM bookings b1 JOIN bookings b2 ON b1.vehicle_id = b2.vehicle_id AND b1.id < b2.id JOIN vehicles v ON b1.vehicle_id = v.id WHERE b1.status != 'Cancelled' AND b2.status != 'Cancelled' AND (b1.start_date <= b2.end_date AND b1.end_date >= b2.start_date)`).all();
    res.json(query);
  });

  app.post('/api/conflicts/ai-resolve', checkRole(['Warlord', 'Agent']), async (req: any, res: Response) => {
    const parsed = AIResolveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad format' });
    try {
      const prompt = `Compare Booking A ($${parsed.data.bookingA.amount}) and B ($${parsed.data.bookingB.amount}). Choose one to KEEP. Respond ONLY JSON: {"keep": "bookingA"|"bookingB", "reason": string}`;
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      res.json(safeParseAI(resp.text));
    } catch (e) { res.status(500).json({ error: 'AI Resolve Fail' }); }
  });

  app.get('/api/market-intelligence/scan', async (req: Request, res: Response) => {
    try {
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Scrape local competitors. Respond ONLY JSON array of 3 objects: {"competitor": string, "status": string, "price": number, "trend": "up"|"down"}` });
      res.json(safeParseAI(resp.text));
    } catch (e) { res.status(500).json({ error: 'Scan Fail' }); }
  });

  if (env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`SYSTEM ACTIVE ON PORT ${PORT}`));
}

startServer();
