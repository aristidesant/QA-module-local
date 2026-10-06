import { create } from 'zustand';
import type {
	DisputeCase,
	DisputeItemDecision,
	OpenDisputeInput,
} from '~/models/qa/disputeCases';
import { DISPUTE_CASES_SEED } from '~/modules/qa/disputes/cases/mockData';
import {
	applyCorrections,
	headlineScore,
	listDisputableItems,
} from '~/modules/qa/disputes/cases/recalc';
import {
	getDisputeCall,
	resolutionStatus,
} from '~/modules/qa/disputes/cases/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';

interface DisputesState {
	cases: DisputeCase[];
	openDispute: (input: OpenDisputeInput) => DisputeCase;
	acceptDispute: (
		id: string,
		decisions: DisputeItemDecision[],
		managerComment: string
	) => void;
	rejectDispute: (id: string, managerComment: string) => void;
}

export const selectCases = (s: DisputesState) => s.cases;

let counter = 1000 + DISPUTE_CASES_SEED.length;
const nextId = () => `DSP-${++counter}`;

const typeLabel = (type: DisputeCase['evaluationType']) =>
	CALL_EVALUATION_TABS.find((tab) => tab.key === type)?.label ?? type;

const notify = (notification: Parameters<typeof buildNotification>[0]) =>
	useNotificationStore
		.getState()
		.addNotification(buildNotification(notification));

