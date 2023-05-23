import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  DATABASE_CLIENT: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_HOST: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("⚠️ Invalid environment variables!", _env.error.format());

  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
