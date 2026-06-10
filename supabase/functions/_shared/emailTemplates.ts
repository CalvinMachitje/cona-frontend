// supabase/functions/_shared/emailTemplates.ts

const LOGO_URL = "https://gyqwyifuiomlzzmrikch.supabase.co/storage/v1/object/public/public-assets/logo.webp";

export const bookingConfirmationHtml = (booking: any, table: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - CONA Lounge</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #1f2937; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #22d3ee, #3b82f6); padding: 30px 20px; text-align: center; }
    .logo { max-width: 120px; height: auto; margin-bottom: 10px; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding-bottom: 8px; border-bottom: 1px solid #374151; }
    .highlight { color: #22d3ee; font-weight: 600; }
    .footer { text-align: center; padding: 25px; font-size: 13px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Cona Lounge" class="logo" />
      <h1 style="margin: 10px 0 0 0; color: #000; font-size: 28px; letter-spacing: 2px;">CONA LOUNGE</h1>
      <p style="margin: 5px 0 0 0; color: #000; font-weight: 500;">Coligny • Premium Nightlife</p>
    </div>
    <div class="content">
      <h2 style="color: #22d3ee;">Your Booking is Confirmed!</h2>
      
      <p>Dear <strong>${booking.guest_name}</strong>,</p>
      <p>Thank you for choosing CONA Lounge. We are excited to host you.</p>
      
      <div class="detail-row"><strong>Date:</strong> <span>${new Date(booking.booking_date).toLocaleDateString('en-ZA')}</span></div>
      <div class="detail-row"><strong>Time:</strong> <span>${booking.start_time} – ${booking.end_time}</span></div>
      <div class="detail-row"><strong>Table:</strong> <span>${table?.table_number || 'VIP'} (${table?.type || 'Standard'})</span></div>
      <div class="detail-row"><strong>Guests:</strong> <span>${booking.guests}</span></div>
      <div class="detail-row"><strong>Reference Code:</strong> <span class="highlight">${booking.reference_code}</span></div>
      
      <p style="margin-top: 30px;">Please present your reference code upon arrival.</p>
      <p>We look forward to giving you an unforgettable experience.</p>
    </div>
    <div class="footer">
      CONA Lounge • Coligny, North West • 083 200 2516<br>
      © ${new Date().getFullYear()} All Rights Reserved
    </div>
  </div>
</body>
</html>`;

export const contactCustomerReplyHtml = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - CONA Lounge</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #1f2937; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #22d3ee, #3b82f6); padding: 30px 20px; text-align: center; }
    .logo { max-width: 110px; height: auto; margin-bottom: 10px; }
    .content { padding: 40px 30px; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Cona Lounge" class="logo" />
      <h1 style="margin: 10px 0 0 0; color: #000;">CONA LOUNGE</h1>
    </div>
    <div class="content">
      <h2>Thank You, ${name}!</h2>
      <p>We have received your message and appreciate you reaching out.</p>
      <p>Our team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
      <p>We look forward to welcoming you at CONA Lounge soon.</p>
      
      <p style="margin-top: 30px; font-size: 0.95em;">
        Best regards,<br>
        <strong>CONA Lounge Team</strong><br>
        Coligny • 083 200 2516
      </p>
    </div>
  </div>
</body>
</html>`;