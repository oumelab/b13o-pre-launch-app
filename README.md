# Bluberry Mojito 学習プロジェクト - プロダクト事前予約アプリ -

架空の新サービス「もくもく React」の事前予約サイトを Next.js + SendGrid で構築する、<br />
React 学習コミュニティ [Blueberry Mojito](https://b13o.com/) の学習プロジェクトです。<br />
<br />
課題の実装の他、個人的な学習目的で私が行った変更や追加機能が含まれています。<br />

> [!NOTE]
> このリポジトリは、個人的な学習およびデモンストレーションの目的のみに使用されます。<br />
> This repository is for personal learning and demonstration purposes only.

<br />

## デモ

[https://app1.oumelab.com/](https://app1.oumelab.com/)

<br />

## 主な機能

1. **プロダクト紹介ページ**： 
    - もくもく React の特徴を表示するランディングページ
2. **事前予約フォーム**： 
    - 名前、メールアドレス、興味のある機能を入力できる。
    - 新規予約の通知を管理者に送信する。
3. **メール送信機能**：
    - 予約確認メールを予約者に送信する。
4. **予約管理画面**： 
    - 予約者の一覧と予約数を表示

<br />

## 追加で実装した機能, 変更点

### 実装済みの機能, 変更点
- [x] **予約フォームのカスタムフック化** - フォームのロジックをカスタムフックに移動
- [x] **テスト** - Bun と React Testing Library を使用したテスト
- [x] **Zustand導入** - 状態管理ライブラリ
- [x] **フォーム送信時の通知を変更** - Toast通知 → ヘッダー下にバナー表示
- [x] **デプロイ** - AWS Amplify Hosting

### 実装予定の機能
- [ ] SendGrid → Resend への変更 [#1](https://github.com/oumelab/b13o-pre-launch-app/issues/1)
- [ ] 管理者の認証機能 [#2](https://github.com/oumelab/b13o-pre-launch-app/issues/2)
- [ ] データベースの導入

<br />

## 使用技術
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- SendGrid
- Zustand
- Bun Test runner + React Testing Library
