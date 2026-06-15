// supabase/functions/_shared/env.ts
type RequiredEnv =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "APP_ENV"
  | "FROM_EMAIL"
  | "FROM_NAME"
  | "MAILTRAP_TOKEN"
  | "RECAPTCHA_SECRET_KEY";

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  return Deno.env.get(name) ?? undefined;
}

export const env = {
  // Supabase
  SUPABASE_URL: getEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: getEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // Application
  APP_ENV: getEnv("APP_ENV"),

  // Default Sender (used as fallback)
  FROM_EMAIL: getEnv("FROM_EMAIL"),
  FROM_NAME: getEnv("FROM_NAME"),

  // Mailtrap SMTP
  SMTP_HOST: "live.smtp.mailtrap.io",
  SMTP_PORT: 587,
  SMTP_USER: "api",
  SMTP_PASS: getEnv("MAILTRAP_TOKEN"),

  // Security
  RECAPTCHA_SECRET_KEY: getEnv("RECAPTCHA_SECRET_KEY"),

  // Optional
  APP_URL: getOptionalEnv("APP_URL"),

  // Professional Senders (Cona Lounge specific)
  BOOKINGS_EMAIL: getOptionalEnv("BOOKINGS_EMAIL") || "bookings@conalounge.co.za",
  INFO_EMAIL: getOptionalEnv("INFO_EMAIL") || "info@conalounge.co.za",
} as const;

export type Env = typeof env;