const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Enviar email de soporte
async function sendSupportEmail(name, email, message, subject = 'Nuevo Mensaje de Soporte') {
  try {
    // Email al equipo de soporte
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SUPPORT_EMAIL || 'soporte@tu-empresa.com',
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
