import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull(), // Warlord, Agent, Partner
  status: text('status').default('Active'),
});

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  make: text('make').notNull(),
  model: text('model').notNull(),
  plate: text('plate').notNull().unique(),
  vin: text('vin'),
  class: text('class').notNull(), // Economy, SUV, Luxury, Warlord
  status: text('status').default('Active'), // Active, Maintenance, Ghost
  is_ghost: integer('is_ghost', { mode: 'boolean' }).default(false), // Shadow Inventory
  owner_contact: text('owner_contact'), // For Ghost fleet owner
  fuel_level: integer('fuel_level').default(100),
  mileage: integer('mileage').default(0),
  image_url: text('image_url'),
});

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  stripe_customer_id: text('stripe_customer_id'),
  driver_license_hash: text('driver_license_hash'),
  status: text('status').default('Active'), // Active, VIP, Blacklisted
  blacklist_reason: text('blacklist_reason'),
  total_spent: real('total_spent').default(0),
  social_credit_score: integer('social_credit_score').default(100),
  identity_verified: integer('identity_verified', { mode: 'boolean' }).default(false),
  verification_status: text('verification_status').default('Pending'), // Pending, Verified, Flagged
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicle_id: integer('vehicle_id').notNull().references(() => vehicles.id),
  customer_id: integer('customer_id').notNull().references(() => customers.id),
  stripe_payment_intent_id: text('stripe_payment_intent_id'),
  deposit_status: text('deposit_status').default('Pending'), // Pending, Held, Released, Captured
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  status: text('status').default('Pending'), // Pending, Confirmed, Conflict, Cancelled, Completed
  channel: text('channel').notNull(), // Localrent, Karpadu, Direct
  total_amount: real('total_amount').notNull(),
  profit_margin: real('profit_margin'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const communication_logs = sqliteTable('communication_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id').notNull().references(() => customers.id),
  booking_id: integer('booking_id').references(() => bookings.id),
  type: text('type').notNull(), // SMS, Email
  direction: text('direction').notNull(), // Outbound, Inbound
  content: text('content').notNull(),
  status: text('status').default('Sent'), // Sent, Delivered, Failed
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const pricing_rules = sqliteTable('pricing_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  condition_type: text('condition_type').notNull(), // Utilization, Competitor, Season
  condition_value: text('condition_value').notNull(), // e.g., ">80%", "Hertz_SoldOut"
  action_type: text('action_type').notNull(), // Increase, Decrease
  action_value: real('action_value').notNull(), // e.g., 1.2 (20% increase)
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
});

export const maintenance_records = sqliteTable('maintenance_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicle_id: integer('vehicle_id').notNull().references(() => vehicles.id),
  type: text('type').notNull(), // Oil Change, Tire Rotation, Brake Check, Engine
  date: text('date').notNull(),
  mileage_at_service: integer('mileage_at_service').notNull(),
  cost: real('cost'),
  notes: text('notes'),
  next_service_due_mileage: integer('next_service_due_mileage'),
});

export const audit_logs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entity_type: text('entity_type').notNull(), // Booking, Vehicle, Pricing
  entity_id: integer('entity_id'),
  details: text('details'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});