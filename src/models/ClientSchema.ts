import { z } from 'zod';

export const ClientSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	identifier: z.string().optional(),
	description: z.string().optional(),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	rnc: z.string().optional(),
	userId: z.number().nullable().optional(),
	countryId: z.number().nullable().optional(),
});

export type ClientFormValues = z.infer<typeof ClientSchema>;
