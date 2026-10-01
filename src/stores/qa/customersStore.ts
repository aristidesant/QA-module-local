import { create } from 'zustand';
import {
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type {
	CustomerEvent,
	CustomerNote,
	CustomerProfile,
} from '~/modules/qa/customers/types';
import { CUSTOMER_PROFILES } from '~/modules/qa/customers/mockData';
import { NOW_ISO } from '~/modules/qa/customers/constants';

let counter = 900;
const nextId = (prefix: string) => `${prefix}-${++counter}`;
const author = (role: TeamRole) =>
	role === 'qa-manager'
		? { ...QA_MANAGER_PERSONA, sourceRole: 'QA_MANAGER' as const }
		: { ...SUPERVISOR_PERSONA, sourceRole: 'SUPERVISOR' as const };
const prepend = (p: CustomerProfile, e: CustomerEvent): CustomerProfile => ({
	...p,
	timeline: [e, ...p.timeline],
});

interface CustomersState {
	profiles: Record<string, CustomerProfile>;
	addNote: (customerId: string, text: string, role: TeamRole) => CustomerNote;
	setDoNotCall: (customerId: string, value: boolean, role: TeamRole) => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
	profiles: CUSTOMER_PROFILES,

	addNote: (customerId, text, role) => {
		const a = author(role);
		const note: CustomerNote = {
			id: nextId('cn'),
			authorName: a.name,
			authorRole: a.sourceRole,
			createdAt: NOW_ISO,
			text,
		};
		set((s) => {
			const p = s.profiles[customerId];
			return {
				profiles: {
					...s.profiles,
					[customerId]: prepend(
						{ ...p, notes: [note, ...p.notes] },
						{
							id: nextId('ev'),
							type: 'note',
							date: NOW_ISO,
							title: `Note by ${a.name}`,
							description: text,
						}
					),
				},
			};
		});
		return note;
	},

	setDoNotCall: (customerId, value, role) =>
		set((s) => {
			const a = author(role);
			const p = s.profiles[customerId];
			const updated = prepend(
				{
					...p,
					customer: {
						...p.customer,
						doNotCall: value,
						consent: { ...p.customer.consent, marketing: !value },
					},
				},
				{
					id: nextId('ev'),
					type: 'flag',
					date: NOW_ISO,
					title: value ? 'Flagged Do-Not-Call' : 'Do-Not-Call flag removed',
					description: `By ${a.name}`,
				}
			);
			return { profiles: { ...s.profiles, [customerId]: updated } };
		}),
}));

export const selectCustomer =
	(id: string | undefined) => (s: CustomersState) =>
		id ? s.profiles[id] : undefined;
