import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

export const sendResetPasswordEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: `"Notesify Support"
        <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Reset your Notesify Password",
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Please click the button below to set a new password. This link is valid for 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 0.9rem; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent to: ${email}`);
    } catch (error) {
        console.error("Error sending reset email:", error);
        throw new Error("Failed to send reset email");
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: `"Notesify Support"
        <${process.env.MAIN_USER}>`,
        to: email,
        subject: "Welcome to Notesify!",
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Notesify!</h2>
        <p>Thank you for joining Notesify, ${name}! You can now start creating and organizing your notes.</p>
        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to: ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
};