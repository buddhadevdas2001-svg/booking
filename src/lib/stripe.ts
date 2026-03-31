import { loadStripe } from '@stripe/stripe-js'

// Client-side initialization using the Publishable Key
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

/**
 * Initiates the checkout process by calling our backend to create a session
 * then redirecting the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession(bookingId: string) {
    try {
        const res = await fetch('/api/checkout/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookingId }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || 'Failed to create checkout session')
        }

        const { sessionId } = await res.json()
        
        const stripe = await stripePromise
        if (!stripe) throw new Error('Stripe failed to load')

        const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId,
        })

        if (stripeError) throw stripeError
    } catch (err) {
        console.error('Checkout error:', err)
        throw err
    }
}
