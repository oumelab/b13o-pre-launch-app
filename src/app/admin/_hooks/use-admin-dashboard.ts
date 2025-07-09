"use client";

import {useState, useEffect} from "react";
import {Notification, Reservation} from "@/lib/types";
import {interestOptions} from "@/lib/schemas";

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 初期データ読み込み：LocalStorageから保存されたデータを取得
  useEffect(() => {
    const loadData = () => {
      const reservationsData = localStorage.getItem("reservations");
      if (reservationsData) {
        setReservations(JSON.parse(reservationsData));
      }

      const notificationsData = localStorage.getItem("notifications");
      if (notificationsData) {
        setNotifications(JSON.parse(notificationsData));
      }
    };

    // マウント時にデータを読み込む
    loadData();

    // LocalStorage変更イベントをリッスン（他のページ・コンポーネントからの変更を検知）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "reservations" || event.key === "notifications") {
        loadData();
      }
    };

    // カスタムイベントをリッスン（同一ページ内での変更を検知）
    const handleCustomStorageChange = () => {
      loadData();
    };

    // イベントリスナーを設定
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleCustomStorageChange);

    // クリーンアップ：イベントリスナーを解除
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdate", handleCustomStorageChange);
    };
  }, []);

  /**
   * 特定の通知を既読にマークする
   */
  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? {...notification, isRead: true}
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    // カスタムイベントを発火
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  /**
   * 全ての通知を既読にマークする
   */
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    // カスタムイベントを発火
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  // ページネーション計算：パフォーマンスを考慮して表示件数を制限
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats = calculateStats(reservations);
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return {
    // データ
    reservations,
    notifications,
    paginatedReservations,
    stats,
    unreadNotifications,

    // ページネーション
    currentPage,
    totalPages,
    setCurrentPage,

    // アクション
    markNotificationAsRead,
    markAllAsRead,

    // ユーティリティ
    getInterestLabel,
  };
};
