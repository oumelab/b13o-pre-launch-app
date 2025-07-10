"use client";

import { interestOptions } from "@/lib/schemas";
import { Reservation } from "@/lib/types";
import { useNotificationStore } from '@/stores/notification-store';
import { useReservationStore } from "@/stores/reservation-store";
import { useState } from "react";
/**
 * 興味カテゴリIDから表示用ラベルを取得する
 */
const getInterestLabel = (interestId: string): string => {
  const option = interestOptions.find((opt) => opt.id === interestId);
  return option ? option.label : interestId;
};

/**
 * ダッシュボード統計を計算する
 *
 * 登録データから総数、今週の登録数、最も人気の興味分野を算出します。
 */
const calculateStats = (reservations: Reservation[]) => {
  const total = reservations.length;

  // 今週の登録数を計算（過去7日間）
  const thisWeek = reservations.filter((r) => {
    const date = new Date(r.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;

  // 最も人気の興味分野を集計・算出
  const mostPopularInterest =
    Object.entries(
      reservations.reduce((acc, r) => {
        r.interests.forEach((f) => {
          acc[f] = (acc[f] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {total, thisWeek, mostPopularInterest};
};

/**
 * 管理画面ダッシュボード機能フック
 *
 * 事前登録データの管理、統計情報の計算、通知機能、ページネーション機能を
 * 統合的に提供します。データはLocalStorageを使用してクライアントサイドで
 * 保持されます。
 */

export const useAdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 予約ストアから取得
  const reservations = useReservationStore(state => state.reservations);

  // 通知ストアから取得
  const notifications = useNotificationStore(state => state.notifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const getUnreadNotifications = useNotificationStore(state => state.getUnreadNotifications);


  // ページネーション計算：パフォーマンスを考慮して表示件数を制限
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats = calculateStats(reservations);
  const unreadNotifications = getUnreadNotifications();

  return {
    // 予約データ
    reservations,
    paginatedReservations,
    stats,

    // 通知データ
    notifications,
    unreadNotifications,

    // ページネーション
    currentPage,
    totalPages,
    setCurrentPage,

    // アクション
    markNotificationAsRead: markAsRead,
    markAllAsRead,

    // ユーティリティ
    getInterestLabel,
  };
};
