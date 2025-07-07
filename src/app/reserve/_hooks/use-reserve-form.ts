import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  reservationSchema,
  type ReservationFormData,
  interestOptions,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function useReserveForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // React Hook Formでフォーム管理とバリデーションを設定
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
  const onSubmit = async (data: ReservationFormData) => {
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

      // 管理画面での表示用にローカルストレージに予約データを保存
      const reservations = JSON.parse(
        localStorage.getItem("reservations") || "[]"
      );
      const newReservation = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      reservations.push(newReservation);
      localStorage.setItem("reservations", JSON.stringify(reservations));

      // 管理画面の通知用データも作成・保存
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      const newNotification = {
        id: Date.now().toString(),
        type: "new_registration",
        title: "新規登録",
        message: `${data.name}さんが事前登録しました`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(newNotification); // 新しい通知を先頭に追加
      localStorage.setItem("notifications", JSON.stringify(notifications));

      toast.success("登録完了！", {
        description: "事前登録が完了しました。確認メールをご確認ください。",
      });

      router.push("/confirmation");

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("エラー", {
        description: "登録中にエラーが発生しました。もう一度お試しください。",
      });
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