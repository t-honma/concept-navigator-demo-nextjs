"use client";

import { useState } from "react";

const QUESTIONS = [
  "サービス名は何ですか？",
  "URLは？",
  "競合サービスやURLは？",
  "口コミ・評価の要点は？",
  "ビジネスゴールは？（例：予約数増加、会員獲得など）",
  "想定ターゲットは？（例：30代マーケ担当、個人事業主など）",
  "このサービスは一言でいうと何ですか？",
  "顧客はどんな場面で助かり、もし無かったら何に困りますか？",
  "顧客が「このサービスでよかった」と感じる瞬間はどんな時ですか？",
  "競合と比べて、ここが違う／自分たちだけの強みは何ですか？",
  "顧客にどんな未来を感じてもらいたいですか？",
  "5年後に大成功したとしたら、サービスと社会はどう変わっていますか？",
  "ここまでの答えを踏まえて、サービスの旗印を表す言葉の素材を挙げるなら？（キーワードでもOK）"
];

type Concept = { concept: string; description: string };

export default function Page() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ concepts: Concept[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [refineLoadingIndex, setRefineLoadingIndex] = useState<number | null>(null);
  const [refineText, setRefineText] = useState<Record<number, string>>({});

  const canNext = input.trim().length > 0;
  const allAnswered = answers.length === QUESTIONS.length && answers.every(a => a && a.length > 0);

  function handleNext() {
    if (!canNext) return;
    const nextAnswers = [...answers];
    nextAnswers[current] = input.trim();
    setAnswers(nextAnswers);
    setInput("");

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
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
      let parsed: any = null;
      try { parsed = JSON.parse(data.text); } catch {}
      if (parsed && parsed.concepts) setResult(parsed);
      else setResult({ concepts: [] });
    } catch (e: any) {
      setError(e?.message || "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const presetHints = [
    "「人が」を主語にして、コンセプト文を修正してください。",
    "抽象語を避け、具体的な動詞と名詞を含めてください。",
    "異なる単語を使って再生成してください（意味は維持）。",
    "現場で使う指針として、誰が何をするか明確にしてください。",
    "名詞止めは避けてください（動詞を含める）。"
  ];

  async function handleRefine(index: number) {
    const instruction = (refineText[index] || "").trim();
    if (!instruction) return;
    if (!result) return;

    const target = result.concepts[index];
    if (!target) return;

    setRefineLoadingIndex(index);
    setError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          concept: target.concept,
          description: target.description,
          instruction,
          answers
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let parsed: any = null;
      try { parsed = JSON.parse(data.text); } catch {}
      const updated: Concept | null = parsed?.concept
        ? { concept: parsed.concept, description: parsed.description || "" }
        : null;
      if (updated) {
        const nextConcepts = [...(result?.concepts || [])];
        nextConcepts[index] = updated;
        setResult({ concepts: nextConcepts });
      } else {
        setError("再生成のJSONパースに失敗しました。");
      }
    } catch (e:any) {
      setError(e?.message || "再生成に失敗しました");
    } finally {
      setRefineLoadingIndex(null);
    }
  }

  return (
    <div className="container">
      <h1>Concept Navigator – ver2.0（リライト指示対応）</h1>
      <p className="small">全13問に答えたあと、各コンセプトの下で追加指示を入力して「再生成」できます。</p>

      <div className="card" style={{marginBottom:16}}>
        {!completed && (
          <>
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
          </>
        )}

        {completed && (
          <p style={{marginTop:12}}>質問はすべて解答しました。</p>
        )}

        <hr/>

        <h4>これまでの回答</h4>
        <ul className="clean">
          {answers.map((a, i) => (
            <li key={i}><span className="small">Q{i+1}:</span> {a}</li>
          ))}
        </ul>

        {completed && (
          <div style={{marginTop:12, display:"flex", gap:8}}>
            <button onClick={handleGenerate} className="primary" disabled={loading}>
              {loading ? "生成中..." : "コンセプト案（3案）を生成する"}
            </button>
          </div>
        )}

        {error && <div style={{marginTop:12, color:"#fca5a5"}}>エラー: {error}</div>}

        {result && result.concepts && result.concepts.length > 0 && (
          <div style={{marginTop:16}}>
            <h3>生成結果（3案）</h3>
            <div className="row">
              {result.concepts.map((c, idx) => (
                <div key={idx} className="card" style={{flex:"1 1 320px"}}>
                  <h5>{idx+1}. {c.concept}</h5>
                  <p>{c.description}</p>

                  <div style={{marginTop:8}}>
                    <label className="small">追加指示</label>
                    <textarea
                      placeholder="例：「人が」を主語にして、コンセプト文を修正してください。"
                      value={refineText[idx] || ""}
                      onChange={e=>setRefineText(prev=>({ ...prev, [idx]: e.target.value }))}
                    />
                    <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:6}}>
                      {presetHints.map((hint, hIdx) => (
                        <button
                          key={hIdx}
                          onClick={()=> setRefineText(prev=>({ ...prev, [idx]: hint }))}
                        >
                          例{hIdx+1}
                        </button>
                      ))}
                    </div>
                    <div style={{display:"flex", gap:8, marginTop:8}}>
                      <button
                        className="primary"
                        onClick={()=>handleRefine(idx)}
                        disabled={refineLoadingIndex === idx || !(refineText[idx]||"").trim()}
                      >
                        {refineLoadingIndex === idx ? "再生成中..." : "この案を再生成する"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer>
        コンセプト作成ナビゲーター（プロトタイプ ver2.0）／リライト指示機能つき。
      </footer>
    </div>
  );
}
