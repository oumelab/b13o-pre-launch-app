/**
 * ユーザー向けの予約確認メールテンプレートを生成する
 *
 * @param name - 予約者の名前
 * @param interests - 選択された興味のある機能の配列
 * @returns Resend用のメールオブジェクト
 */
export const createConfirmationEmail = (name: string, interests: string[]) => {
  const text = [
  `こんにちは、${name}さん！`,
  "",
  "もくもくReactの事前予約が完了しました。",
  "正式ローンチ時には、以下の機能をいち早く体験していただけます：",
  "",
  ...(interests ?? []).map((i) => `- ${i}`),
  "",
  "ローンチ予定日が近づきましたら、改めてご連絡いたします。",
].join("\n");
  return {
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>予約確認</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .feature { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>もくもくReact</h1>
              <p>事前予約ありがとうございます！</p>
            </div>
            
            <div class="content">
              <h2>こんにちは、${name}さん！</h2>
              <p>もくもくReactの事前予約が完了しました。正式ローンチ時には、以下の機能をいち早く体験していただけます：</p>
              
              ${interests
                .map(
                  (interest) => `
                <div class="feature">
                  <strong>✅ ${interest}</strong>
                </div>
              `
                )
                .join("")}
              
              <p>ローンチ予定日が近づきましたら、改めてご連絡いたします。</p>
            </div>     
            <div class="footer">
              <p>© 2025 もくもくReact Team. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: text,
  };
};

/**
 * 管理者向けの新規予約通知メールテンプレートを生成する
 */
export const createAdminNotification = (
  name: string,
  email: string,
  interests: string[]
) => {
  const text = [
  "もくもくReact - 新規事前予約通知",
  "",
  "予約者情報:",
  `名前: ${name}`,
  `メール: ${email}`,
  `登録日時: ${new Date().toLocaleString("ja-JP")}`,
  "",
  "興味のある機能:",
  ...(interests ?? []).map((i) => `- ${i}`),
].join("\n");
  return {
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #2563eb; color: white; padding: 20px; }
            .content { padding: 20px; background: #f8fafc; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>もくもくReact - 新規事前予約通知</h2>
            </div>
            
            <div class="content">
              <div class="info-box">
                <h3>予約者情報</h3>
                <p><strong>名前:</strong> ${name}</p>
                <p><strong>メール:</strong> ${email}</p>
                <p><strong>登録日時:</strong> ${new Date().toLocaleString(
                  "ja-JP"
                )}</p>
              </div>
              
              <div class="info-box">
                <h3>興味のある機能</h3>
                ${
                  interests.length > 0
                    ? interests
                        .map((interest) => `<p>• ${interest}</p>`)
                        .join("")
                    : "<p>未選択</p>"
                }
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    text: text,
  };
};