export const useDisputesStore = create<DisputesState>((set, get) => ({
	cases: DISPUTE_CASES_SEED,

	openDispute: (input) => {
		const agent = TEAM_AGENTS.find((a) => a.id === input.agentId);
		const draft: DisputeCase = {
			id: nextId(),
			callId: input.callId,
			campaignId: input.campaignId,
			campaignName: input.campaignName,
			agentId: input.agentId,
			agentName: agent?.name ?? input.agentId,
			supervisorId: agent?.supervisorId ?? SUPERVISOR_PERSONA.id,
			supervisorName: agent?.supervisorName ?? SUPERVISOR_PERSONA.name,
			team: agent?.team ?? 'Team 1',
			evaluationType: input.evaluationType,
			scoreBefore: 0,
			scoreAfter: null,
			agentComment: input.agentComment,
			flaggedItemIds: input.flaggedItemIds,
			status: 'open',
			createdAt: NOW_ISO,
			resolvedAt: null,
			resolvedBy: null,
			managerComment: null,
			decisions: [],
		};
		const dispute: DisputeCase = {
			...draft,
			scoreBefore: headlineScore(getDisputeCall(draft), input.evaluationType),
		};

		set((s) => ({ cases: [dispute, ...s.cases] }));

		const payload = {
			kind: 'DISPUTE_UPDATE' as const,
			disputeId: dispute.id,
			status: 'open' as const,
			evaluationType: dispute.evaluationType,
			callId: dispute.callId,
			agentName: dispute.agentName,
			scoreBefore: dispute.scoreBefore,
			scoreAfter: null,
		};
		const message = `${dispute.agentName} disputes the ${typeLabel(dispute.evaluationType)} evaluation of call ${dispute.callId}.`;

		notify({
			agentId: dispute.agentId,
			recipientRole: 'QA_MANAGER',
			recipientId: QA_MANAGER_PERSONA.id,
			category: 'DIRECT_MESSAGE',
			priority: 'HIGH',
			title: `Dispute opened · ${dispute.agentName}`,
			message,
			icon: 'flag',
			sourceRole: 'AGENT',
			sourceId: dispute.agentId,
			payload,
		});
		notify({
			agentId: dispute.agentId,
			recipientRole: 'SUPERVISOR',
			recipientId: dispute.supervisorId,
			category: 'DIRECT_MESSAGE',
			priority: 'NORMAL',
			title: `Dispute opened · ${dispute.agentName}`,
			message,
			icon: 'flag',
			sourceRole: 'AGENT',
			sourceId: dispute.agentId,
			payload,
		});

		return dispute;
	},

	acceptDispute: (id, decisions, managerComment) => {
		const dispute = get().cases.find((c) => c.id === id);
		if (!dispute || dispute.status !== 'open') return;

		const call = getDisputeCall(dispute);
		const items = listDisputableItems(call, dispute.evaluationType);
		const corrected = applyCorrections(call, dispute.evaluationType, decisions);
		const after = headlineScore(corrected, dispute.evaluationType);
		const status = resolutionStatus(dispute, items, decisions);
		const correctedCount = decisions.filter(
			(d) => d.outcome === 'correct'
		).length;
		const keptCount = decisions.length - correctedCount;
		const partial = status === 'partially-accepted';

		set((s) => ({
			cases: s.cases.map((c) =>
				c.id === id
					? {
							...c,
							status,
							scoreAfter: after,
							resolvedAt: NOW_ISO,
							resolvedBy: QA_MANAGER_PERSONA.name,
							managerComment,
							decisions,
						}
					: c
			),
		}));

		const payload = {
			kind: 'DISPUTE_UPDATE' as const,
			disputeId: dispute.id,
			status,
			evaluationType: dispute.evaluationType,
			callId: dispute.callId,
			agentName: dispute.agentName,
			scoreBefore: dispute.scoreBefore,
			scoreAfter: after,
		};
		const scoreLine =
			dispute.scoreBefore !== null && after !== null
				? ` The score was corrected from ${dispute.scoreBefore} to ${after}.`
				: '';

		notify({
			agentId: dispute.agentId,
			recipientRole: 'AGENT',
			recipientId: dispute.agentId,
			category: partial ? 'DIRECT_MESSAGE' : 'POSITIVE_RECOGNITION',
			priority: 'NORMAL',
			title: partial
				? 'Your dispute was partially accepted'
				: 'Your dispute was accepted',
			message: `${correctedCount} item(s) corrected and ${keptCount} kept on call ${dispute.callId}.${scoreLine}`,
			icon: 'flag',
			sourceRole: 'QA_MANAGER',
			sourceId: QA_MANAGER_PERSONA.id,
			payload,
		});
		notify({
			agentId: dispute.agentId,
			recipientRole: 'SUPERVISOR',
			recipientId: dispute.supervisorId,
			category: 'DIRECT_MESSAGE',
			priority: 'NORMAL',
			title: `Dispute ${partial ? 'partially accepted' : 'accepted'} · ${dispute.agentName}`,
			message: `The ${typeLabel(dispute.evaluationType)} evaluation of call ${dispute.callId} was corrected (${correctedCount} item(s), ${keptCount} kept).${scoreLine}`,
			icon: 'flag',
			sourceRole: 'QA_MANAGER',
			sourceId: QA_MANAGER_PERSONA.id,
			payload,
		});
	},

	rejectDispute: (id, managerComment) => {
		const dispute = get().cases.find((c) => c.id === id);
		if (!dispute || dispute.status !== 'open') return;

		set((s) => ({
			cases: s.cases.map((c) =>
				c.id === id
					? {
							...c,
							status: 'rejected',
							resolvedAt: NOW_ISO,
							resolvedBy: QA_MANAGER_PERSONA.name,
							managerComment,
						}
					: c
			),
		}));

		const payload = {
			kind: 'DISPUTE_UPDATE' as const,
			disputeId: dispute.id,
			status: 'rejected' as const,
			evaluationType: dispute.evaluationType,
			callId: dispute.callId,
			agentName: dispute.agentName,
			scoreBefore: dispute.scoreBefore,
			scoreAfter: null,
		};

		notify({
			agentId: dispute.agentId,
			recipientRole: 'AGENT',
			recipientId: dispute.agentId,
			category: 'DIRECT_MESSAGE',
			priority: 'NORMAL',
			title: 'Your dispute was rejected',
			message: managerComment,
			icon: 'flag',
			sourceRole: 'QA_MANAGER',
			sourceId: QA_MANAGER_PERSONA.id,
			payload,
		});
		notify({
			agentId: dispute.agentId,
			recipientRole: 'SUPERVISOR',
			recipientId: dispute.supervisorId,
			category: 'DIRECT_MESSAGE',
			priority: 'LOW',
			title: `Dispute rejected · ${dispute.agentName}`,
			message: managerComment,
			icon: 'flag',
			sourceRole: 'QA_MANAGER',
			sourceId: QA_MANAGER_PERSONA.id,
			payload,
		});
	},
}));
