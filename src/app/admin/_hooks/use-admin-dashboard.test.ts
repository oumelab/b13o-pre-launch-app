import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { useAdminDashboard } from './use-admin-dashboard';

// Zustandストアのモック
mock.module('@/stores/reservation-store', () => ({
  useReservationStore: mock(),
}));

mock.module('@/stores/notification-store', () => ({
  useNotificationStore: mock(),
}));

// モックデータ
const mockReservations = [
  {
    id: '1',
    name: 'テスト太郎',
    email: 'test@example.com',
    interests: ['programming', 'design'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'サンプル花子',
    email: 'sample@example.com',
    interests: ['programming'],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8日前
  },
];

const mockNotifications = [
  {
    id: '1',
    type: 'new_registration',
    title: '新規登録',
    message: '新しい事前登録がありました',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'new_registration',
    title: '新規登録',
    message: '新しい事前登録がありました',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

describe('useAdminDashboard', () => {
  const mockMarkAsRead = mock();
  const mockMarkAllAsRead = mock();
  const mockGetUnreadNotifications = mock();

  beforeEach(async () => {
    // モックをリセット
    mockMarkAsRead.mockReset();
    mockMarkAllAsRead.mockReset();
    mockGetUnreadNotifications.mockReset();

    // useReservationStoreのモック設定
    const reservationStore = await import('@/stores/reservation-store');
    ((reservationStore.useReservationStore as unknown) as ReturnType<typeof mock>).mockImplementation((selector: (state: { reservations: typeof mockReservations }) => unknown) => {
      const state = {
        reservations: mockReservations,
      };
      return selector(state);
    });

    // useNotificationStoreのモック設定
    const notificationStore = await import('@/stores/notification-store');
    ((notificationStore.useNotificationStore as unknown) as ReturnType<typeof mock>).mockImplementation((selector: (state: {
      notifications: typeof mockNotifications;
      markAsRead: typeof mockMarkAsRead;
      markAllAsRead: typeof mockMarkAllAsRead;
      getUnreadNotifications: typeof mockGetUnreadNotifications;
    }) => unknown) => {
      const state = {
        notifications: mockNotifications,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
        getUnreadNotifications: mockGetUnreadNotifications,
      };
      return selector(state);
    });

    // 未読通知のモック
    mockGetUnreadNotifications.mockReturnValue([mockNotifications[0]]);
  });

  describe('初期状態', () => {
    it('ストアからデータを正しく取得する', () => {
      const { result } = renderHook(() => useAdminDashboard());

      expect(result.current.reservations).toEqual(mockReservations);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.unreadNotifications).toEqual([mockNotifications[0]]);
    });
  });

  describe('統計計算', () => {
    it('統計を正しく計算する', () => {
      const { result } = renderHook(() => useAdminDashboard());

      expect(result.current.stats.total).toBe(2);
      expect(result.current.stats.thisWeek).toBe(1); // 今週は1件
      expect(result.current.stats.mostPopularInterest).toBe('programming');
    });

    it('データが空の場合の統計', async () => {
      // 空のデータでモック
      const reservationStore = await import('@/stores/reservation-store');
      ((reservationStore.useReservationStore as unknown) as ReturnType<typeof mock>).mockImplementation((selector: (state: { reservations: never[] }) => unknown) => {
        const state = { reservations: [] };
        return selector(state);
      });

      const { result } = renderHook(() => useAdminDashboard());

      expect(result.current.stats.total).toBe(0);
      expect(result.current.stats.thisWeek).toBe(0);
      expect(result.current.stats.mostPopularInterest).toBe('N/A');
    });
  });

  describe('通知管理', () => {
    it('通知を既読にマークできる', () => {
      const { result } = renderHook(() => useAdminDashboard());

      act(() => {
        result.current.markNotificationAsRead('1');
      });

      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('全ての通知を既読にマークできる', () => {
      const { result } = renderHook(() => useAdminDashboard());

      act(() => {
        result.current.markAllAsRead();
      });

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe('ページネーション', () => {
    it('ページネーションが正しく動作する', async () => {
      // 多数のデータでテスト
      const manyReservations = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `テスト${i + 1}`,
        email: `test${i + 1}@example.com`,
        interests: ['programming'],
        createdAt: new Date().toISOString(),
      }));

      const reservationStore = await import('@/stores/reservation-store');
      ((reservationStore.useReservationStore as unknown) as ReturnType<typeof mock>).mockImplementation((selector: (state: { reservations: typeof manyReservations }) => unknown) => {
        const state = { reservations: manyReservations };
        return selector(state);
      });

      const { result } = renderHook(() => useAdminDashboard());

      expect(result.current.totalPages).toBe(3); // 25件 ÷ 10件/ページ = 3ページ
      expect(result.current.paginatedReservations).toHaveLength(10);

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedReservations).toHaveLength(10);
    });
  });
});