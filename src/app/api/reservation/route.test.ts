import {describe, it, expect, mock, beforeAll, beforeEach} from "bun:test";
import {NextRequest} from "next/server";

// テストケースの説明
// テストしていること:
// - 正常入力 → HTTP 200 を返す。
// - 異常入力（バリデーションNG） → HTTP 400 を返す。
// - 正常時に resend.emails.send() が呼ばれる（実送信はしないが、呼び出しの事実は検証）
// - 異常時は send() が 呼ばれない。

// まだテストしていないこと:
// - 送信に渡す 引数の中身（to/from/subject/html）の厳密さ。
// - テンプレートの HTML/テキストの内容そのもの。
// - 送信失敗（resend 側がエラーを返す）時の 500系ハンドリング。
// - 環境変数不足時に 500 を返す分岐（今はAPIキー等を beforeAll でセットして通している）

/**
 * 1) Resend を import 前にモック（APIキー不要・実送信なし）
 *    - constructor の引数は削除（未使用警告を避ける）
 */
const sendMock = mock().mockResolvedValue({data: {id: "t1"}, error: null});

mock.module("resend", () => ({
  Resend: class {
    emails = {send: sendMock};
    // constructor(_key?: string) {} // APIキーは無視
    constructor() {}
  },
}));

/**
 * 2) ハンドラが参照する環境変数（APIキーも含めて設定）
 */
beforeAll(() => {
  process.env.RESEND_API_KEY = "test_key";
  process.env.RESEND_FROM_EMAIL = "noreply@update.xxx.com";
  process.env.RESEND_ADMIN_EMAIL = "admin@example.com";
});

/**
 * 3) モックが効いた状態で route.ts を読み込む
 */
const {POST} = await import("./route");

beforeEach(() => {
  sendMock.mockReset().mockResolvedValue({data: {id: "t1"}, error: null});
});

describe("POST /api/reservation (smoke)", () => {
  it("valid request → 200 & send() 呼び出しあり", async () => {
    const body = {
      name: "田中太郎",
      email: "taro@example.com",
      interests: ["react"],
    };

    const req = new NextRequest("http://localhost/api/reservation", {
      method: "POST",
      headers: new Headers({"content-type": "application/json"}),
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // expect(sendMock).toHaveBeenCalled();

    // send が 2 回呼ばれている（ユーザー宛 + 管理者宛）
    expect(sendMock).toHaveBeenCalledTimes(2);

    // --- ここから追記するアサーション ---
    // 1通目（ユーザー宛）
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      to: body.email,
      from: expect.stringContaining(process.env.RESEND_FROM_EMAIL!),
      subject: expect.any(String),
      html: expect.stringContaining(body.name),
    });

    // 2通目（管理者宛）
    expect(sendMock.mock.calls[1][0]).toMatchObject({
      to: process.env.RESEND_ADMIN_EMAIL,
      from: expect.stringContaining(process.env.RESEND_FROM_EMAIL!),
      subject: expect.any(String),
      html: expect.stringContaining(body.email),
    });
  });

  it("invalid request → 400 & send() は呼ばれない", async () => {
    const badBody = JSON.stringify({name: "", email: "bad", interests: []});

    const badReq = new NextRequest("http://localhost/api/reservation", {
      method: "POST",
      headers: new Headers({"content-type": "application/json"}),
      body: badBody,
    });

    const res = await POST(badReq);
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
