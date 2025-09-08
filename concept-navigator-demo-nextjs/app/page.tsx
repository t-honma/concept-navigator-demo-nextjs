
"use client";

import { useState } from "react";

type Context = {
  serviceName?: string;
  serviceUrl?: string;
  competitors?: string;
  reviews?: string;
  businessGoal?: string;
  target?: string;
};

const QUESTIONS = [
  "このサービスは一言でいうと何ですか？",
  "顧客はどんな場面で助かり、もし無かったら何に困りますか？",
  "顧客が「このサービスでよかった」と感じる瞬間はどんな時ですか？",
  "競合と比べて、ここが違う／自分たちだけの強みは何ですか？",
  "顧客にどんな未来を感じてもらいたいですか？",
  "5年後に大成功したとしたら、サービスと社会はどう変わっていますか？",
  "ここまでの答えを踏まえて、サービスの旗印を表す言葉の素材を挙げるなら？（キーワードでもOK）"
];

export default function Page() {
  const [context, setContext] = useState<Context>({});
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canNext = input.trim().length > 0;

  function updateContext<K extends keyof Context>(key: K, val: string) {
    setContext(prev => ({ ...prev, [key]: val }));
  }

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
        body: JSON.stringify({ context, answers })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data.text);
    } catch (e: any) {
      setError(e?.message || "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = answers.length === QUESTIONS.length && answers.every(a => a && a.length > 0);

  return (
    <div className="container">
      <h1>Concept Navigator – 7 Questions Demo</h1>
      <p className="small">固定質問を1つずつ入力 → 最後にAIが「旗印（3案）」を生成します。</p>

      <div className="row">
        <div className="card" style={{flex: "1 1 420px"}}>
          <h3>Step0（任意）前提の共有</h3>
          <div className="row">
            <div style={{flex:"1 1 240px"}}>
              <label className="small">サービス名</label>
              <input className="input" placeholder="例：Concept Maker" value={context.serviceName || ""} onChange={e=>updateContext("serviceName", e.target.value)} />
            </div>
            <div style={{flex:"1 1 240px"}}>
              <label className="small">URL</label>
              <input className="input" placeholder="https://example.com" value={context.serviceUrl || ""} onChange={e=>updateContext("serviceUrl", e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div style={{flex:"1 1 240px"}}>
              <label className="small">競合（URL可）</label>
              <input className="input" placeholder="例：Competitor A, https://..." value={context.competitors || ""} onChange={e=>updateContext("competitors", e.target.value)} />
            </div>
            <div style={{flex:"1 1 240px"}}>
              <label className="small">口コミ・評価の要点</label>
              <input className="input" placeholder="例：価格は高いが導入後の満足度が高い など" value={context.reviews || ""} onChange={e=>updateContext("reviews", e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div style={{flex:"1 1 240px"}}>
              <label className="small">ビジネスゴール</label>
              <input className="input" placeholder="例：予約数増加 / 会員獲得 など" value={context.businessGoal || ""} onChange={e=>updateContext("businessGoal", e.target.value)} />
            </div>
            <div style={{flex:"1 1 240px"}}>
              <label className="small">想定ターゲット</label>
              <input className="input" placeholder="例：30代のマーケ担当 / 個人事業主 など" value={context.target || ""} onChange={e=>updateContext("target", e.target.value)} />
            </div>
          </div>
          <p className="small">※空欄可。答えられる範囲でOK。</p>
        </div>

        <div className="card" style={{flex: "2 1 520px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h3>質問 {current+1} / {QUESTIONS.length}</h3>
            <span className="badge"><span className="kbd">Tab</span> → <span className="kbd">Enter</span> で次へ</span>
          </div>

          <div className="card" style={{marginBottom: 12}}>
            <div className="small" style={{marginBottom: 6}}>質問</div>
            <div>{QUESTIONS[current]}</div>
          </div>

          <textarea
            placeholder="ここに回答を入力...（できるだけ具体的に）"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); if(canNext) handleNext(); }}}
          />

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={handleNext} disabled={!canNext}>次の質問へ</button>
            <button onClick={()=>{
              // 保存して次へ（空欄は不可）
              handleNext();
            }} className="primary" disabled={!canNext}>保存して進む</button>
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
              <div className="code">{result}</div>
            </div>
          )}
        </div>
      </div>

      <footer>
        コンセプト作成ナビゲーター（デモ）／Next.js + Edge API。OPENAI_API_KEY を .env に設定してご利用ください。
      </footer>
    </div>
  );
}
