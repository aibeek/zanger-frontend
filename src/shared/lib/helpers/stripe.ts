import { loadStripe } from '@stripe/stripe-js'

import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@/shared/config'

export const stripePromise = loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY!)
