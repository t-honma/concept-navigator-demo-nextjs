import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function buildRefinePrompt(payload: { concept: string; description: string; instruction: string; answers?: string[] }) {
  const { concept, description, instruction, answers } = payload;
  const answersBlock = (answers && answers.length > 0)
    ? `# 参考：ユーザーの回答抜粋
${answers.map((a, i)=>`${i+1}. ${a}`).join("\n")}`
    : "";

  return `あなたは「コンセプト作成ナビゲーター」です。以下のコンセプト文を、追加指示に従ってリライトしてください。

# 元のコンセプト
Concept: ${concept}
Description: ${description}

${answersBlock}

# 追加指示
${instruction}

# 制約
- キャッチコピーではなく、実務の指針となる旗印として具体的に。
- 抽象語で逃げない。可能なら主語は「人（顧客/私たち）」で表現。
- 出力は次のJSON形式のみ：
{
  "concept": "20〜30文字",
  "description": "50〜80文字"
}
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const prompt = buildRefinePrompt(payload);

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
          { role: "system", content: "You are a helpful Japanese business strategist and concept refiner." },
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
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 });
  }
}
