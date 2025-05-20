const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { amount, metadata } = JSON.parse(event.body);
        
        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: `Football Session - ${metadata.group}`,
                        description: `Player: ${metadata.playerName}\nDate: ${metadata.date}`,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${event.headers.referer}?success=true`,
            cancel_url: `${event.headers.referer}?canceled=true`,
            metadata: metadata,
            customer_email: 'carl.johnson.batts@gmail.com' // Replace with your email or remove if not needed
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                sessionId: session.id
            })
        };
    } catch (err) {
        console.error('Error creating checkout session:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
