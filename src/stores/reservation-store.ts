import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reservation } from '@/lib/types';

interface ReservationState {
  reservations: Reservation[];
}

interface ReservationActions {
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getReservationById: (id: string) => Reservation | undefined;
}

type ReservationStore = ReservationState & ReservationActions;

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      reservations: [],

      // 予約追加
      addReservation: (reservation) => set((state) => ({
        reservations: [
          ...state.reservations,
          {
            ...reservation,
            id: Date.now().toString(),
          },
        ],
      })),

      // 予約更新
      updateReservation: (id, updates) => set((state) => ({
        reservations: state.reservations.map((reservation) =>
          reservation.id === id 
            ? { ...reservation, ...updates }
            : reservation
        ),
      })),

      // 予約削除
      deleteReservation: (id) => set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
      })),

      // 予約取得（管理画面の詳細表示などで将来使用される可能性）
      getReservationById: (id) => {
        const { reservations } = get();
        return reservations.find((r) => r.id === id);
      },

      // 予約数を取得
    }),
    {
      name: 'reservations', // 👈 元のキー名を維持
    }
  )
);