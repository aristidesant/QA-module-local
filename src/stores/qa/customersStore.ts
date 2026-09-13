import { create } from 'zustand';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerEvent, CustomerNote, CustomerProfile, FollowUp } from '~/modules/qa/customers/types';
import { CUSTOMER_PROFILES } from '~/modules/qa/customers/mockData';
import { NOW_ISO } from '~/modules/qa/customers/constants';

let counter = 900;
const nextId = (prefix: string) => `${prefix}-${++counter}`;
const author = (role: TeamRole) => (role === 'qa-manager' ? { ...QA_MANAGER_PERSONA, sourceRole: 'QA_MANAGER' as const } : { ...SUPERVISOR_PERSONA, sourceRole: 'SUPERVISOR' as const });
const prepend = (p: CustomerProfile, e: CustomerEvent): CustomerProfile => ({ ...p, timeline: [e, ...p.timeline] });

export interface ScheduleFollowUpInput { customerId: string; date: string; reason: string; agentId: string; agentName: string; note?: string }

interface CustomersState {
	profiles: Record<string, CustomerProfile>;
	scheduleFollowUp: (input: ScheduleFollowUpInput, role: TeamRole) => FollowUp;
	completeFollowUp: (customerId: string, followUpId: string) => void;
	addNote: (customerId: string, text: string, role: TeamRole) => CustomerNote;
	setDoNotCall: (customerId: string, value: boolean, role: TeamRole) => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
	profiles: CUSTOMER_PROFILES,

	scheduleFollowUp: (input, role) => {
		const a = author(role);
		const fu: FollowUp = { id: nextId('fu'), date: input.date, reason: input.reason, assignedAgentName: input.agentName, status: 'scheduled' };
		set((s) => {
			const p = s.profiles[input.customerId];
			return { profiles: { ...s.profiles, [input.customerId]: prepend({ ...p, followUps: [fu, ...p.followUps] }, { id: nextId('ev'), type: 'followUp', date: NOW_ISO, title: `Follow-up scheduled: ${fu.reason}`, description: `${fu.assignedAgentName} · ${new Date(fu.date).toLocaleString()}${input.note ? ' · ' + input.note : ''}` }) } };
		});
		useNotificationStore.getState().addNotification({
			id: nextId('ntf'), agentId: input.agentId, category: 'DIRECT_MESSAGE', priority: 'NORMAL', title: `Follow-up assigned: ${input.reason}`,
			message: `${a.name} scheduled a follow-up with customer ${input.customerId} for ${new Date(input.date).toLocaleString()}.${input.note ? ' ' + input.note : ''}`,
			icon: 'phone-call', sourceRole: a.sourceRole, sourceId: a.id, read: false, archived: false, actioned: false, createdAt: NOW_ISO,
		});
		return fu;
	},

	completeFollowUp: (customerId, followUpId) => set((s) => ({ profiles: { ...s.profiles, [customerId]: { ...s.profiles[customerId], followUps: s.profiles[customerId].followUps.map((f) => (f.id === followUpId ? { ...f, status: 'done' } : f)) } } })),

	addNote: (customerId, text, role) => {
		const a = author(role);
		const note: CustomerNote = { id: nextId('cn'), authorName: a.name, authorRole: a.sourceRole, createdAt: NOW_ISO, text };
		set((s) => {
			const p = s.profiles[customerId];
			return { profiles: { ...s.profiles, [customerId]: prepend({ ...p, notes: [note, ...p.notes] }, { id: nextId('ev'), type: 'note', date: NOW_ISO, title: `Note by ${a.name}`, description: text }) } };
		});
		return note;
	},

	setDoNotCall: (customerId, value, role) => set((s) => {
		const a = author(role);
		const p = s.profiles[customerId];
		const updated = prepend({ ...p, customer: { ...p.customer, doNotCall: value, consent: { ...p.customer.consent, marketing: !value } } }, { id: nextId('ev'), type: 'flag', date: NOW_ISO, title: value ? 'Flagged Do-Not-Call' : 'Do-Not-Call flag removed', description: `By ${a.name}` });
		return { profiles: { ...s.profiles, [customerId]: updated } };
	}),
}));

export const selectCustomer = (id: string | undefined) => (s: CustomersState) => (id ? s.profiles[id] : undefined);
