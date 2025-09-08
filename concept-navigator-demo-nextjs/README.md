# Concept Navigator – 13 Questions Demo (Next.js)

改修版:
- Step0 をフローに統合し、全13問に。
- 入力欄は Enter で送信されず、「保存して進む」ボタンでのみ進行。
- 出力は JSONではなく、カード風に Concept & Description を整形表示。

---

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
