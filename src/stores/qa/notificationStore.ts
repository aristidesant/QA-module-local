import { create } from 'zustand';
import type { AgentNotification, NotificationTrigger } from '~/models/qa/notifications';
import { AGENT_NOTIFICATIONS, SUPERVISOR_TRIGGERS, QA_MANAGER_TRIGGERS } from '~/modules/qa/dashboard/mockData';

interface NotificationStoreState {
  // Notifications
  notifications: AgentNotification[];
  setNotifications: (notifications: AgentNotification[]) => void;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  archiveNotification: (notificationId: string) => void;
  unarchiveNotification: (notificationId: string) => void;

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
  getNotificationsByCategory: (category: AgentNotification['category']) => AgentNotification[];
  getNotificationsByPriority: (priority: AgentNotification['priority']) => AgentNotification[];
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  // Initialize with mock data
  notifications: AGENT_NOTIFICATIONS,
  supervisorTriggers: SUPERVISOR_TRIGGERS,
  qaManagerTriggers: QA_MANAGER_TRIGGERS,

  // Notification actions
  setNotifications: (notifications) => set({ notifications }),

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
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
    return state.notifications.filter((n) => n.category === category && !n.archived);
  },

  getNotificationsByPriority: (priority) => {
    const state = get();
    return state.notifications.filter((n) => n.priority === priority && !n.archived);
  },
}));
