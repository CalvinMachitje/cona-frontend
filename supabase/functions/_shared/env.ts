// supabase/functions/_shared/env.ts

type RequiredEnv =
  | "RESEND_API_KEY"
  | "MAILTRAP_TOKEN"
  | "RECAPTCHA_SECRET_KEY"
  | "FROM_EMAIL"
  | "FROM_NAME"
  | "APP_ENV";

function getEnv(name: RequiredEnv): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  // Built-in Supabase variables
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? "",
  SUPABASE_SERVICE_ROLE_KEY:
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",

  // App config
  APP_ENV: getEnv("APP_ENV"),

  // Email providers
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  MAILTRAP_TOKEN: getEnv("MAILTRAP_TOKEN"),

  // Security
  RECAPTCHA_SECRET_KEY: getEnv("RECAPTCHA_SECRET_KEY"),

  // Email sender
  FROM_EMAIL: getEnv("FROM_EMAIL"),
  FROM_NAME: getEnv("FROM_NAME"),
} as const;

export type Env = typeof env;