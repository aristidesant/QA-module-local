import type {
	AgentNotification,
	NotificationPayload,
	NotificationRecipientRole,
} from '~/models/qa/notifications';
import { NOW_ISO } from '~/modules/qa/team/constants';

/** A notification belongs to an inbox when it is unarchived and addressed to that identity. */
export const isForInbox = (
	n: AgentNotification,
	role: NotificationRecipientRole,
	id: string
): boolean =>
	!n.archived &&
	(n.recipientRole ?? 'AGENT') === role &&
	(n.recipientId ?? n.agentId) === id;

export const inboxFor = (
	all: AgentNotification[],
	role: NotificationRecipientRole,
	id: string
): AgentNotification[] => all.filter((n) => isForInbox(n, role, id));

export const unreadCountFor = (
	all: AgentNotification[],
	role: NotificationRecipientRole,
	id: string
): number => all.filter((n) => isForInbox(n, role, id) && !n.read).length;

let counter = 5000;
export const nextNotificationId = () => `ntf-${++counter}`;

export interface BuildNotificationInput {
	agentId: string;
	recipientRole?: NotificationRecipientRole;
	recipientId?: string;
	category: AgentNotification['category'];
	priority?: AgentNotification['priority'];
	title: string;
	message: string;
	icon: string;
	sourceRole: AgentNotification['sourceRole'];
	sourceId?: string;
	metric?: AgentNotification['metric'];
	payload?: NotificationPayload;
	actions?: AgentNotification['actions'];
	replies?: AgentNotification['replies'];
	threadId?: string;
	createdAt?: string;
	read?: boolean;
	id?: string;
}

/**
 * Typed factory every store uses to push into the inbox, so recipient and
 * payload are never forgotten and ids stay unique across sections.
 */
export function buildNotification(
	input: BuildNotificationInput
): AgentNotification {
	const { id, ...rest } = input;
	return {
		id: id ?? nextNotificationId(),
		read: false,
		archived: false,
		actioned: false,
		priority: 'NORMAL',
		createdAt: NOW_ISO,
		...rest,
	};
}
