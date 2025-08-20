import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";
import {
  createAdminNotification,
  createConfirmationEmail,
} from "./_lib/email-templates";
import {reservationSchema} from "@/lib/schemas";

// Resend API キーを設定
const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * 事前予約を処理するPOSTエンドポイント
 *
 * リクエストボディから予約情報を受け取り、バリデーション後に
 * 確認メールとユーザーへの確認メールを送信します。
 */
export async function POST(request: NextRequest) {
  try {
    // 必要な環境変数が設定されているかチェック
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        {error: "Resend API key is not configured"},
        {status: 500}
      );
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error("RESEND_FROM_EMAIL is not set");
      return NextResponse.json(
        {error: "Resend from email is not configured"},
        {status: 500}
      );
    }

    const body = await request.json();

    // Zodスキーマを使用してリクエストデータを検証
    const validationResult = reservationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        {status: 400}
      );
    }

    const {name, email, interests} = validationResult.data;

    // ユーザー向けの予約確認メールを送信（Resend）
    const {html: userHtml} = createConfirmationEmail(name, interests || []);
    const {error: userError} = await resend.emails.send({
      from: `もくもくReact <${process.env.RESEND_FROM_EMAIL!}>`, // ← Resend検証済みドメインのFromで上書き
      to: email, // ← 宛先はバリデート済みのユーザー
      subject: "🎉 もくもくReact事前予約完了のお知らせ",
      html: userHtml,
    });
    if (userError) throw userError;

    // 管理者向けの通知メールを送信（Resend）
    const {html: adminHtml} = createAdminNotification(
      name,
      email,
      interests || []
    );
    if (process.env.RESEND_ADMIN_EMAIL) {
      const {error: adminError} = await resend.emails.send({
        from: `もくもくReact <${process.env.RESEND_FROM_EMAIL!}>`, // ← 送信元は統一
        to: process.env.RESEND_ADMIN_EMAIL!, // ← 管理者宛先は自由なメールでOK
        subject: `🔔 新規事前予約: ${name}`,
        html: adminHtml,
      });
      if (adminError) console.error(adminError); // 通知失敗は致命でなければログのみ
    }

    return NextResponse.json({
      message: "Reservation successful and confirmation email sent",
      data: {name, email, interests},
    });
  } catch (error) {
    console.error("Email Error:", error);

    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        // 開発環境でのみエラーの詳細を返す
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      {status: 500}
    );
  }
}
