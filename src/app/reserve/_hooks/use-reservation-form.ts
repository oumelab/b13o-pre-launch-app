import { useReservationStore } from '@/stores/reservation-store';
import { useNotificationStore } from '@/stores/notification-store';
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {
  reservationSchema,
  type ReservationFormData,
  interestOptions,
} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useCallback, useState} from "react";

export default function useReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Zustandストアからアクションを取得
  const addReservation = useReservationStore(state => state.addReservation);
  const addNotification = useNotificationStore(state => state.addNotification);

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
  const onSubmit = useCallback(async (data: ReservationFormData)=> {
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit reservation");
      }

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


      // 成功処理
      toast.success("登録完了！", {
        description: "事前登録が完了しました。確認メールをご確認ください。",
      });

      reset();
      router.push("/confirmation");

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("エラー", {
        description: "登録中にエラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, addReservation, reset, router]);

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
