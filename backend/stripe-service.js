const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required for Stripe payments')
}
const stripe = require('stripe')(stripeSecretKey)

// Crear suscripción de cliente
async function createSubscription(email, priceId) {
  try {
    let customer = await stripe.customers.list({ email, limit: 1 })
    
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({ email })
    } else {
      customer = customer.data[0]
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    }
  } catch (error) {
    console.error('Stripe subscription error:', error.message)
    throw error
  }
}

// Cancelar suscripción
async function cancelSubscription(subscriptionId) {
  try {
    await stripe.subscriptions.del(subscriptionId)
    return { ok: true }
  } catch (error) {
    console.error('Stripe cancel error:', error.message)
    throw error
  }
}

module.exports = { 
  createSubscription,
  cancelSubscription
}
