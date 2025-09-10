# Concept Navigator – ver2.0（リライト指示対応）

**新機能（ver2.0）**
- 生成された各コンセプトの下に「追加指示」欄を追加
- ユーザーの指示に従って、その案を再生成できる
- よく使う指示テンプレ（例ボタン）を用意

## 使い方
1. 13問に回答して「コンセプト案（3案）を生成する」
2. 各カード下の「追加指示」欄に書く（または例ボタンをクリック）
3. 「この案を再生成する」を押す → そのカードが置き換わります

## API
- 新規: `POST /api/refine`
  - body: `{ concept, description, instruction, answers }`
  - 返却: `{ text }`（JSON文字列に concept / description を含む）

> 既存の `/api/generate` はそのまま利用可能（ver1.4の構成）。

## デプロイ
- Vercel 推奨。`OPENAI_API_KEY` を環境変数に設定してください。
