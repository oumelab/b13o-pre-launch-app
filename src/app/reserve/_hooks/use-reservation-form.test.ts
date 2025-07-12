import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { useRouter } from "next/navigation";
import useReservationForm from "./use-reservation-form";

// Next.js router のモック
mock.module("next/navigation", () => ({
  useRouter: mock(() => ({
    push: mock(),
    back: mock(),
    forward: mock(),
    refresh: mock(),
    replace: mock(),
    prefetch: mock(),
  })),
}));

// react-hook-form のモック
mock.module("react-hook-form", () => ({
  useForm: mock(() => ({
    register: mock(),
    handleSubmit: mock((fn) => fn),
    formState: {errors: {}},
    setValue: mock(),
    watch: mock(() => []),
    reset: mock(),
  })),
}));

// zod resolver のモック
mock.module("@hookform/resolvers/zod", () => ({
  zodResolver: mock(() => ({})),
}));

// schemas のモック
mock.module("@/lib/schemas", () => ({
  reservationSchema: {},
  interestOptions: [
    {id: "react", label: "React"},
    {id: "typescript", label: "TypeScript"},
  ],
}));

// Zustandストアのモック
mock.module("@/stores/reservation-store", () => ({
  useReservationStore: mock(),
}));

mock.module("@/stores/notification-store", () => ({
  useNotificationStore: mock(),
}));

// バナー通知フックのモック
mock.module("../../hooks/use-notification-banner", () => ({
  useNotificationBanner: mock(),
}));

// fetch API のモック
const mockFetch = mock();
global.fetch = mockFetch as unknown as typeof fetch;

describe("useReservationForm", () => {
  const mockPush = mock();
  const mockAddReservation = mock();
  const mockAddNotification = mock();
  const mockShowSuccess = mock();
  const mockShowError = mock();

  beforeEach(async () => {
    // すべてのモックをリセット
    mockFetch.mockReset();
    mockPush.mockReset();
    mockAddReservation.mockReset();
    mockAddNotification.mockReset();
    mockShowSuccess.mockReset();
    mockShowError.mockReset();

    // useRouter のモック設定
    (useRouter as ReturnType<typeof mock>).mockReturnValue({
      push: mockPush,
    });

    // Zustandストアのモック設定
    const reservationStore = await import("@/stores/reservation-store");
    (
      reservationStore.useReservationStore as unknown as ReturnType<typeof mock>
    ).mockImplementation(
      (
        selector: (state: {
          addReservation: typeof mockAddReservation;
        }) => unknown
      ) => {
        const state = {
          addReservation: mockAddReservation,
        };
        return selector(state);
      }
    );

    const notificationStore = await import("@/stores/notification-store");
    (
      notificationStore.useNotificationStore as unknown as ReturnType<
        typeof mock
      >
    ).mockImplementation(
      (
        selector: (state: {
          addNotification: typeof mockAddNotification;
        }) => unknown
      ) => {
        const state = {
          addNotification: mockAddNotification,
        };
        return selector(state);
      }
    );

    // バナー通知フックのモック設定
    const notificationBannerHook = await import(
      "../../hooks/use-notification-banner"
    );
    (
      notificationBannerHook.useNotificationBanner as unknown as ReturnType<
        typeof mock
      >
    ).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });
  });

  describe("初期状態", () => {
    it("正しい初期値を返す", () => {
      const {result} = renderHook(() => useReservationForm());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.selectedInterests).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(typeof result.current.register).toBe("function");
      expect(typeof result.current.handleSubmit).toBe("function");
      expect(typeof result.current.onSubmit).toBe("function");
      expect(typeof result.current.handleInterestChange).toBe("function");
      expect(Array.isArray(result.current.interestOptions)).toBe(true);
    });
  });

  describe("onSubmit - 成功ケース", () => {
    const mockFormData = {
      name: "田中太郎",
      email: "tanaka@example.com",
      interests: ["react", "typescript"],
    };

    beforeEach(() => {
      // fetch API の成功レスポンスをモック
      mockFetch.mockResolvedValue({
        ok: true,
        json: mock().mockResolvedValue({success: true}),
      });
    });

    it("正常にフォーム送信ができる", async () => {
      const {result} = renderHook(() => useReservationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      // API呼び出しの確認
      expect(mockFetch).toHaveBeenCalledWith("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockFormData),
      });

      // Zustandストアへの保存確認
      expect(mockAddReservation).toHaveBeenCalledWith({
        ...mockFormData,
        createdAt: expect.any(String),
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: "new_registration",
        title: "新規登録",
        message: `${mockFormData.name}さんが事前登録しました`,
        isRead: false,
        createdAt: expect.any(String),
      });

      // 成功バナーの表示確認
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "登録が完了しました！",
        "確認メールをご確認ください"
      );

      // ページ遷移の確認（setTimeout があるので少し待つ）
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith("/confirmation");
        },
        {timeout: 2100}
      );

      // ローディング状態が終了していることを確認
      expect(result.current.isLoading).toBe(false);
    });

    it("送信中はローディング状態になる", async () => {
      const {result} = renderHook(() => useReservationForm());

      // 遅延するPromiseでAPI応答をモック
      let resolvePromise: (value: unknown) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValue(delayedPromise);

      // 非同期で送信開始
      act(() => {
        result.current.onSubmit(mockFormData);
      });

      // 短い遅延後にローディング状態を確認
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Promise を解決
      act(() => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({success: true}),
        });
      });

      // 送信完了を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("onSubmit - エラーケース", () => {
    const mockFormData = {
      name: "田中太郎",
      email: "tanaka@example.com",
      interests: ["react"],
    };
    it("API エラー時にエラーバナーを表示する", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: mock().mockResolvedValue({
          error: "メールアドレスが既に登録されています",
        }),
      });

      const {result} = renderHook(() => useReservationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

       // エラーバナーの表示確認
      expect(mockShowError).toHaveBeenCalledWith(
        '登録に失敗しました',
        'メールアドレスが既に登録されています'
      );

      // ストアに保存されていないことを確認
      expect(mockAddReservation).not.toHaveBeenCalled();
      expect(mockAddNotification).not.toHaveBeenCalled();

      // ページ遷移していないことを確認
      expect(mockPush).not.toHaveBeenCalled();
    });

     it('500エラー時に適切なエラーメッセージを表示する', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: mock().mockRejectedValue(new Error('Parse error')), // JSON解析エラー
      });

      const { result } = renderHook(() => useReservationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      // 500エラー用のメッセージが表示されることを確認
      expect(mockShowError).toHaveBeenCalledWith(
        '登録に失敗しました',
        'サーバーで問題が発生しました'
      );
    });

    it('ネットワークエラー時にエラーバナーを表示する', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const { result } = renderHook(() => useReservationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      // ネットワークエラーバナーの表示確認
      expect(mockShowError).toHaveBeenCalledWith(
        'ネットワークエラー',
        'インターネット接続を確認してください'
      );

      // ストアに保存されていないことを確認
      expect(mockAddReservation).not.toHaveBeenCalled();
      expect(mockAddNotification).not.toHaveBeenCalled();
    });
  it('予期しないエラー時にエラーバナーを表示する', async () => {
      mockFetch.mockRejectedValue(new Error('Unknown error'));

      const { result } = renderHook(() => useReservationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      // 予期しないエラーバナーの表示確認
      expect(mockShowError).toHaveBeenCalledWith(
        '予期しないエラー',
        '時間をおいて再度お試しください'
      );
    });
  });
});