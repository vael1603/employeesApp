import nodeMailer from 'nodemailer'

const transporter = nodeMailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
})

export const createEmail = (email) => {
    transporter.sendMail( email, (error, info) => {
        if(error) {
            return {status: false, message: [error.message]}
        } else {
            return {status: true, message: ['El correo ha sido enviado']}
        }
    })
}