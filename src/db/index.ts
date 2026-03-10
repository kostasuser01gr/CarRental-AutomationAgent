import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../cre.db');
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function initDb() {
  // Vehicles Table (Supports Ghost Fleet)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      plate TEXT UNIQUE NOT NULL,
      vin TEXT,
      class TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      is_ghost BOOLEAN DEFAULT 0,
      owner_contact TEXT,
      fuel_level INTEGER DEFAULT 100,
      mileage INTEGER DEFAULT 0,
      image_url TEXT
    );
  `);

  // Customers Table (Supports Blacklist)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      stripe_customer_id TEXT,
      driver_license_hash TEXT,
      status TEXT DEFAULT 'Active',
      blacklist_reason TEXT,
      total_spent REAL DEFAULT 0,
      social_credit_score INTEGER DEFAULT 100,
      identity_verified BOOLEAN DEFAULT 0,
      verification_status TEXT DEFAULT 'Pending'
    );
  `);

  // Bookings Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      stripe_payment_intent_id TEXT,
      deposit_status TEXT DEFAULT 'Pending',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      channel TEXT NOT NULL,
      total_amount REAL NOT NULL,
      profit_margin REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Communication Logs
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS communication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      booking_id INTEGER,
      type TEXT NOT NULL,
      direction TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'Sent',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
  `);

  // Maintenance Records (Autonomous Fleet)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      mileage_at_service INTEGER NOT NULL,
      cost REAL,
      notes TEXT,
      next_service_due_mileage INTEGER,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );
  `);

  // Audit Logs (The Chain of Custody)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Users (RBAC)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active'
    );
  `);

  // Pricing Rules (The Predator Engine)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      condition_value TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_value REAL NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );
  `);

  console.log('Database initialized with Advanced Warlord Schema via Drizzle.');
  seedData();
}

function seedData() {
  const vehicleCount = sqlite.prepare('SELECT count(*) as count FROM vehicles').get() as { count: number };
  if (vehicleCount.count === 0) {
    console.log('Seeding data...');
    
    const defaultPassword = bcrypt.hashSync('password123', 10);

    // Seed Users
    const insertUser = sqlite.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`);
    insertUser.run('Principal Warlord', 'admin@miracars.com', defaultPassword, 'Warlord');
    insertUser.run('Agent Zero', 'agent@miracars.com', defaultPassword, 'Agent');
    insertUser.run('Shadow Partner', 'partner@miracars.com', defaultPassword, 'Partner');

    // Seed Vehicles
    const insertVehicle = sqlite.prepare(`
      INSERT INTO vehicles (make, model, plate, class, status, is_ghost, fuel_level, mileage, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertVehicle.run('Toyota', 'Camry', 'ABC-123', 'Economy', 'Active', 0, 75, 45231, 'https://picsum.photos/seed/camry/400/300');
    insertVehicle.run('Honda', 'CR-V', 'XYZ-789', 'SUV', 'Active', 0, 90, 12500, 'https://picsum.photos/seed/crv/400/300');
    insertVehicle.run('Ford', 'Mustang', 'MUS-001', 'Sports', 'Maintenance', 0, 40, 8900, 'https://picsum.photos/seed/mustang/400/300');
    insertVehicle.run('Tesla', 'Model 3', 'EV-999', 'Electric', 'Active', 0, 100, 5000, 'https://picsum.photos/seed/tesla/400/300');
    // Ghost Fleet
    insertVehicle.run('Mercedes', 'G-Wagon', 'GHOST-001', 'Luxury', 'Ghost', 1, 100, 1200, 'https://picsum.photos/seed/gwagon/400/300');
    insertVehicle.run('Porsche', '911', 'GHOST-002', 'Sports', 'Ghost', 1, 95, 3400, 'https://picsum.photos/seed/porsche/400/300');

    // Seed Customers
    const insertCustomer = sqlite.prepare(`
      INSERT INTO customers (name, email, phone, status, blacklist_reason, total_spent, social_credit_score, identity_verified, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCustomer.run('Olivia Martin', 'olivia@example.com', '+1555001', 'Active', null, 4250, 95, 1, 'Verified');
    insertCustomer.run('Jackson Lee', 'jackson@example.com', '+1555002', 'Active', null, 2800, 85, 1, 'Verified');
    insertCustomer.run('Banned Bob', 'bob@badguy.com', '+1555666', 'Blacklisted', 'Trashed vehicle #4 in 2023', 0, 10, 0, 'Flagged');
    insertCustomer.run('VIP Victoria', 'vic@vip.com', '+1555777', 'VIP', null, 15000, 99, 1, 'Verified');

    // Seed Pricing Rules
    const insertRule = sqlite.prepare(`
      INSERT INTO pricing_rules (name, condition_type, condition_value, action_type, action_value)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertRule.run('Weekend Surge', 'Season', 'Weekend', 'Increase', 1.15);
    insertRule.run('Low Utilization Fire Sale', 'Utilization', '<30%', 'Decrease', 0.85);
    insertRule.run('Competitor Stockout', 'Competitor', 'Hertz_Zero_SUV', 'Increase', 2.0);

    // Seed Bookings
    const insertBooking = sqlite.prepare(`
      INSERT INTO bookings (vehicle_id, customer_id, start_date, end_date, status, channel, total_amount, profit_margin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Normal booking
    insertBooking.run(1, 1, '2024-10-01', '2024-10-05', 'Confirmed', 'Direct', 400.0, 150.0);
    insertBooking.run(2, 2, '2024-10-10', '2024-10-15', 'Pending', 'Localrent', 600.0, 200.0);

    // Seed Maintenance
    const insertMaint = sqlite.prepare(`INSERT INTO maintenance_records (vehicle_id, type, date, mileage_at_service, next_service_due_mileage) VALUES (?, ?, ?, ?, ?)`);
    insertMaint.run(1, 'Oil Change', '2024-09-01', 44000, 49000);
    insertMaint.run(3, 'Brake Check', '2024-08-15', 8500, 15000);

    // Conflicting Bookings on Vehicle 3 (Ford Mustang)
    insertBooking.run(3, 4, '2024-10-20', '2024-10-25', 'Conflict', 'Direct', 800.0, 300.0);
    insertBooking.run(3, 2, '2024-10-21', '2024-10-24', 'Conflict', 'Karpadu', 950.0, 250.0);
  }
}

export { sqlite };