import nodemailer from "nodemailer";
import crypto from "crypto";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
};

export const sendVerificationEmail = async (email, code) => {
    try {
        console.log(`Sending verification email to: ${email}`);
        await transporter.sendMail({
            from: `"Your App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your Email Address",
            html: `
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `,
        });
        console.log(`Verification email sent successfully to: ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
};