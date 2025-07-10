import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '@/lib/types';

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadNotifications: () => Notification[];
  getUnreadCount: () => number;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      notifications: [],

      // 通知追加
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Date.now().toString(),
          },
          ...state.notifications, // 新しい通知を先頭に
        ],
      })),

      // 既読マーク
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        ),
      })),

      // 全て既読
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      })),

      // 通知削除
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      // 未読通知取得
      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(n => !n.isRead);
      },

      // 未読数取得
      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter(n => !n.isRead).length;
      },
    }),
    {
      name: 'notifications', // 👈 元のキー名を維持
    }
  )
);