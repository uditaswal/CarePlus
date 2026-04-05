import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendReminderEmail = async (to, appointmentDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Appointment Reminder',
        text: `This is a reminder for your upcoming appointment. Details: ${appointmentDetails}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully');
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

export const sendPaymentConfirmationEmail = async (to, paymentDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Payment Confirmation',
        text: `Your payment has been successfully processed. Details: ${paymentDetails}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
    }
};