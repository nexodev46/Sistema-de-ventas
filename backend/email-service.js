const nodemailer = require('nodemailer')

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = Number(process.env.SMTP_PORT || 465)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const supportEmail = process.env.SUPPORT_EMAIL

if (process.env.NODE_ENV === 'production') {
  if (!smtpUser || !smtpPass) {
    console.error('SMTP_USER and SMTP_PASS must be set in production for email delivery.')
    process.exit(1)
  }
  if (!supportEmail) {
    console.error('SUPPORT_EMAIL must be set in production for support emails.')
    process.exit(1)
  }
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
})

// Enviar email de soporte
async function sendSupportEmail(name, email, message, subject = 'Nuevo Mensaje de Soporte') {
  try {
    // Email al equipo de soporte
    await transporter.sendMail({
      from: smtpUser,
      to: supportEmail || 'soporte@tu-empresa.com',
      subject: `[SOPORTE] ${subject}`,
      html: `
        <h2>Nuevo Mensaje de Soporte</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr/>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    })

    // Confirmación al usuario
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '✅ Hemos recibido tu mensaje',
      html: `
        <h2>¡Gracias por contactar a nuestro soporte!</h2>
        <p>Recibimos tu mensaje y nos comunicaremos contigo pronto.</p>
        <p><strong>Número de ticket:</strong> ${Date.now()}</p>
        <hr/>
        <p><em>Por favor, no respondas a este email. Usa nuestra plataforma para comunicarte.</em></p>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Email error:', error.message)
    throw error
  }
}

module.exports = {
  sendSupportEmail
}
