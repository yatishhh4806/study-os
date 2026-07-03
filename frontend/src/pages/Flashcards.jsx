import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Plus, Upload, PlayCircle, Sparkles, BookOpen,
  ChevronRight, RotateCcw, Check, X, Zap, Clock,
  Trophy, Target, Play, Pause, SkipForward, SkipBack,
  FileText, Loader2, ChevronDown, Star, Trash2,
  BarChart3, AlignLeft, PenLine, Layers, Search,
  AlertCircle,
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const ACCENT = "#a855f7";
const GLOW   = "rgba(168,85,247,0.45)";

const PDF_LIMIT  = 3;   // free tier: max PDFs per user
const CARD_LIMIT = 30;  // max cards generated per source

const SUBJECT_COLORS = ["#a855f7","#22d3ee","#f472b6","#fb923c","#34d399","#facc15","#60a5fa","#f87171"];

const DIFFICULTIES = [
  { label:"Again", value:1, color:"#f87171", short:"Again" },
  { label:"Hard",  value:2, color:"#fb923c", short:"Hard"  },
  { label:"Good",  value:3, color:"#a855f7", short:"Good"  },
  { label:"Easy",  value:4, color:"#34d399", short:"Easy"  },
];

const SOURCES = [
  { id:"manual",  icon:<PenLine size={16}/>,   label:"Manual",        desc:"Write cards yourself"         },
  { id:"pdf",     icon:<FileText size={16}/>,  label:"From PDF",      desc:`Up to ${PDF_LIMIT} PDFs`      },
  { id:"youtube", icon:<PlayCircle size={16}/>,  label:"YouTube",       desc:"Paste a video link"            },
  { id:"ai",      icon:<Sparkles size={16}/>,  label:"AI Generate",   desc:"Paste any text"               },
];

const SAMPLE_SUBJECTS = [
  { id:"s1", name:"Data Structures", color:"#a855f7", emoji:"🌲" },
  { id:"s2", name:"Machine Learning",color:"#22d3ee", emoji:"🤖" },
  { id:"s3", name:"DBMS",            color:"#f472b6", emoji:"🗄️" },
];

const makeId = () => crypto.randomUUID();

const makeCard = (subjectId, q="", a="", source="manual") => ({
  id: makeId(), subjectId, source,
  question: q, answer: a,
  difficulty: 0,
  interval: 1, repetitions: 0, easeFactor: 2.5,
  nextReviewDate: new Date().toISOString(),
  lastReviewed: null,
  createdAt: new Date().toISOString(),
  mastered: false,
});

// SM-2 spaced repetition
function sm2(card, quality) {
  let { easeFactor, repetitions, interval } = card;
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const nextReviewDate = new Date(Date.now() + interval * 86400000).toISOString();
  return { ...card, easeFactor, repetitions, interval, nextReviewDate, lastReviewed: new Date().toISOString(), mastered: repetitions >= 3 };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role:"user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function generateCardsFromText(text, count, subject) {
  const prompt = `You are a study assistant. Generate exactly ${count} high-quality spaced-repetition flashcards from the following content about "${subject}".

CONTENT:
${text.slice(0, 3000)}

Rules:
- Questions should test understanding, not just recall
- Answers should be concise (1-3 sentences)
- Cover different concepts
- Return ONLY a JSON array, no markdown, no explanation

Format:
[{"question":"...","answer":"..."},...]`;

  const raw = await callClaude(prompt);
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

async function extractYouTubeTranscript(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) return null;
  // In production, use your backend: GET /api/transcript?videoId=...
  // For now return a mock so the UI is fully wired
  return `[Transcript would be fetched from YouTube video ID: ${match[1]}. In production, connect this to your Velora backend with a YouTube Data API v3 or youtube-transcript npm package.]`;
}

// ─── FLIP CARD ───────────────────────────────────────────────────────────────

