# Sistema de Monitoreo - Sentry + Email

## 📋 Qué es esto

- **Sentry**: Monitorea errores en tiempo real
- **Email de Soporte**: Sistema para clientes contactar soporte

---

## 1️⃣ Configurar Sentry

### Crear Cuenta

1. Ir a https://sentry.io
2. Sign up
3. Crear proyecto
4. Seleccionar "Express" para backend y "React" para frontend

### Obtener DSN

Después de crear proyecto, te mostrará:
```
https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

Copiar este URL.

---

## 2️⃣ Backend - Integrar Sentry

### Instalar
```bash
cd backend
npm install @sentry/node @sentry/tracing
```

### Configurar en `server.js`

Al inicio del archivo:
```javascript
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
```

Al final del archivo (después de rutas):
```javascript
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  console.log("✅ Sentry monitoring active");
});
```

### Capturar errores
```javascript
// En cualquier ruta
try {
  // código
} catch (error) {
  Sentry.captureException(error);
  res.status(500).json({ error: 'Internal error' });
}
```

---

## 3️⃣ Frontend - Integrar Sentry

### Instalar
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

### Configurar en `main.tsx`

```typescript
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Error occurred</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

---

## 4️⃣ Sistema de Soporte por Email

### Crear `supportService.ts` en backend

```typescript
// backend/supportService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendSupportEmail(name, email, message) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'soporte@tu-empresa.com',
    subject: `[SOPORTE] Mensaje de ${name}`,
    html: `
      <h2>Nuevo Mensaje de Soporte</h2>
      <p><strong>De:</strong> ${name} (${email})</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `,
  });

  // Confirmación al usuario
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Hemos recibido tu mensaje - Soporte',
    html: `
      <h2>¡Gracias por contactar!</h2>
      <p>Recibimos tu mensaje y te responderemos pronto.</p>
      <p>Tu caso se ha asignado el ID: <strong>${Date.now()}</strong></p>
    `,
  });
}

module.exports = { sendSupportEmail };
```

### Agregar ruta en `server.js`

```javascript
const { sendSupportEmail } = require('./supportService');

app.post('/api/support/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await sendSupportEmail(name, email, message);
    res.json({ ok: true, message: 'Email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send' });
  }
});
```

---

## 5️⃣ Página de Soporte en Frontend

```typescript
// pages/Soporte.tsx
import { useState } from 'react';
import axios from 'axios';

export function SoportePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/support/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error al enviar');
    }

    setLoading(false);
  };

  return (
    <div className="support-container">
      <h2>Contactar Soporte</h2>
      {success && <div className="alert-success">✅ Mensaje enviado!</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tu nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Tu email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <textarea
          placeholder="Tu mensaje"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </form>

      <div className="faq">
        <h3>Preguntas Frecuentes</h3>
        <ul>
          <li><strong>¿Cómo cambio mi contraseña?</strong> - Ve a Configuración > Seguridad</li>
          <li><strong>¿Cómo exporto mis datos?</strong> - Ve a Configuración > Datos</li>
          <li><strong>¿Cuál es el SLA?</strong> - 99.5% uptime</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 6️⃣ Variables de Entorno

### Backend `.env`
```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Email (usar Gmail, SendGrid, etc)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app
```

### Frontend `.env.local`
```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## 7️⃣ Usar Gmail para Emails

1. Activar 2FA en Gmail
2. Crear "App Password": https://myaccount.google.com/apppasswords
3. Copiar contraseña a `.env`

O usar **SendGrid** (recomendado para producción):
1. Crear cuenta en https://sendgrid.com
2. Crear API key
3. Usar en lugar de SMTP

---

## ✅ Checklist

- [ ] Sentry cuenta creada
- [ ] DSN copiado
- [ ] Backend integrado
- [ ] Frontend integrado
- [ ] Email SMTP configurado
- [ ] Página de soporte creada
- [ ] Testing de emails
- [ ] Variables en .env

---

## 📊 Monitoreo en Vivo

En Sentry Dashboard verás:
- ✅ Errores en tiempo real
- ✅ Usuarios afectados
- ✅ Stack traces completos
- ✅ Performance metrics
- ✅ Alertas automáticas

