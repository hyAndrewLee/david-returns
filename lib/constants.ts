type Product = {
	id: string;
	name: string;
	description: string;
	priceInCents: number;
	isRecurring?: boolean;
};

export const PRODUCTS: Product[] = [
	{
		id: 'pickup-base',
		name: 'One-Time Pickup',
		description: 'Base pickup fee for one item',
		priceInCents: 799,
	},
	{
		id: 'additional-item',
		name: 'Additional Item',
		description: 'Fee per additional item after the first',
		priceInCents: 100,
	},
	{
		id: 'instant-pickup',
		name: 'Instant Pickup',
		description: 'Same-day instant pickup surcharge',
		priceInCents: 150,
	},
	{
		id: 'unlimited-membership',
		name: 'Unlimited Membership',
		description: 'Unlimited pickups per month',
		priceInCents: 2299,
		isRecurring: true,
	},
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const TIME_WINDOWS = ['8-11am', '11am-2pm', '2-5pm', '5-8pm'] as const;

export const ORDER_STATUSES = [
	'scheduled',
	'picked_up',
	'sent_to_carrier',
	'in_transit',
	'completed',
	'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<OrderStatus, string> = {
	scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
	picked_up: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
	sent_to_carrier: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
	in_transit: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
	completed: 'bg-green-500/10 text-green-500 border-green-500/20',
	cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
	scheduled: 'Scheduled',
	picked_up: 'Picked Up',
	sent_to_carrier: 'Sent to Carrier',
	in_transit: 'In Transit',
	completed: 'Completed',
	cancelled: 'Cancelled',
};
