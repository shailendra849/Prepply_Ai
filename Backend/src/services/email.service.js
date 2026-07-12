const nodemailer = require("nodemailer")

/**
 * Gmail SMTP transporter.
 *
 * Required environment variables (add these to Backend/.env):
 *   EMAIL_USER  -> your Gmail address, e.g. yourname@gmail.com
 *   EMAIL_PASS  -> a Gmail "App Password" (NOT your normal Gmail password)
 *
 * How to get a Gmail App Password:
 *   1. Turn on 2-Step Verification on your Google account.
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Create an app password for "Mail" and use the 16-character code as EMAIL_PASS.
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

/**
 * @name generateOtp
 * @description generate a random 6 digit numeric OTP
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * @name sendOtpEmail
 * @description send a styled OTP verification email to the given address
 */
async function sendOtpEmail({ to, username, otp }) {

    const mailOptions = {
        from: `"Interview AI" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verify your email - Interview AI",
        html: `
        <div style="background-color:#0d1117;padding:40px 20px;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background-color:#161b22;border:1px solid #2a3348;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#ff2d78 0%,#c81d5c 100%);padding:28px 32px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Interview AI</h1>
                </div>
                <div style="padding:32px;">
                    <h2 style="margin:0 0 12px;color:#e6edf3;font-size:18px;">Hi ${username || "there"} 👋</h2>
                    <p style="margin:0 0 24px;color:#7d8590;font-size:14px;line-height:1.6;">
                        Thanks for signing up. Use the verification code below to confirm your email address.
                        This code expires in 10 minutes.
                    </p>
                    <div style="text-align:center;margin:0 0 28px;">
                        <span style="display:inline-block;padding:16px 32px;background-color:#1e2535;border:1px solid #2a3348;border-radius:12px;color:#ff2d78;font-size:32px;font-weight:700;letter-spacing:8px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="margin:0;color:#7d8590;font-size:12px;line-height:1.6;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
        `
    }

    await transporter.sendMail(mailOptions)
}

module.exports = { generateOtp, sendOtpEmail }