function FlipCard({ card, flipped, onFlip }) {
  return (
    <div
      onClick={onFlip}
      style={{ perspective:1200, width:"100%", maxWidth:580, height:320, cursor:"pointer" }}
    >
      <div style={{
        position:"relative", width:"100%", height:"100%",
        transition:"transform 0.55s cubic-bezier(.4,0,.2,1)",
        transformStyle:"preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* Front */}
        <div style={{
          position:"absolute",inset:0,borderRadius:24,
          background:"linear-gradient(135deg,rgba(22,14,32,.95),rgba(10,7,15,.98))",
          border:"1px solid rgba(168,85,247,.25)",
          boxShadow:`0 0 0 1px rgba(255,255,255,.02), 0 30px 60px -20px rgba(0,0,0,.7), 0 0 60px -20px ${GLOW}`,
          backfaceVisibility:"hidden",
          WebkitBackfaceVisibility:"hidden",
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          padding:"36px 44px",gap:16,
          backdropFilter:"blur(20px)",
          pointerEvents: flipped ? "none" : "all",
        }}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"rgba(168,85,247,.7)",textTransform:"uppercase"}}>Question</span>
          <p style={{fontSize:22,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.5,margin:0}}>
            {card?.question || ""}
          </p>
          <span style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:8}}>Click to reveal answer</span>
        </div>
        {/* Back */}
        <div style={{
          position:"absolute",inset:0,borderRadius:24,
          background:"linear-gradient(135deg,rgba(168,85,247,.12),rgba(10,7,15,.98))",
          border:`1px solid ${ACCENT}44`,
          boxShadow:`0 0 0 1px rgba(255,255,255,.02), 0 30px 60px -20px rgba(0,0,0,.7), 0 0 80px -20px ${GLOW}`,
          backfaceVisibility:"hidden",
          WebkitBackfaceVisibility:"hidden",
          transform:"rotateY(180deg)",
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          padding:"36px 44px",gap:16,
          backdropFilter:"blur(20px)",
          pointerEvents: flipped ? "all" : "none",
        }}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:`${ACCENT}99`,textTransform:"uppercase"}}>Answer</span>
          <p style={{fontSize:18,fontWeight:500,color:"rgba(255,255,255,.9)",textAlign:"center",lineHeight:1.7,margin:0}}>
            {card?.answer || ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── GENERATE MODAL ──────────────────────────────────────────────────────────

function GenerateModal({ subjects, pdfCount, onGenerated, onClose }) {
  const [source,     setSource]     = useState("ai");
  const [subjId,     setSubjId]     = useState(subjects[0]?.id || "");
  const [cardCount,  setCardCount]  = useState(10);
  const [text,       setText]       = useState("");
  const [ytUrl,      setYtUrl]      = useState("");
  const [pdfFile,    setPdfFile]    = useState(null);
  const [pdfText,    setPdfText]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState("");
  const [error,      setError]      = useState("");
  const fileRef = useRef();

  const subj = subjects.find(s=>s.id===subjId);

  const extractPdfText = async (file) => {
    if (typeof window.pdfjsLib === "undefined") {
      return "[PDF.js not loaded. In your project, import pdf.js to extract PDF text.]";
    }
    const ab   = await file.arrayBuffer();
    const pdf  = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let out    = "";
    for (let i=1; i<=Math.min(pdf.numPages,20); i++) {
      const page = await pdf.getPage(i);
      const tc   = await page.getTextContent();
      out += tc.items.map(x=>x.str).join(" ") + "\n";
    }
    return out;
  };

  const handlePdfChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (pdfCount >= PDF_LIMIT) { setError(`PDF limit reached (${PDF_LIMIT} PDFs max on free plan).`); return; }
    setPdfFile(f);
    setStatus("Extracting text from PDF…");
    const t = await extractPdfText(f);
    setPdfText(t);
    setStatus("PDF ready. Click Generate.");
    setError("");
  };

  const handleGenerate = async () => {
    setError(""); setLoading(true);
    let content = "";
    try {
      if (source === "pdf") {
        if (!pdfText) { setError("Please upload a PDF first."); setLoading(false); return; }
        content = pdfText;
        setStatus("Generating cards from PDF…");
      } else if (source === "youtube") {
        if (!ytUrl.trim()) { setError("Please enter a YouTube URL."); setLoading(false); return; }
        setStatus("Fetching transcript…");
        content = await extractYouTubeTranscript(ytUrl);
        if (!content) { setError("Invalid YouTube URL."); setLoading(false); return; }
        setStatus("Generating cards from transcript…");
      } else if (source === "ai") {
        if (!text.trim()) { setError("Please paste some text or notes."); setLoading(false); return; }
        content = text;
        setStatus("Generating cards with AI…");
      }

      const count  = Math.min(cardCount, CARD_LIMIT);
      const pairs  = await generateCardsFromText(content, count, subj?.name || "");
      if (!pairs.length) { setError("No cards generated. Try different content."); setLoading(false); return; }

      const cards = pairs.map(p => makeCard(subjId, p.question, p.answer, source));
      onGenerated(cards);
      onClose();
    } catch(e) {
      setError("Generation failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{
        position:"fixed",inset:0,zIndex:500,
        background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"'Inter',-apple-system,sans-serif",
      }}
    >
      <div style={{
        width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",
        background:"linear-gradient(180deg,rgba(22,14,32,.98),rgba(8,6,12,.99))",
        border:`1px solid ${ACCENT}44`,borderRadius:24,padding:32,
        boxShadow:`0 40px 80px -20px rgba(0,0,0,.8),0 0 60px -20px ${GLOW}`,
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Sparkles size={20} color={ACCENT}/>
            <h2 style={{fontSize:20,fontWeight:800,margin:0}}>Generate Flashcards</h2>
          </div>
          <button onClick={onClose}
            style={{background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:4,display:"flex"}}>
            <X size={20}/>
          </button>
        </div>

        {/* Subject */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:8}}>SUBJECT</label>
          <select value={subjId} onChange={e=>setSubjId(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
              borderRadius:12,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>
            {subjects.map(s=>(
              <option key={s.id} value={s.id} style={{background:"#09070f"}}>{s.emoji} {s.name}</option>
            ))}
          </select>
        </div>

        {/* Source tabs */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:8}}>SOURCE</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {SOURCES.filter(s=>s.id!=="manual").map(s=>{
              const isA = source===s.id;
              const locked = s.id==="pdf" && pdfCount>=PDF_LIMIT;
              return (
                <button key={s.id}
                  onClick={()=>{ if(!locked) setSource(s.id); }}
                  style={{
                    display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,
                    padding:"12px 14px",borderRadius:14,border:"none",cursor:locked?"not-allowed":"pointer",
                    background:isA?`${ACCENT}18`:"rgba(255,255,255,.03)",
                    boxShadow:isA?`inset 0 0 0 1px ${ACCENT}55`:"inset 0 0 0 1px rgba(255,255,255,.07)",
                    opacity:locked?.5:1,textAlign:"left",
                  }}>
                  <div style={{display:"flex",alignItems:"center",gap:7,color:isA?ACCENT:"rgba(255,255,255,.6)"}}>
                    {s.icon}
                    <span style={{fontSize:13.5,fontWeight:700,color:isA?"#fff":"rgba(255,255,255,.7)"}}>{s.label}</span>
                    {locked && <span style={{fontSize:10,color:"#fb923c",background:"rgba(251,146,60,.15)",
                      padding:"2px 6px",borderRadius:4}}>Limit</span>}
                  </div>
                  <span style={{fontSize:11.5,color:"rgba(255,255,255,.35)",paddingLeft:23}}>{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Source-specific input */}
        {source==="ai" && (
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:8}}>
              PASTE YOUR NOTES OR TEXT
            </label>
            <textarea value={text} onChange={e=>setText(e.target.value)}
              placeholder="Paste lecture notes, textbook content, or any study material…"
              style={{width:"100%",minHeight:140,background:"rgba(255,255,255,.03)",
                border:"1px solid rgba(255,255,255,.09)",borderRadius:12,padding:"12px 14px",
                color:"rgba(255,255,255,.85)",fontSize:14,lineHeight:1.6,
                resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
        )}

        {source==="pdf" && (
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:8}}>
              UPLOAD PDF {`(${pdfCount}/${PDF_LIMIT} used)`}
            </label>
            <input ref={fileRef} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePdfChange}/>
            <button onClick={()=>fileRef.current.click()}
              style={{width:"100%",padding:"24px",borderRadius:14,
                border:"2px dashed rgba(168,85,247,.3)",background:"rgba(168,85,247,.04)",
                color:"rgba(255,255,255,.5)",cursor:"pointer",display:"flex",flexDirection:"column",
                alignItems:"center",gap:10}}>
              <Upload size={24} color={ACCENT}/>
              <span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.7)"}}>
                {pdfFile ? pdfFile.name : "Click to upload PDF"}
              </span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Max 20 pages extracted</span>
            </button>
            {status && !loading && <p style={{fontSize:12,color:"rgba(168,85,247,.8)",marginTop:8}}>{status}</p>}
          </div>
        )}

        {source==="youtube" && (
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:8}}>
              YOUTUBE URL
            </label>
            <input value={ytUrl} onChange={e=>setYtUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{width:"100%",background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.1)",borderRadius:12,
                padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:8,lineHeight:1.5}}>
              ⚠ Requires transcript API connected in your Velora backend. Wires automatically once added.
            </p>
          </div>
        )}

        {/* Card count */}
        <div style={{marginBottom:24}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:.8,display:"block",marginBottom:10}}>
            NUMBER OF CARDS — <span style={{color:ACCENT}}>{cardCount}</span>
          </label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[5,10,15,20,25,30].map(n=>(
              <button key={n} onClick={()=>setCardCount(n)}
                style={{padding:"7px 16px",borderRadius:10,border:"none",cursor:"pointer",
                  fontSize:13,fontWeight:700,
                  background:cardCount===n?ACCENT:"rgba(255,255,255,.06)",
                  color:cardCount===n?"#fff":"rgba(255,255,255,.5)",
                  boxShadow:cardCount===n?`0 4px 12px -4px ${GLOW}`:"none",
                  transition:"all .15s"}}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",
            borderRadius:10,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",
            marginBottom:16}}>
            <AlertCircle size={14} color="#f87171"/>
            <span style={{fontSize:13,color:"#f87171"}}>{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width:"100%",padding:"14px",borderRadius:14,border:"none",cursor:loading?"wait":"pointer",
            fontSize:15,fontWeight:700,color:"#fff",
            background:loading?"rgba(168,85,247,.4)":`linear-gradient(135deg,${ACCENT},${ACCENT}bb)`,
            boxShadow:loading?"none":`0 10px 30px -8px ${GLOW}`,
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            transition:"all .2s",opacity:loading?.7:1,
          }}>
          {loading ? <><Loader2 size={18} style={{animation:"spin 1s linear infinite"}}/>{status||"Generating…"}</> : <><Sparkles size={16}/>Generate {cardCount} Cards</>}
        </button>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ─── CREATE CARD MODAL ───────────────────────────────────────────────────────

