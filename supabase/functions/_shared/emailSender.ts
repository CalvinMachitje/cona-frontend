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
  from,           // Optional: override sender
  to,
  subject,
  html,
  text,
}: {
  from?: string;  // e.g. "Bookings <bookings@conalounge.co.za>"
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const sender = from || `${env.FROM_NAME} <${env.FROM_EMAIL}>`;

    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ""),
    });

    console.log(`Email sent: ${info.messageId} | From: ${sender}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  }
}