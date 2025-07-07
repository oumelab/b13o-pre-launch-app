import { renderHook, act } from '@testing-library/react'
import { useAdminDashboard } from './use-admin-dashboard'

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
]

const mockNotifications = [
  {
    id: '1',
    type: 'new_reservation' as const,
    message: '新しい事前登録がありました',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'new_reservation' as const,
    message: '新しい事前登録がありました',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
]

describe('useAdminDashboard', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear()
  })

  test('初期状態では空のデータを返す', () => {
    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.reservations).toEqual([])
    expect(result.current.notifications).toEqual([])
    expect(result.current.stats.total).toBe(0)
    expect(result.current.stats.thisWeek).toBe(0)
    expect(result.current.stats.mostPopularInterest).toBe('N/A')
  })

  test('LocalStorageからデータを読み込む', () => {
    // LocalStorageにモックデータを設定
    localStorage.setItem('reservations', JSON.stringify(mockReservations))
    localStorage.setItem('notifications', JSON.stringify(mockNotifications))

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.reservations).toEqual(mockReservations)
    expect(result.current.notifications).toEqual(mockNotifications)
  })

  test('統計を正しく計算する', () => {
    localStorage.setItem('reservations', JSON.stringify(mockReservations))

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.stats.total).toBe(2)
    expect(result.current.stats.thisWeek).toBe(1) // 今週は1件
    expect(result.current.stats.mostPopularInterest).toBe('programming')
  })

  test('通知を既読にマークできる', () => {
    localStorage.setItem('notifications', JSON.stringify(mockNotifications))

    const { result } = renderHook(() => useAdminDashboard())

    act(() => {
      result.current.markNotificationAsRead('1')
    })

    const updatedNotification = result.current.notifications.find(n => n.id === '1')
    expect(updatedNotification?.isRead).toBe(true)
  })

  test('全ての通知を既読にマークできる', () => {
    localStorage.setItem('notifications', JSON.stringify(mockNotifications))

    const { result } = renderHook(() => useAdminDashboard())

    act(() => {
      result.current.markAllAsRead()
    })

    const allRead = result.current.notifications.every(n => n.isRead)
    expect(allRead).toBe(true)
  })

  test('ページネーションが正しく動作する', () => {
    const manyReservations = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `テスト${i + 1}`,
      email: `test${i + 1}@example.com`,
      interests: ['programming'],
      createdAt: new Date().toISOString(),
    }))

    localStorage.setItem('reservations', JSON.stringify(manyReservations))

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.totalPages).toBe(3) // 25件 ÷ 10件/ページ = 3ページ
    expect(result.current.paginatedReservations).toHaveLength(10)

    act(() => {
      result.current.setCurrentPage(2)
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedReservations).toHaveLength(10)
  })

  test('未読通知をフィルタリングできる', () => {
    localStorage.setItem('notifications', JSON.stringify(mockNotifications))

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.unreadNotifications).toHaveLength(1)
    expect(result.current.unreadNotifications[0].id).toBe('1')
  })
})