// supabase/functions/_shared/env.ts

type RequiredEnv =
  | "RESEND_API_KEY"
  | "RECAPTCHA_SECRET_KEY"
  | "FROM_EMAIL"
  | "FROM_NAME";

function getEnv(name: RequiredEnv): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  // Built-in Supabase vars
  SUPABASE_URL: Deno.env.get("SUPABASE_URL")!,
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,

  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  RECAPTCHA_SECRET_KEY: getEnv("RECAPTCHA_SECRET_KEY"),
  FROM_EMAIL: getEnv("FROM_EMAIL"),
  FROM_NAME: getEnv("FROM_NAME"),
} as const;

export type Env = typeof env;