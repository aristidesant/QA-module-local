import { create } from 'zustand';
import type {
	AgentNotification,
	NotificationRecipientRole,
	NotificationTrigger,
} from '~/models/qa/notifications';
import {
	SUPERVISOR_TRIGGERS,
	QA_MANAGER_TRIGGERS,
} from '~/modules/qa/dashboard/mockData';
import { INBOX_SEED } from '~/modules/qa/inbox/mockData';
import { isForInbox, nextNotificationId } from '~/modules/qa/inbox/helpers';
import { NOW_ISO } from '~/modules/qa/team/constants';

interface NotificationStoreState {
	// Notifications
	notifications: AgentNotification[];
	setNotifications: (notifications: AgentNotification[]) => void;
	addNotification: (notification: AgentNotification) => void;
	markAsRead: (notificationId: string) => void;
	markAsUnread: (notificationId: string) => void;
	archiveNotification: (notificationId: string) => void;
	unarchiveNotification: (notificationId: string) => void;
	/** Appends a reply to a thread and marks the notification as actioned. */
	addReply: (
		notificationId: string,
		reply: {
			fromRole: 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER';
			fromId: string;
			message: string;
		}
	) => void;
	/** Marks every unread notification of one inbox as read. */
	markAllAsRead: (role: NotificationRecipientRole, id: string) => void;

	// Triggers
	supervisorTriggers: NotificationTrigger[];
	qaManagerTriggers: NotificationTrigger[];
	setSupervisorTriggers: (triggers: NotificationTrigger[]) => void;
	setQAManagerTriggers: (triggers: NotificationTrigger[]) => void;
	toggleTrigger: (triggerId: string, isGlobal: boolean) => void;

	// Filtering helpers (selector-like)
	getUnreadCount: () => number;
	getArchivedNotifications: () => AgentNotification[];
	getUnreadNotifications: () => AgentNotification[];
	getNotificationsByCategory: (
		category: AgentNotification['category']
	) => AgentNotification[];
	getNotificationsByPriority: (
		priority: AgentNotification['priority']
	) => AgentNotification[];
}

export const useNotificationStore = create<NotificationStoreState>(
	(set, get) => ({
		// Initialize with mock data
		notifications: INBOX_SEED,
		supervisorTriggers: SUPERVISOR_TRIGGERS,
		qaManagerTriggers: QA_MANAGER_TRIGGERS,

		// Notification actions
		setNotifications: (notifications) => set({ notifications }),

		addNotification: (notification) =>
			set((state) => ({
				notifications: [notification, ...state.notifications],
			})),

		markAsRead: (notificationId) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === notificationId
						? { ...n, read: true, readAt: new Date().toISOString() }
						: n
				),
			})),

		markAsUnread: (notificationId) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
				),
			})),

		archiveNotification: (notificationId) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === notificationId ? { ...n, archived: true } : n
				),
			})),

		unarchiveNotification: (notificationId) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === notificationId ? { ...n, archived: false } : n
				),
			})),

		addReply: (notificationId, reply) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === notificationId
						? {
								...n,
								actioned: true,
								replies: [
									...(n.replies ?? []),
									{ id: nextNotificationId(), createdAt: NOW_ISO, ...reply },
								],
							}
						: n
				),
			})),

		markAllAsRead: (role, id) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					isForInbox(n, role, id) && !n.read
						? { ...n, read: true, readAt: new Date().toISOString() }
						: n
				),
			})),

		// Trigger actions
		setSupervisorTriggers: (triggers) => set({ supervisorTriggers: triggers }),

		setQAManagerTriggers: (triggers) => set({ qaManagerTriggers: triggers }),

		toggleTrigger: (triggerId, isGlobal) => {
			set((state) => {
				if (isGlobal) {
					return {
						qaManagerTriggers: state.qaManagerTriggers.map((t) =>
							t.id === triggerId ? { ...t, enabled: !t.enabled } : t
						),
					};
				}
				return {
					supervisorTriggers: state.supervisorTriggers.map((t) =>
						t.id === triggerId ? { ...t, enabled: !t.enabled } : t
					),
				};
			});
		},

		// Filtering helpers
		getUnreadCount: () => {
			const state = get();
			return state.notifications.filter((n) => !n.read && !n.archived).length;
		},

		getArchivedNotifications: () => {
			const state = get();
			return state.notifications.filter((n) => n.archived);
		},

		getUnreadNotifications: () => {
			const state = get();
			return state.notifications.filter((n) => !n.read && !n.archived);
		},

		getNotificationsByCategory: (category) => {
			const state = get();
			return state.notifications.filter(
				(n) => n.category === category && !n.archived
			);
		},

		getNotificationsByPriority: (priority) => {
			const state = get();
			return state.notifications.filter(
				(n) => n.priority === priority && !n.archived
			);
		},
	})
);

/** Stable slice selector — derive filtered lists with useMemo in the component. */
export const selectNotifications = (s: NotificationStoreState) =>
	s.notifications;
