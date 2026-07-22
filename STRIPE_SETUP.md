# Integración Stripe - Guía Instalación

## 📋 Requisitos

- Cuenta en [Stripe.com](https://stripe.com)
- Claves API de Stripe
- Node.js backend + React frontend

---

## 1️⃣ Crear Cuenta en Stripe

1. Ir a https://stripe.com
2. Hacer clic en "Registrarse"
3. Completar información empresarial
4. Verificar email
5. Activar modo vivo (después de testing)

---

## 2️⃣ Obtener Claves API

En Stripe Dashboard:
1. **Developers** (arriba) → **API Keys**
2. Copiar dos claves:
   - `pk_live_...` (Publishable Key - frontend)
   - `sk_live_...` (Secret Key - backend)

⚠️ **NUNCA compartas tu Secret Key**

---

## 3️⃣ Configurar Backend

### Instalar Stripe
```bash
cd backend
npm install stripe
npm install cors dotenv
```

### Crear archivo `stripe.js` en backend

```javascript
// backend/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear cliente con suscripción
async function createSubscription(email, planId) {
  const customer = await stripe.customers.create({ email });
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: planId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  
  return {
    subscriptionId: subscription.id,
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  };
}

// Webhook para cambios en suscripción
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'invoice.payment_succeeded':
      console.log('Pago exitoso:', event.data.object);
      break;
    case 'invoice.payment_failed':
      console.log('Pago fallido:', event.data.object);
      break;
    case 'customer.subscription.deleted':
      console.log('Suscripción cancelada');
      break;
  }
  
  res.json({received: true});
});

module.exports = { createSubscription };
```

### Agregar a `server.js`
```javascript
const { createSubscription } = require('./stripe');

app.post('/api/payment/create-subscription', async (req, res) => {
  const { email, planId } = req.body;
  const result = await createSubscription(email, planId);
  res.json(result);
});
```

---

## 4️⃣ Configurar Frontend

### Instalar librerías
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/js
```

### Crear componente `SubscriptionForm.tsx`

```typescript
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function SubscriptionForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    
    try {
      // 1. Crear suscripción en backend
      const { data } = await axios.post('/api/payment/create-subscription', {
        email: userEmail,
        planId: planId,
      });

      // 2. Confirmar pago en frontend
      const result = await stripe!.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements!.getElement(CardElement)!,
          billing_details: { email: userEmail },
        },
      });

      if (result.error) {
        alert('Error: ' + result.error.message);
      } else {
        alert('✅ Suscripción exitosa!');
        // Redirigir a dashboard
      }
    } catch (error) {
      console.error(error);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h2>Elige tu Plan</h2>
      <button onClick={() => handleSubscribe('price_basic')}>
        Plan Básico - $99/mes
      </button>
      <button onClick={() => handleSubscribe('price_pro')}>
        Plan Pro - $299/mes
      </button>
    </div>
  );
}
```

---

## 5️⃣ Crear Planes en Stripe

En Stripe Dashboard:

1. **Products** → **Add Product**

**Plan 1: Básico**
- Nombre: "Plan Básico"
- Precio: $99/mes
- ID: `price_basic`

**Plan 2: Pro**
- Nombre: "Plan Pro"
- Precio: $299/mes
- ID: `price_pro`

**Plan 3: Enterprise**
- Contactar por precio
- ID: `price_enterprise`

---

## 6️⃣ Variables de Entorno

### Backend `.env`
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend `.env.local`
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 7️⃣ Webhook (Importante)

En Stripe Dashboard:

1. **Developers** → **Webhooks**
2. **Add Endpoint**
3. URL: `https://tu-dominio.com/webhooks/stripe`
4. Eventos: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
5. Copiar **Signing Secret** a `.env`

---

## 8️⃣ Página de Planes

```typescript
// pages/Planes.tsx
export function PlanesPage() {
  const plans = [
    {
      name: 'Básico',
      price: 99,
      features: ['1-5 usuarios', 'Productos ilimitados', 'Soporte email'],
      id: 'price_basic'
    },
    {
      name: 'Pro',
      price: 299,
      features: ['5-20 usuarios', 'Productos ilimitados', 'Soporte chat'],
      id: 'price_pro'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Usuarios ilimitados', 'Soporte 24/7', 'API custom'],
      id: 'price_enterprise'
    }
  ];

  return (
    <div className="planes-grid">
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

---

## ✅ Testing Stripe (Modo Sandbox)

Antes de ir live, usa tarjetas de prueba:

```
Tarjeta válida:    4242 4242 4242 4242
Tarjeta rechazada: 4000 0000 0000 0002
Fecha: 12/25
CVC: 123
```

---

## 🔐 Checklist Stripe

- [ ] Cuenta creada en Stripe
- [ ] Claves API obtenidas
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Planes creados en Stripe
- [ ] Webhook configurado
- [ ] Testing en modo sandbox
- [ ] Cambiar a modo vivo

