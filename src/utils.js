import nodeMailer from 'nodemailer'
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from './config.js'

const transporter = nodeMailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

export const createEmail = async(email) => {
    try {
        await transporter.sendMail(email);
        return { status: true, message: ['El correo ha sido enviado'] };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

export const resHandler = (res, code, message, data = null) => {
    const status = (code === 200)

    return res.status(code).json({
        status: status,
        message: message,
        data: data
    });
}