import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for Master level security"),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SEED_DEMO_DATA: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  DEMO_USER_PASSWORD: z.string().min(12, 'DEMO_USER_PASSWORD must be at least 12 characters').optional(),
}).superRefine((data, ctx) => {
  if (data.SEED_DEMO_DATA && data.NODE_ENV !== 'test' && !data.DEMO_USER_PASSWORD) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'DEMO_USER_PASSWORD is required when SEED_DEMO_DATA=true',
      path: ['DEMO_USER_PASSWORD'],
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
