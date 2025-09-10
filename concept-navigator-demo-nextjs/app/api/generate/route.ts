import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const prompt = `
あなたは「コンセプト作成ナビゲーター」です。
以下の回答をもとに、Concept（20〜30文字）とDescription（50〜80文字）を3案生成してください。

回答一覧:
${answers.map((a: string, i: number) => `${i+1}. ${a}`).join("\n")}

# 出力形式
{
  "concepts": [
    { "concept": "...", "description": "..." },
    { "concept": "...", "description": "..." },
    { "concept": "...", "description": "..." }
  ]
}
`.trim();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6
      })
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "OpenAI API error", detail: text }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 });
  }
}
