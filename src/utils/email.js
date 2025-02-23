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

export const sendVerificationEmail = async (email, link, code, name) => {
    try {
        // console.log(`Sending verification email to: ${email}`);

        const emailTemplate = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px;">Nano Tap</h1>
                </div>
                <div style="padding: 20px;">
                    <h2 style="font-size: 20px; margin-bottom: 20px;">Thanks for signing up!</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name},</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">Please use the following One Time Password (OTP) to verify your email address:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 5px;">${code}</h3>
                    </div>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">This passcode will only be valid for the next 10 minutes. If the passcode does not work, you can use this login verification link:</p>
                    <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 14px; color: #666;">
                    <p>If you did not sign up for this account, please ignore this email.</p>
                    <p>© 2023 Tailwind Tap. All rights reserved.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Nano Tap" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your Email Address",
            html: emailTemplate,
        });

        // console.log(`Verification email sent successfully to: ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
};