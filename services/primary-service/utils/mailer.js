// server/utils/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // load env vars early

/* ------------------------------------------------------------
   Transporter  (Gmail, STARTTLS on port 587)
   ------------------------------------------------------------ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS, not SMTPS
  auth: {
    user: process.env.EMAIL_USERNAME,  // e.g. Antiquitas.website@gmail.com
    pass: process.env.EMAIL_PASSWORD,  // 16‑char Google App‑Password
  },
  tls: {
    // Accept corporate / antivirus MITM certs (fixes “self‑signed” error)
    rejectUnauthorized: false,
  },
});

/* Verify once at startup so mis‑config is obvious */
transporter.verify((err) => {
  if (err) console.error("❌ SMTP error:", err);
  else     console.log("📨 Mail server ready");
});

/* ------------------------------------------------------------
   Core helper
   ------------------------------------------------------------ */
const sendEmail = async ({ email, subject, message, html }) => {
  const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USERNAME;

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${fromAddress}>`,
    to: email,
    subject,
    text: message,
  };
  if (html) mailOptions.html = html;

  return transporter.sendMail(mailOptions); // returns Nodemailer info object
};

/* ------------------------------------------------------------
   Pre‑canned templates
   ------------------------------------------------------------ */
const sendWelcomeEmail = (user, verificationUrl) =>
  sendEmail({
    email: user.email,
    subject: "Welcome to Antiquitas – Verify Your Email",
    message: `
Dear ${user.name},

Welcome to Antiquitas, the premier marketplace for antiques!

Please verify your email by visiting:
${verificationUrl}

This link expires in 24 hours.

Best regards,
The Antiquitas Team
`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#715a40;">Welcome to Antiquitas!</h2>
  <p>Dear ${user.name},</p>
  <p>Please verify your email by clicking the button below:</p>
  <p style="text-align:center;margin:30px 0">
    <a href="${verificationUrl}"
       style="background:#715a40;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;">
       Verify Email
    </a>
  </p>
  <p>This link expires in 24&nbsp;hours.</p>
  <p>Best regards,<br>The Antiquitas Team</p>
</div>
`,
  });

const sendOrderConfirmationEmail = (order, user) => {
  /* Build rows for HTML + plain text */
  let itemsHtml = "";
  let itemsText = "";
  order.orderItems.forEach((it) => {
    itemsHtml += `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <img src="${it.image}" alt="${it.name}"
               style="width:50px;height:50px;object-fit:cover;">
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">$${it.price.toFixed(
          2
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">$${(
          it.price * it.quantity
        ).toFixed(2)}</td>
      </tr>`;
    itemsText += `- ${it.name} (Qty:${it.quantity}) $${(
      it.price * it.quantity
    ).toFixed(2)}\n`;
  });

  return sendEmail({
    email: user.email,
    subject: `Antiquitas – Order Confirmation #${order._id}`,
    message: `
Dear ${user.name},

Thank you for your order!

Order No: ${order._id}
Date    : ${new Date(order.createdAt).toLocaleDateString()}

Items:
${itemsText}

Total: $${order.totalPrice.toFixed(2)}

We'll email you when your order ships.

Best regards,
Antiquitas Team
`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#715a40;">Order Confirmation</h2>
  <p>Dear ${user.name},</p>
  <p>Thank you for your order!</p>
  <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
  <p style="margin-top:12px;"><strong>Total: $${order.totalPrice.toFixed(
    2
  )}</strong></p>
  <p>We'll email you when your order ships.</p>
  <p>Best regards,<br>The Antiquitas Team</p>
</div>
`,
  });
};

/* ---------- Password‑reset OTP email ---------- */
const sendPasswordResetEmail = (user, otp) =>
  sendEmail({
    email: user.email,
    subject: "Antiquitas – Password Reset OTP",
    message: `
Dear ${user.name},

Your password reset OTP is: ${otp}

This code expires in 10 minutes. If you did not request a reset, simply ignore this email.

Best regards,
Antiquitas Team
`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#715a40;">Password Reset OTP</h2>
  <p>Dear ${user.name},</p>
  <p>Your OTP is:</p>
  <p style="text-align:center;margin:30px 0">
    <span style="display:inline-block;font-size:28px;letter-spacing:4px;background:#f4f4f4;padding:12px 24px;border-radius:6px;">
      ${otp}
    </span>
  </p>
  <p>This code expires in 10&nbsp;minutes.</p>
  <p>If you didn't request this, you can safely ignore this email.</p>
  <p>Best regards,<br>The Antiquitas Team</p>
</div>
`,
  });

/* ------------------------------------------------------------
   Exports
   ------------------------------------------------------------ */
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
};
