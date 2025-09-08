
"use client";

import { useState } from "react";

const QUESTIONS = [
  // Step0 (6 questions)
  "サービス名は何ですか？",
  "URLは？",
  "競合サービスやURLは？",
  "口コミ・評価の要点は？",
  "ビジネスゴールは？（例：予約数増加、会員獲得など）",
  "想定ターゲットは？（例：30代マーケ担当、個人事業主など）",
  // Step1〜5 (7 questions)
  "このサービスは一言でいうと何ですか？",
  "顧客はどんな場面で助かり、もし無かったら何に困りますか？",
  "顧客が「このサービスでよかった」と感じる瞬間はどんな時ですか？",
  "競合と比べて、ここが違う／自分たちだけの強みは何ですか？",
  "顧客にどんな未来を感じてもらいたいですか？",
  "5年後に大成功したとしたら、サービスと社会はどう変わっていますか？",
  "ここまでの答えを踏まえて、サービスの旗印を表す言葉の素材を挙げるなら？（キーワードでもOK）"
];

export default function Page() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canNext = input.trim().length > 0;

  function handleNext() {
    if (!canNext) return;
    const nextAnswers = [...answers];
    nextAnswers[current] = input.trim();
    setAnswers(nextAnswers);
    setInput("");
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let parsed = null;
      try {
        parsed = JSON.parse(data.text);
      } catch {
        parsed = null;
      }
      if (parsed && parsed.concepts) {
        setResult(parsed);
      } else {
        setResult({ raw: data.text });
      }
    } catch (e: any) {
      setError(e?.message || "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = answers.length === QUESTIONS.length && answers.every(a => a && a.length > 0);

  return (
    <div className="container">
      <h1>Concept Navigator – 13 Questions Demo</h1>
      <p className="small">全13問に答えると、最後にAIが「旗印（3案）」を生成します。</p>

      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h3>質問 {current+1} / {QUESTIONS.length}</h3>
        </div>

        <div className="card" style={{marginBottom: 12}}>
          <div className="small" style={{marginBottom: 6}}>質問</div>
          <div>{QUESTIONS[current]}</div>
        </div>

        <textarea
          placeholder="ここに回答を入力...（できるだけ具体的に）"
          value={input}
          onChange={e=>setInput(e.target.value)}
        />

        <div style={{display:"flex", gap:8, marginTop:12}}>
          <button onClick={handleNext} disabled={!canNext}>保存して進む</button>
        </div>

        <hr/>

        <h4>これまでの回答</h4>
        <ul className="clean">
          {answers.map((a, i) => (
            <li key={i}><span className="small">Q{i+1}:</span> {a}</li>
          ))}
        </ul>

        <div style={{marginTop:12, display:"flex", gap:8}}>
          <button onClick={handleGenerate} className="primary" disabled={!allAnswered || loading}>
            {loading ? "生成中..." : "最終出力を生成（3案）"}
          </button>
          {!allAnswered && <span className="small">※全問回答すると有効になります</span>}
        </div>

        {error && <div style={{marginTop:12, color:"#fca5a5"}}>エラー: {error}</div>}
        {result && (
          <div style={{marginTop:12}}>
            <h4>生成結果</h4>
            {result.concepts ? (
              <div className="row">
                {result.concepts.map((c:any, idx:number) => (
                  <div key={idx} className="card" style={{flex:"1 1 280px"}}>
                    <h5>{idx+1}. {c.concept}</h5>
                    <p>{c.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="code">{result.raw}</div>
            )}
          </div>
        )}
      </div>

      <footer>
        コンセプト作成ナビゲーター（デモ v2）／Next.js + Edge API。OPENAI_API_KEY を .env に設定してご利用ください。
      </footer>
    </div>
  );
}
