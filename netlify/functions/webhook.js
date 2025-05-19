const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const sig = event.headers['stripe-signature'];
    let webhookEvent;

    try {
        webhookEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
        };
    }

    // Handle the event
    switch (webhookEvent.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = webhookEvent.data.object;
            console.log('PaymentIntent was successful!', paymentIntent);
            break;
        case 'payment_method.attached':
            const paymentMethod = webhookEvent.data.object;
            console.log('PaymentMethod was attached!', paymentMethod);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${webhookEvent.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
    };
};
