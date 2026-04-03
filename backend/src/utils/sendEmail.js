import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `P.A.T.A.N.G Team <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        ...(options.html && { html: options.html })
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error('Failed to send email via SMTP. Falling back to console log.');
        console.error('--- Email Content Drop ---');
        console.error(`To: ${options.email}`);
        console.error(`Subject: ${options.subject}`);
        console.error(`Text: ${options.message}`);
        console.error('--------------------------');
        // Do not throw the error, allow the process (like signup) to continue so the OTP can be used from the console
    }
};

export default sendEmail;