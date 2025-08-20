import {
  interestOptions,
  reservationSchema,
  type ReservationFormData,
} from "@/lib/schemas";
import { useNotificationStore } from '@/stores/notification-store';
import { useReservationStore } from '@/stores/reservation-store';
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotificationBanner } from '../../hooks/use-notification-banner';

export default function useReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Zustandストアからアクションを取得
  const addReservation = useReservationStore(state => state.addReservation);
  const addNotification = useNotificationStore(state => state.addNotification);

  // バナー通知フック
  const { showSuccess, showError } = useNotificationBanner();

  // React Hook Formでフォーム管理とバリデーションを設定
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      interests: [],
    },
  });

  const selectedInterests = watch("interests") || [];

  /**
   * 興味のあるサービスの選択状態を管理する
   *
   * @param interestId - 興味カテゴリのID
   * @param checked - チェック状態
   */
  const handleInterestChange = (interestId: string, checked: boolean) => {
    const currentInterests = selectedInterests;
    const newInterests = checked
      ? [...currentInterests, interestId]
      : currentInterests.filter((id) => id !== interestId);
    setValue("interests", newInterests);
  };

  /**
   * フォーム送信処理
   *
   * APIエンドポイントへのデータ送信、ローカルストレージへの保存、
   * 管理画面用の通知データ作成を行います。
   */
  const onSubmit = async (data: ReservationFormData)=> {
    setIsLoading(true);

    try {
     
      // 予約APIエンドポイントにデータを送信
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // エラー処理
        let errorMessage = 'サーバーエラーが発生しました';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // API がエラーメッセージを返さない場合
          if (response.status === 400) {
            errorMessage = 'リクエストに問題があります';
          } else if (response.status === 500) {
            errorMessage = 'サーバーで問題が発生しました';
          }
        }
        
        showError('登録に失敗しました', errorMessage);
        return;
      }

      // 成功時の処理
      // Zustandストアに保存（LocalStorageは自動的に同期される）
      addReservation({
        ...data,
        createdAt: new Date().toISOString(),
      });

      addNotification({
        type: "new_registration",
        title: "新規登録",
        message: `${data.name}さんが事前登録しました`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });


      // 成功バナーを表示
      showSuccess(
        '登録が完了しました！',
        '確認メールをご確認ください',
      );

      reset();

      // 少し遅延してページ遷移（ユーザーが通知を見る時間を確保）
      setTimeout(() => {
        router.push("/confirmation");
      }, 500);

    } catch (error) {
      console.error("Submission error:", error);

      // ネットワークエラーバナーを表示
      if (error instanceof TypeError && error.message.includes('fetch')) {
      // ネットワークエラー（fetch自体が失敗）
      showError(
        'ネットワークエラー',
        'インターネット接続を確認してください'
      );
    } else {
      // その他のエラー
        showError(
          '予期しないエラー',
          '時間をおいて再度お試しください'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    register,
    handleSubmit,
    errors,
    handleInterestChange,
    selectedInterests,
    interestOptions,
    onSubmit,
  };
}
