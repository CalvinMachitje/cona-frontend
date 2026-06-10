// supabase/functions/_shared/emailSender.ts
import nodemailer from "npm:nodemailer";
import { env } from "./env.ts";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  secure: false,        // STARTTLS
  tls: { rejectUnauthorized: false },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ""),
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  }
}