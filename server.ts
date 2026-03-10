import express from 'express';
import { createServer as createViteServer } from 'vite';
import { initDb, db, sqlite } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, or, and, lte, gte, desc, sql, sql as sqlQuery } from 'drizzle-orm';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-warlord-key';

// --- UTILS & MIDDLEWARE ---

async function logAction(userId: number | null, action: string, entityType: string, entityId: number, details: string) {
  await db.insert(schema.audit_logs).values({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details
  });
}

// JWT RBAC Middleware
const checkRole = (roles: string[]) => async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await db.select().from(schema.users).where(eq(schema.users.id, decoded.id)).limit(1);
    
    if (!user.length || !roles.includes(user[0].role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient Permissions' });
    }
    req.user = user[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDb();

  app.use(express.json());

  // --- API ROUTES (The Warlord API) ---

  // Auth API
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const userResult = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      const user = userResult[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // 0. Audit Logs API
  app.get('/api/audit-logs', checkRole(['Warlord', 'Agent']), async (req, res) => {
    const logs = await db
      .select({
        id: schema.audit_logs.id,
        user_id: schema.audit_logs.user_id,
        action: schema.audit_logs.action,
        entity_type: schema.audit_logs.entity_type,
        entity_id: schema.audit_logs.entity_id,
        details: schema.audit_logs.details,
        created_at: schema.audit_logs.created_at,
        user_name: schema.users.name
      })
      .from(schema.audit_logs)
      .leftJoin(schema.users, eq(schema.audit_logs.user_id, schema.users.id))
      .orderBy(desc(schema.audit_logs.created_at))
      .limit(50);
    res.json(logs);
  });

  // 1. Fleet API (Supports Ghost Filtering)
  app.get('/api/vehicles', async (req, res) => {
    const { include_ghost } = req.query;
    let query = db.select().from(schema.vehicles);
    if (include_ghost !== 'true') {
      query = query.where(eq(schema.vehicles.is_ghost, false)) as any;
    }
    const vehicles = await query;
    res.json(vehicles);
  });

  app.get('/api/vehicles/maintenance-predict', async (req, res) => {
    try {
      const vehicles = await db.select().from(schema.vehicles);
      const predictions = await Promise.all(vehicles.map(async (v) => {
        const lastServiceArr = await db.select().from(schema.maintenance_records)
          .where(eq(schema.maintenance_records.vehicle_id, v.id))
          .orderBy(desc(schema.maintenance_records.date))
          .limit(1);
        const lastService = lastServiceArr[0];
        
        const prompt = `
          Vehicle: ${v.make} ${v.model}
          Current Mileage: ${v.mileage}
          Last Service: ${lastService ? `${lastService.type} at ${lastService.mileage_at_service} km` : 'None'}
          
          Predict if this vehicle needs service soon. Respond ONLY with JSON: {"needsService": boolean, "reason": "short explanation", "urgency": "Low|Medium|High"}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.1 }
        });

        return { vehicle_id: v.id, ...JSON.parse(response.text) };
      }));
      res.json(predictions);
    } catch (e) {
      res.status(500).json({ error: 'Maintenance prediction failed' });
    }
  });

  // 2. Bookings API
  app.get('/api/bookings', async (req, res) => {
    const bookings = await db.select({
      id: schema.bookings.id,
      vehicle_id: schema.bookings.vehicle_id,
      customer_id: schema.bookings.customer_id,
      start_date: schema.bookings.start_date,
      end_date: schema.bookings.end_date,
      status: schema.bookings.status,
      channel: schema.bookings.channel,
      total_amount: schema.bookings.total_amount,
      profit_margin: schema.bookings.profit_margin,
      created_at: schema.bookings.created_at,
      make: schema.vehicles.make,
      model: schema.vehicles.model,
      plate: schema.vehicles.plate,
      customer_name: schema.customers.name,
      customer_email: schema.customers.email
    }).from(schema.bookings)
      .innerJoin(schema.vehicles, eq(schema.bookings.vehicle_id, schema.vehicles.id))
      .innerJoin(schema.customers, eq(schema.bookings.customer_id, schema.customers.id))
      .orderBy(desc(schema.bookings.start_date));
    res.json(bookings);
  });

  // Advanced Reports API
  app.get('/api/reports/financials', async (req, res) => {
    // using raw sqlite for complex aggregations for ease initially
    const stats = sqlite.prepare(`
      SELECT 
        IFNULL(SUM(total_amount), 0) as total_revenue,
        IFNULL(SUM(profit_margin), 0) as total_profit,
        COUNT(*) as total_bookings,
        IFNULL(AVG(total_amount), 0) as avg_booking_value
      FROM bookings 
      WHERE status IN ('Confirmed', 'Completed')
    `).get() as any;

    const channelStats = sqlite.prepare(`
      SELECT channel, IFNULL(SUM(total_amount), 0) as revenue, COUNT(*) as count
      FROM bookings
      WHERE status IN ('Confirmed', 'Completed', 'Pending')
      GROUP BY channel
    `).all();

    const vehicleProfits = sqlite.prepare(`
      SELECT v.make, v.model, v.plate, IFNULL(SUM(b.profit_margin), 0) as profit, v.class
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.status IN ('Confirmed', 'Completed')
      GROUP BY v.id
      ORDER BY profit DESC
    `).all();

    res.json({ stats, channelStats, vehicleProfits });
  });

  // 3. Customers API (Supports Blacklist Check)
  app.get('/api/customers', async (req, res) => {
    const customers = await db.select().from(schema.customers);
    res.json(customers);
  });

  app.post('/api/customers/check-blacklist', async (req, res) => {
    const { email, phone } = req.body;
    const result = await db.select().from(schema.customers)
      .where(or(eq(schema.customers.email, email), eq(schema.customers.phone, phone)))
      .limit(1);
    const customer = result[0];
    
    if (customer && customer.status === 'Blacklisted') {
      return res.status(403).json({ 
        blocked: true, 
        reason: customer.blacklist_reason 
      });
    }
    res.json({ blocked: false });
  });

  app.post('/api/customers/analyze-risk', async (req, res) => {
    try {
      const { text } = req.body;
      const prompt = `
        Analyze the following communication from a potential car rental customer. 
        Determine if they pose a high risk to the vehicles (e.g. reckless driving, illegal activities, past damages, rudeness).
        Respond ONLY with a JSON object: {"isHighRisk": boolean, "reason": "brief explanation"}
        
        Customer message/notes:
        "${text}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      
      const responseData = JSON.parse(response.text);
      res.json(responseData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Risk analysis failed' });
    }
  });

  // 4. Pricing Rules API
  app.get('/api/pricing-rules', async (req, res) => {
    const rules = await db.select().from(schema.pricing_rules);
    res.json(rules);
  });

  app.get('/api/market-intelligence/scan', async (req, res) => {
    try {
      // Simulate fetching current market context
      const prompt = `
        You are a market intelligence scraper for a car rental business.
        Simulate a real-time scan of local competitors (Hertz, Avis, Enterprise) for current availability and pricing in a major city today.
        Return ONLY a JSON array of 3 objects representing competitor status. Format:
        [
          { "competitor": "Hertz", "class": "SUV", "status": "SOLD OUT", "price": null, "trend": "up" },
          { "competitor": "Avis", "class": "Economy", "status": "AVAILABLE", "price": 45, "trend": "down" },
          ...
        ]
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.7 }
      });
      res.json(JSON.parse(response.text));
    } catch (e) {
      res.status(500).json({ error: 'Market scan failed' });
    }
  });

  app.post('/api/pricing-rules', checkRole(['Warlord']), async (req, res) => {
    const { name, condition_type, condition_value, action_type, action_value } = req.body;
    const result = await db.insert(schema.pricing_rules).values({
      name, condition_type, condition_value, action_type, action_value
    });
    // Drizzle doesn't return lastInsertRowid natively in all adapters easily without returning, 
    // but better-sqlite3 wrapper does support .run() returning lastInsertRowid if configured. Let's do raw for log or ignore id
    await logAction((req as any).user.id, 'CREATE_PRICING_RULE', 'Pricing', 0, `Created rule: ${name}`);
    
    res.json({ success: true });
  });

  app.post('/api/pricing-rules/simulate', async (req, res) => {
    try {
      const { price_change_percentage, vehicle_class } = req.body;
      const prompt = `
        You are a revenue management AI for a car rental company. 
        The user is proposing a ${price_change_percentage}% price change for the ${vehicle_class} class.
        Predict the impact on occupancy and total revenue over the next 30 days.
        Respond ONLY with a JSON object: {
          "occupancy_change": "percentage string (e.g. '-5%' or '+2%')",
          "revenue_change": "percentage string (e.g. '+8%' or '-3%')",
          "recommendation": "brief strategic advice"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });
      
      const responseData = JSON.parse(response.text);
      res.json(responseData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Simulation failed' });
    }
  });

  // 5. Conflict Resolution API (The Profit Maximizer)
  
  app.get('/api/conflicts', (req, res) => {
    // Keep this raw for now because of the complex self-join and date overlap
    const conflictsQuery = sqlite.prepare(`
      SELECT 
        v.id as vehicle_id, v.make, v.model, v.plate,
        b1.id as b1_id, b1.start_date as b1_start, b1.end_date as b1_end, b1.total_amount as b1_amount, b1.channel as b1_channel, c1.name as b1_customer,
        b2.id as b2_id, b2.start_date as b2_start, b2.end_date as b2_end, b2.total_amount as b2_amount, b2.channel as b2_channel, c2.name as b2_customer
      FROM bookings b1
      JOIN bookings b2 ON b1.vehicle_id = b2.vehicle_id AND b1.id < b2.id
      JOIN vehicles v ON b1.vehicle_id = v.id
      JOIN customers c1 ON b1.customer_id = c1.id
      JOIN customers c2 ON b2.customer_id = c2.id
      WHERE b1.status IN ('Pending', 'Confirmed', 'Conflict') 
        AND b2.status IN ('Pending', 'Confirmed', 'Conflict')
        AND (b1.start_date <= b2.end_date AND b1.end_date >= b2.start_date)
    `).all();
    res.json(conflictsQuery);
  });

  app.post('/api/conflicts/resolve', checkRole(['Warlord', 'Agent']), async (req, res) => {
    const { keep_booking_id, cancel_booking_id } = req.body;
    
    const transaction = sqlite.transaction(() => {
      sqlite.prepare("UPDATE bookings SET status = 'Confirmed' WHERE id = ?").run(keep_booking_id);
      sqlite.prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?").run(cancel_booking_id);
    });
    transaction();

    await logAction(
      (req as any).user.id, 
      'RESOLVE_CONFLICT', 
      'Booking', 
      keep_booking_id, 
      `Kept ${keep_booking_id}, Cancelled ${cancel_booking_id}`
    );

    res.json({ success: true, message: 'Conflict resolved. Audit log generated.' });
  });

  app.post('/api/conflicts/ai-resolve', async (req, res) => {
    try {
      const { bookingA, bookingB } = req.body;
      const prompt = `
        You are an AI manager for a car rental company focused on profit maximization and customer loyalty.
        You have two conflicting bookings for the same vehicle. You must choose one to KEEP and one to CANCEL.
        Respond ONLY with a JSON object in this format: {"keep": "bookingA" | "bookingB", "reason": "brief explanation"}
        
        Booking A:
        Customer: ${bookingA.customer}
        Channel: ${bookingA.channel}
        Amount: $${bookingA.amount}
        
        Booking B:
        Customer: ${bookingB.customer}
        Channel: ${bookingB.channel}
        Amount: $${bookingB.amount}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      
      const text = response.text;
      res.json(JSON.parse(text));
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'AI Resolution failed', details: e.message });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