function CreateCardModal({ subjects, onSave, onClose }) {
  const [subjId, setSubjId] = useState(subjects[0]?.id||"");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [diff, setDiff] = useState(0);

  const save = () => {
    if (!q.trim()||!a.trim()) return;
    onSave(makeCard(subjId,q,a,"manual"));
    onClose();
  };

  return (
    <div
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.65)",
        backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{width:"100%",maxWidth:480,background:"linear-gradient(180deg,rgba(22,14,32,.98),rgba(8,6,12,.99))",
        border:`1px solid ${ACCENT}44`,borderRadius:24,padding:32,
        boxShadow:`0 40px 80px -20px rgba(0,0,0,.8),0 0 60px -20px ${GLOW}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <PenLine size={18} color={ACCENT}/>
            <h2 style={{fontSize:19,fontWeight:800,margin:0}}>New Flashcard</h2>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",display:"flex"}}><X size={18}/></button>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.45)",letterSpacing:.8,display:"block",marginBottom:6}}>SUBJECT</label>
          <select value={subjId} onChange={e=>setSubjId(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
              borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer"}}>
            {subjects.map(s=><option key={s.id} value={s.id} style={{background:"#09070f"}}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.45)",letterSpacing:.8,display:"block",marginBottom:6}}>QUESTION</label>
          <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="What is DFS?"
            style={{width:"100%",minHeight:90,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.09)",
              borderRadius:10,padding:"10px 12px",color:"rgba(255,255,255,.9)",fontSize:14,lineHeight:1.6,
              resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.45)",letterSpacing:.8,display:"block",marginBottom:6}}>ANSWER</label>
          <textarea value={a} onChange={e=>setA(e.target.value)} placeholder="Depth First Search — explores as deep as possible before backtracking."
            style={{width:"100%",minHeight:90,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.09)",
              borderRadius:10,padding:"10px 12px",color:"rgba(255,255,255,.9)",fontSize:14,lineHeight:1.6,
              resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>

        <button onClick={save} disabled={!q.trim()||!a.trim()}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
            cursor:(!q.trim()||!a.trim())?"not-allowed":"pointer",fontSize:15,fontWeight:700,color:"#fff",
            background:(!q.trim()||!a.trim())?"rgba(168,85,247,.25)":`linear-gradient(135deg,${ACCENT},${ACCENT}bb)`,
            boxShadow:`0 8px 24px -8px ${GLOW}`,transition:"all .2s"}}>
          Save Card
        </button>
      </div>
    </div>
  );
}

// ─── STUDY MODE ──────────────────────────────────────────────────────────────

function StudyMode({ cards, allCards, onRate, onExit }) {
  const [idx,     setIdx]     = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck,    setDeck]    = useState(cards);
  const [done,    setDone]    = useState(false);

  const card     = deck[idx];
  const progress = (idx / deck.length) * 100;

  const rate = (quality) => {
    onRate(card.id, quality);
    setFlipped(false);
    if (idx >= deck.length - 1) { setDone(true); }
    else { setTimeout(() => setIdx(i => i + 1), 200); }
  };

  const restartSame = () => {
    setDeck([...deck]);
    setIdx(0); setFlipped(false); setDone(false);
  };

  const studyAll = () => {
    setDeck([...allCards]);
    setIdx(0); setFlipped(false); setDone(false);
  };

  if (done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:24}}>
      <div style={{fontSize:64}}>🎉</div>
      <h2 style={{fontSize:32,fontWeight:900,margin:0,background:`linear-gradient(135deg,#fff,${ACCENT})`,
        WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}}>Session Complete!</h2>
      <p style={{color:"rgba(255,255,255,.5)",fontSize:16,margin:0}}>{deck.length} cards reviewed</p>
      <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={restartSame}
          style={{padding:"13px 28px",borderRadius:14,border:`1px solid ${ACCENT}55`,cursor:"pointer",
            fontSize:14,fontWeight:700,color:"#fff",background:`${ACCENT}18`,
            boxShadow:`0 6px 20px -8px ${GLOW}`}}>
          🔁 Study Same Cards Again
        </button>
        {allCards.length > deck.length && (
          <button onClick={studyAll}
            style={{padding:"13px 28px",borderRadius:14,border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",
              fontSize:14,fontWeight:700,color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.04)"}}>
            📚 Study All {allCards.length} Cards
          </button>
        )}
        <button onClick={onExit}
          style={{padding:"13px 28px",borderRadius:14,border:"none",cursor:"pointer",
            fontSize:14,fontWeight:700,color:"#fff",
            background:`linear-gradient(135deg,${ACCENT},${ACCENT}bb)`,
            boxShadow:`0 10px 30px -8px ${GLOW}`}}>
          Back to Deck
        </button>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 24px",gap:28}}>
      {/* Header */}
      <div style={{width:"100%",maxWidth:580,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onExit}
          style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",
            color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:13}}>
          <X size={15}/> Exit
        </button>
        <span style={{fontSize:13,color:"rgba(255,255,255,.45)",fontWeight:600}}>
          {idx+1} / {cards.length}
        </span>
        <span style={{fontSize:13,color:ACCENT,fontWeight:700}}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{width:"100%",maxWidth:580,height:4,borderRadius:999,background:"rgba(255,255,255,.08)"}}>
        <div style={{height:"100%",borderRadius:999,
          background:`linear-gradient(90deg,${ACCENT},#22d3ee)`,
          width:`${progress}%`,transition:"width .4s ease",
          boxShadow:`0 0 10px -2px ${GLOW}`}}/>
      </div>

      {/* Card */}
      <FlipCard card={card} flipped={flipped} onFlip={()=>setFlipped(f=>!f)}/>

      {/* Rating buttons — shown after flip */}
      <div style={{
        display:"flex",gap:12,
        opacity:flipped?1:0,transform:flipped?"translateY(0)":"translateY(10px)",
        transition:"all .3s ease",pointerEvents:flipped?"all":"none",
      }}>
        {DIFFICULTIES.map(d=>(
          <button key={d.value} onClick={()=>rate(d.value)}
            style={{padding:"12px 22px",borderRadius:14,border:`1px solid ${d.color}55`,
              background:`${d.color}14`,color:d.color,cursor:"pointer",
              fontSize:14,fontWeight:700,transition:"all .15s",
              boxShadow:`0 6px 20px -8px ${d.color}66`}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${d.color}28`;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${d.color}14`;e.currentTarget.style.transform="translateY(0)";}}>
            {d.label}
          </button>
        ))}
      </div>

      {!flipped && (
        <p style={{fontSize:13,color:"rgba(255,255,255,.25)"}}>
          Click the card to reveal the answer
        </p>
      )}
    </div>
  );
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

