# Concept Navigator – 13 Questions Demo v3 (Next.js)

改修内容:
- 最後の質問に答えると「保存して進む」ボタンが消え、代わりに「質問はすべて解答しました。」を表示。
- その時点で初めて「コンセプト案（3案）を生成する」ボタンが出現。
- それ以外の挙動は v2 と同じ。

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
