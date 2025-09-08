# Concept Navigator – 13 Questions Demo v4 (Next.js)

改修内容:
- 最後の質問を保存したら「保存して進む」ボタンが消える。
- 「質問はすべて解答しました。」と表示。
- その時点で初めて「コンセプト案（3案）を生成する」ボタンが表示。

## セットアップ

```bash
npm i
```

`.env` に APIキーを設定:

```
OPENAI_API_KEY=sk-...
```

## 実行

```bash
npm run dev
```

## デプロイ

Vercel推奨。環境変数に OPENAI_API_KEY を設定してください。