function SubjectDashboard({ cards, subject, onStudy, onAdd, onGenerate }) {
  const total    = cards.length;
  const mastered = cards.filter(c=>c.mastered).length;
  const due      = cards.filter(c=>new Date(c.nextReviewDate)<=new Date()).length;
  const accuracy = cards.reduce((acc,c)=>acc+(c.easeFactor/2.5),0)/Math.max(total,1);

  const stats = [
    { label:"Total Cards",  value:total,                  icon:<Layers size={18}/>,   color:"#a855f7" },
    { label:"Due Today",    value:due,                    icon:<Clock size={18}/>,    color:"#fb923c" },
    { label:"Mastered",     value:mastered,               icon:<Trophy size={18}/>,   color:"#34d399" },
    { label:"Accuracy",     value:`${Math.round(accuracy*100)}%`, icon:<Target size={18}/>, color:"#22d3ee" },
  ];

  return (
    <div style={{flex:1,overflowY:"auto",padding:"32px 36px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:32}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:28}}>{subject?.emoji}</span>
            <h1 style={{fontSize:28,fontWeight:900,margin:0,letterSpacing:-.5}}>{subject?.name}</h1>
          </div>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:14,margin:0}}>{total} flashcards · {due} due today</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[
            {label:"+ Manual",   icon:<PenLine size={14}/>,   action:onAdd,      bg:ACCENT},
            {label:"Generate",   icon:<Sparkles size={14}/>,  action:onGenerate, bg:"transparent",border:true},
          ].map(b=>(
            <button key={b.label} onClick={b.action}
              style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:12,
                border:b.border?`1px solid ${ACCENT}55`:"none",cursor:"pointer",
                fontSize:13.5,fontWeight:700,color:"#fff",
                background:b.border?`${ACCENT}14`:b.bg,
                boxShadow:b.border?"none":`0 8px 20px -6px ${GLOW}`}}>
              {b.icon}{b.label}
            </button>
          ))}
          <button onClick={()=>onStudy(due > 0 ? cards.filter(c=>new Date(c.nextReviewDate)<=new Date()) : cards, cards)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",borderRadius:12,
              border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",
              background:`linear-gradient(135deg,${ACCENT},${ACCENT}bb)`,
              boxShadow:`0 10px 28px -8px ${GLOW}`}}>
            <Play size={15}/> {due > 0 ? `Study Due (${due})` : "Study All"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:36}}>
        {stats.map(s=>(
          <div key={s.label}
            style={{borderRadius:18,border:"1px solid rgba(255,255,255,.07)",
              background:"rgba(255,255,255,.02)",padding:"20px 18px",
              transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${s.color}44`;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{color:s.color,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:-.5}}>{s.value}</div>
            <div style={{fontSize:12.5,color:"rgba(255,255,255,.4)",marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Card list */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <h3 style={{fontSize:16,fontWeight:800,margin:0}}>All Cards</h3>
          <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Drag to reorder · click to preview</span>
        </div>
        {!total && (
          <div style={{padding:"60px 20px",textAlign:"center",color:"rgba(255,255,255,.25)"}}>
            <Brain size={36} style={{margin:"0 auto 14px",display:"block",opacity:.3}}/>
            <p style={{fontSize:15,margin:0}}>No cards yet. Add manually or generate from a source.</p>
          </div>
        )}
        {cards.map((c,i)=>(
          <div key={c.id}
            style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",
              borderRadius:14,border:"1px solid rgba(255,255,255,.06)",
              background:"rgba(255,255,255,.02)",transition:"all .15s",cursor:"default"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(168,85,247,.3)";e.currentTarget.style.background="rgba(168,85,247,.04)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.06)";e.currentTarget.style.background="rgba(255,255,255,.02)";}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,.2)",width:22,flexShrink:0,textAlign:"right"}}>{i+1}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:14,fontWeight:600,color:"#fff",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.question}</p>
              <p style={{fontSize:12.5,color:"rgba(255,255,255,.4)",margin:"3px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.answer}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {c.mastered && <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,
                background:"rgba(52,211,153,.15)",color:"#34d399",border:"1px solid rgba(52,211,153,.3)"}}>MASTERED</span>}
              <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,
                background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.35)"}}>
                {c.source==="manual"?"Manual":c.source==="pdf"?"PDF":c.source==="youtube"?"YT":"AI"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Flashcards() {
  const [subjects,      setSubjects]      = useState(SAMPLE_SUBJECTS);
  const [cards,         setCards]         = useState([
    makeCard("s1","What is DFS?","Depth First Search — explores as deep as possible before backtracking using a stack or recursion.","manual"),
    makeCard("s1","What is the time complexity of BFS?","O(V + E) where V = vertices and E = edges.","manual"),
    makeCard("s1","What is a balanced BST?","A Binary Search Tree where the height difference between left and right subtrees is at most 1.","manual"),
    makeCard("s2","What is gradient descent?","An optimization algorithm that iteratively adjusts model parameters in the direction of steepest descent of the loss function.","manual"),
  ]);

  const [activeSubject, setActiveSubject] = useState("s1");
  const [mode,          setMode]          = useState("dashboard"); // dashboard | study
  const [studyDeck,     setStudyDeck]     = useState([]);
  const [showGenerate,  setShowGenerate]  = useState(false);
  const [showCreate,    setShowCreate]    = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjName,   setNewSubjName]   = useState("");
  const [search,        setSearch]        = useState("");

  const pdfCount     = cards.filter(c=>c.source==="pdf").length;
  const subjCards    = cards.filter(c=>c.subjectId===activeSubject&&
    (c.question.toLowerCase().includes(search.toLowerCase())||c.answer.toLowerCase().includes(search.toLowerCase())));
  const activeSubj   = subjects.find(s=>s.id===activeSubject);

  const addCards  = (newCards) => setCards(p=>[...p,...newCards]);
  const rateCard  = (id,quality) => setCards(p=>p.map(c=>c.id===id?sm2(c,quality):c));

  const addSubject = () => {
    if (!newSubjName.trim()) return;
    const s={id:makeId(),name:newSubjName.trim(),color:SUBJECT_COLORS[subjects.length%8],emoji:"📖"};
    setSubjects(p=>[...p,s]); setActiveSubject(s.id); setNewSubjName(""); setAddingSubject(false);
  };

  const [studyAll,    setStudyAll]    = useState([]);

  const startStudy = (deck, all) => {
    if (!deck.length) return;
    setStudyDeck(deck);
    setStudyAll(all || deck);
    setMode("study");
  };

  return (
    <div style={{
      display:"flex",height:"100vh",width:"100%",
      background:"radial-gradient(ellipse 70% 50% at 30% -10%,rgba(168,85,247,.12),transparent 60%),#050308",
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:"#fff",overflow:"hidden",
    }}>
      <style>{`
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeUp .22s ease both}
        .subj-btn:hover{background:rgba(255,255,255,.04)!important}
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{width:220,borderRight:"1px solid rgba(255,255,255,.06)",
        display:"flex",flexDirection:"column",padding:"28px 12px",gap:4,
        flexShrink:0,overflowY:"auto"}}>
        <div style={{padding:"0 8px",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Brain size={18} color={ACCENT}/>
            <span style={{fontSize:15,fontWeight:800,letterSpacing:-.3}}>Flashcards</span>
          </div>
        </div>

        <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.28)",letterSpacing:1.2,
          padding:"0 10px",marginBottom:4,textTransform:"uppercase"}}>Subjects</p>

        {subjects.map(s=>{
          const isA=s.id===activeSubject;
          const cnt=cards.filter(c=>c.subjectId===s.id).length;
          const due=cards.filter(c=>c.subjectId===s.id&&new Date(c.nextReviewDate)<=new Date()).length;
          return (
            <button key={s.id} className="subj-btn"
              onClick={()=>{setActiveSubject(s.id);setMode("dashboard");}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,
                border:"none",background:isA?`${s.color}18`:"transparent",cursor:"pointer",width:"100%",
                textAlign:"left",boxShadow:isA?`inset 0 0 0 1px ${s.color}40`:"none"}}>
              <span style={{fontSize:16}}>{s.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:isA?700:500,color:isA?"#fff":"rgba(255,255,255,.6)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                {due>0 && <div style={{fontSize:11,color:"#fb923c",fontWeight:600}}>{due} due</div>}
              </div>
              <span style={{fontSize:11,color:"rgba(255,255,255,.3)",flexShrink:0}}>{cnt}</span>
            </button>
          );
        })}

        {addingSubject ? (
          <div style={{padding:"6px 10px"}}>
            <input autoFocus value={newSubjName} onChange={e=>setNewSubjName(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")addSubject();if(e.key==="Escape")setAddingSubject(false);}}
              placeholder="Subject name…"
              style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(168,85,247,.4)",
                borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:13,outline:"none"}}/>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button onClick={addSubject} style={{flex:1,padding:"6px",borderRadius:6,border:"none",
                background:ACCENT,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add</button>
              <button onClick={()=>setAddingSubject(false)} style={{padding:"6px 8px",borderRadius:6,
                border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.5)",cursor:"pointer"}}>
                <X size={12}/></button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setAddingSubject(true)} className="subj-btn"
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:12,
              border:"none",background:"transparent",cursor:"pointer",color:"rgba(255,255,255,.35)",fontSize:13,marginTop:4}}>
            <Plus size={14}/> New Subject
          </button>
        )}

        {/* Quick search */}
        <div style={{marginTop:"auto",paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{position:"relative"}}>
            <Search size={12} color="rgba(255,255,255,.25)"
              style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cards…"
              style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",
                borderRadius:10,padding:"8px 10px 8px 28px",color:"#fff",fontSize:12.5,outline:"none",
                boxSizing:"border-box"}}/>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {mode==="study" ? (
          <StudyMode cards={studyDeck} allCards={studyAll} onRate={rateCard} onExit={()=>setMode("dashboard")}/>
        ) : (
          <SubjectDashboard
            cards={subjCards}
            subject={activeSubj}
            onStudy={startStudy}
            onAdd={()=>setShowCreate(true)}
            onGenerate={()=>setShowGenerate(true)}
          />
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────── */}
      {showGenerate && (
        <GenerateModal
          subjects={subjects}
          pdfCount={pdfCount}
          onGenerated={addCards}
          onClose={()=>setShowGenerate(false)}
        />
      )}
      {showCreate && (
        <CreateCardModal
          subjects={subjects}
          onSave={c=>{ setCards(p=>[...p,c]); }}
          onClose={()=>setShowCreate(false)}
        />
      )}
    </div>
  );
}