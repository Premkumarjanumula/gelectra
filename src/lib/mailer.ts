import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(to: string, link: string, role: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const html = `
    <div style="font-family: system-ui, Arial, sans-serif; max-width: 560px; line-height:1.6; color:#111;">
      <h2 style="color:#2563eb;">🌟 Welcome to G-Electra!</h2>
      <p>Hello,</p>
      <p>We're excited to have you on board! You’ve been added as <b>${role.replaceAll("_", " ")}</b> in our platform.</p>
      <p>To get started, please set your password to activate your account:</p>
      <p>
        <a href="${link}" 
           style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;background:#2563eb;color:#fff;font-weight:bold;">
           Set Your Password
        </a>
      </p>
      <p>If the button doesn’t work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background:#f9f9f9; padding:10px; border-radius:6px;">${link}</p>
      <hr style="margin:20px 0;" />
      <p style="font-size:14px; color:#555;">
        Thank you for being a part of <b>G-Electra Club</b>.  
        We’re looking forward to collaborating with you and creating something amazing together!  
      </p>
      <p style="margin-top:20px;">
        Best Regards, <br/>
        <b>G-Electra Club</b> <br/>
        ✨ Team Web Dev
      </p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: "Welcome to G-Electra — Activate your account",
    html,
  });
}

