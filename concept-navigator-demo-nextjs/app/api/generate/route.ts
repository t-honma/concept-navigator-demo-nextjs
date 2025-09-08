
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function buildPrompt(payload: { context: any; answers: string[] }) {
  const { context, answers } = payload;
  const ctx = `
# Step0（任意・前提）
- サービス名: ${context?.serviceName || "-"}
- URL: ${context?.serviceUrl || "-"}
- 競合: ${context?.competitors || "-"}
- 口コミ/評価の要点: ${context?.reviews || "-"}
- ビジネスゴール: ${context?.businessGoal || "-"}
- 想定ターゲット: ${context?.target || "-"}

# 回答（7問）
1. ${answers[0] || "-"}
2. ${answers[1] || "-"}
3. ${answers[2] || "-"}
4. ${answers[3] || "-"}
5. ${answers[4] || "-"}
6. ${answers[5] || "-"}
7. ${answers[6] || "-"}
`.trim();

  const instruction = `あなたは「コンセプト作成ナビゲーター」です。以下の要件で最終出力のみを返してください。

# Step5：旗印の言葉（最終出力）
上記の回答すべてを踏まえて、以下を3案出してください。
- Concept（20〜30文字）：キャッチコピーではなく、実務の指針となる旗印。抽象語で逃げず、具体的な方向が伝わるように。
- Description（50〜80文字）：Conceptの意味と使いどころを、誰にでも伝わる言葉で補足。

# 注意
- 絶対にキャッチコピーに逃げないこと（形容詞だけで終わらせない）
- 可能なら主語は「人（顧客/私たち）」で表現
- 出力は次のJSON形式のみで返す：
{
  "concepts": [
    { "concept": "20〜30文字", "description": "50〜80文字" },
    { "concept": "20〜30文字", "description": "50〜80文字" },
    { "concept": "20〜30文字", "description": "50〜80文字" }
  ]
}
`.trim();

  return `【前提と回答】\n${ctx}\n\n【指示】\n${instruction}`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const prompt = buildPrompt(payload);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful Japanese business strategist and concept navigator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6
      })
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: "OpenAI API error", detail: t }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    let jsonOut: any = null;
    try {
      // Try to parse JSON block if provided
      const match = text.match(/\{[\s\S]*\}/);
      if (match) jsonOut = JSON.parse(match[0]);
    } catch (e) {
      // ignore parse error
    }

    if (jsonOut?.concepts) {
      const pretty = JSON.stringify(jsonOut, null, 2);
      return NextResponse.json({ text: pretty });
    } else {
      // Fallback: just return raw text
      return NextResponse.json({ text });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 });
  }
}
