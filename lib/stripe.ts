import 'server-only';

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const isCustomerNotFoundError = (error: unknown): boolean => {
	if (typeof error !== 'object' || error === null) return false;
	const err = error as { type?: string; code?: string; param?: string };
	return err.type === 'StripeInvalidRequestError' && err.code === 'resource_missing' && err.param === 'customer';
};
