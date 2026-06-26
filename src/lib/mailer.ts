import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Onexe" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Onexe Password Reset OTP',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0e1a;color:#fff;border-radius:12px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
        <h2 style="margin:0 0 8px;font-size:20px;color:#fff">Password Reset</h2>
        <p style="color:#9ca3af;margin:0 0 24px;font-size:14px">Use the OTP below to reset your Onexe account password. It expires in <strong style="color:#fff">10 minutes</strong>.</p>
        <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;letter-spacing:1px;text-transform:uppercase">Your OTP</p>
          <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#3b82f6;font-family:monospace">${otp}</p>
        </div>
        <p style="color:#6b7280;font-size:12px;margin:0">If you did not request this, please ignore this email. Do not share this OTP with anyone.</p>
      </div>
    `,
  })
}
