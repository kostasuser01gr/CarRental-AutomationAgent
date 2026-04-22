import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../cre.db');
export const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

type InitDbOptions = {
  seedDemoData?: boolean;
  demoUserPassword?: string;
};

export function initDb(options: InitDbOptions = {}) {
  const { seedDemoData = false, demoUserPassword } = options;

  console.log('Synchronizing database via Drizzle Migrations...');
  
  // Run migrations
  migrate(db, { migrationsFolder: './drizzle' });

  console.log('Database initialized successfully.');
  if (seedDemoData) {
    if (!demoUserPassword || demoUserPassword.length < 12) {
      console.warn('SEED_DEMO_DATA=true but DEMO_USER_PASSWORD is missing or too short. Skipping demo seed.');
      return;
    }

    seedData(demoUserPassword);
  }
}

function seedData(demoUserPassword: string) {
  const vehicleCount = sqlite.prepare('SELECT count(*) as count FROM vehicles').get() as { count: number };
  if (vehicleCount.count === 0) {
    console.log('Seeding demo data...');
    
    const defaultPassword = bcrypt.hashSync(demoUserPassword, 10);

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

    insertBooking.run(1, 1, '2024-10-01', '2024-10-05', 'Confirmed', 'Direct', 400.0, 150.0);
    insertBooking.run(2, 2, '2024-10-10', '2024-10-15', 'Pending', 'Localrent', 600.0, 200.0);

    // Seed Maintenance
    const insertMaint = sqlite.prepare(`INSERT INTO maintenance_records (vehicle_id, type, date, mileage_at_service, next_service_due_mileage) VALUES (?, ?, ?, ?, ?)`);
    insertMaint.run(1, 'Oil Change', '2024-09-01', 44000, 49000);
    insertMaint.run(3, 'Brake Check', '2024-08-15', 8500, 15000);

    // Conflicting Bookings
    insertBooking.run(3, 4, '2024-10-20', '2024-10-25', 'Conflict', 'Direct', 800.0, 300.0);
    insertBooking.run(3, 2, '2024-10-21', '2024-10-24', 'Conflict', 'Karpadu', 950.0, 250.0);
  }
}
