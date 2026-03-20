import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  WOOVI_API_KEY: z.string().optional(),
  WOOVI_WEBHOOK_SECRET: z.string().optional(),
  GGPIX_API_KEY: z.string().optional(),
  GGPIX_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** Referência: também lido pelo `prisma db seed` (e-mail do admin no banco). */
  ADMIN_EMAIL: z.string().email().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  WOOVI_API_KEY: process.env.WOOVI_API_KEY,
  WOOVI_WEBHOOK_SECRET: process.env.WOOVI_WEBHOOK_SECRET,
  GGPIX_API_KEY: process.env.GGPIX_API_KEY,
  GGPIX_WEBHOOK_SECRET: process.env.GGPIX_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  APP_URL: process.env.APP_URL,
});
