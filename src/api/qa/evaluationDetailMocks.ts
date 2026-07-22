import type { MockConversation } from '~/models/qa';

/**
 * Temporary mock decoration: the backend does not yet return conversation
 * metadata on an evaluation detail, so `normalizeEvaluationDetail`
 * (src/api/evaluations.ts) decorates the real payload with a matching mock
 * conversation via `getMockConversationByRef`. Delete this module once the
 * backend includes conversation info in the evaluation detail response.
 */
export const mockConversations: MockConversation[] = [
	{
		id: 'conv-call-0001',
		campaignId: 10,
		campaignName: 'Calidad Ventas - Junio 2026',
		externalRef: 'call-0001',
		customerName: 'María López',
		agentName: 'Carlos Ruiz',
		channel: 'Voice',
		durationLabel: '05:20',
		occurredAt: '2026-06-01T14:32:00.000Z',
	},
	{
		id: 'conv-call-0002',
		campaignId: 10,
		campaignName: 'Calidad Ventas - Junio 2026',
		externalRef: 'call-0002',
		customerName: 'Ana Martínez',
		agentName: 'Lucía Ramos',
		channel: 'Voice',
		durationLabel: '03:00',
		occurredAt: '2026-06-01T15:20:00.000Z',
	},
	{
		id: 'conv-chat-0003',
		campaignId: 11,
		campaignName: 'Soporte Chat - Junio 2026',
		externalRef: 'chat-0003',
		customerName: 'Roberto Silva',
		agentName: 'Nadia Torres',
		channel: 'Chat',
		durationLabel: '08:45',
		occurredAt: '2026-06-02T17:05:00.000Z',
	},
];

export function getMockConversationByRef(interactionRef?: string | null) {
	return (
		mockConversations.find(
			(conversation) => conversation.externalRef === interactionRef
		) ?? null
	);
}
