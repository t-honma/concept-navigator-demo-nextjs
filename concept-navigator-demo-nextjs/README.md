# Concept Navigator – 7 Questions Demo (Next.js)

デモ：固定 7 質問 → 回答をまとめて OpenAI に投げ、Concept & Description（3案）を JSON で返します。

## セットアップ

```bash
npm i
# or: pnpm i / yarn
```

`.env` をプロジェクト直下に作成：

```
OPENAI_API_KEY=sk-...
```

## 実行

```bash
npm run dev
```

http://localhost:3000 を開いてください。

## デプロイ

- Vercel を推奨（Edge Runtime 対応）。
- Project Settings → Environment Variables に `OPENAI_API_KEY` を追加。

## カスタマイズ

- `app/api/generate/route.ts` の `model` をお好みのものに変更可。
- プロンプト（最終出力形式）は `buildPrompt` で組み立てています。
- UI の質問文は `app/page.tsx` の `QUESTIONS` 配列を編集。

---

© Concept Navigator Demo
