import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";
import { SiGmail } from "react-icons/si";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, ArrowRight, Sparkles } from "lucide-react";

const FEATURES = [
  { emoji:"📝", label:"Smart Notes",     desc:"Block-based editor"     },
  { emoji:"⏱",  label:"Focus Mode",     desc:"Pomodoro + analytics"   },
  { emoji:"🎓", label:"Flashcards",     desc:"Spaced repetition"      },
  { emoji:"📅", label:"Planner",        desc:"Google Calendar-style"  },
  { emoji:"🤖", label:"AI Assistant",   desc:"Personalized learning"  },
  { emoji:"📊", label:"Analytics",      desc:"Study insights"         },
];

const SOCIALS = [
  { icon:<SiGmail size={18}/>,        label:"Gmail",     href:"mailto:sagy48@gmail.com",        color:"#f87171" },
  { icon:<FaInstagram size={18}/>,    label:"Instagram", href:"https://www.instagram.com",      color:"#f472b6" },
  { icon:<RiTwitterXLine size={18}/>, label:"Twitter",   href:"https://www.x.com",              color:"#94a3b8" },
  { icon:<FaLinkedin size={18}/>,     label:"LinkedIn",  href:"https://www.linkedin.com",       color:"#60a5fa" },
];

export default function Footer() {
  const [feedback, setFeedback]   = useState("");
  const [sent,     setSent]       = useState(false);

  const handleSend = () => {
    if (!feedback.trim()) return;
    setSent(true);
    setFeedback("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <footer style={{
      position:"relative",overflow:"hidden",
      background:"linear-gradient(180deg,#09070f,#04030a)",
      borderTop:"1px solid rgba(168,85,247,.12)",
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      {/* Background glows */}
      <div style={{
        position:"absolute",left:"50%",top:0,transform:"translateX(-50%)",
        width:600,height:400,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(168,85,247,.07),transparent 70%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",right:-100,bottom:-100,
        width:400,height:400,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(34,211,238,.04),transparent 70%)",
        pointerEvents:"none",
      }}/>

      <div style={{ position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto",padding:"72px 40px 0" }}>

        {/* ── TOP: BRAND + TAGLINE ────────────────────────── */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",
          marginBottom:56,flexWrap:"wrap",gap:32 }}>
          <div style={{ maxWidth:380 }}>
            <h2 style={{ fontSize:40,fontWeight:900,color:"#fff",margin:0,letterSpacing:-1 }}>
              Study<span style={{ color:"#a855f7" }}>OS</span>
            </h2>
            <p style={{ fontSize:15,color:"rgba(255,255,255,.45)",marginTop:14,lineHeight:1.75 }}>
              The academic operating system built for high-performing students.
              Everything you need to learn smarter — in one beautiful ecosystem.
            </p>
            {/* Social icons */}
            <div style={{ display:"flex",gap:10,marginTop:24 }}>
              {SOCIALS.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  title={s.label}
                  style={{
                    width:40,height:40,borderRadius:12,display:"flex",
                    alignItems:"center",justifyContent:"center",
                    border:`1px solid ${s.color}33`,background:`${s.color}0d`,
                    color:s.color,textDecoration:"none",transition:"all .18s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}22`;e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${s.color}0d`;e.currentTarget.style.transform="translateY(0)";}}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter / CTA strip */}
          <div style={{
            borderRadius:20,border:"1px solid rgba(168,85,247,.2)",
            background:"rgba(168,85,247,.06)",backdropFilter:"blur(12px)",
            padding:"24px 28px",maxWidth:380,width:"100%",
            boxShadow:"0 0 40px -16px rgba(168,85,247,.3)",
          }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
              <Sparkles size={16} color="#a855f7"/>
              <span style={{ fontSize:13,fontWeight:700,color:"#a855f7" }}>Early Access</span>
            </div>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 8px" }}>
              StudyOS is in active development
            </h3>
            <p style={{ fontSize:13.5,color:"rgba(255,255,255,.45)",lineHeight:1.6,marginBottom:16 }}>
              New features drop every week. Follow along or reach out to collaborate.
            </p>
            <a href="mailto:sagy48@gmail.com"
              style={{
                display:"inline-flex",alignItems:"center",gap:7,
                padding:"10px 20px",borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#a855f7,#a855f7bb)",
                color:"#fff",fontSize:13.5,fontWeight:700,textDecoration:"none",
                boxShadow:"0 8px 22px -6px rgba(168,85,247,.5)",cursor:"pointer",
              }}>
              Get in touch <ArrowRight size={14}/>
            </a>
          </div>
        </div>

        {/* ── MIDDLE: 3-COL GRID ──────────────────────────── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:40,
          paddingBottom:48,borderBottom:"1px solid rgba(255,255,255,.06)",
          flexWrap:"wrap" }}>

          {/* Features */}
          <div>
            <h4 style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,.3)",
              letterSpacing:1.5,marginBottom:20,textTransform:"uppercase" }}>Features</h4>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {FEATURES.map(f=>(
                <div key={f.label}
                  style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"10px 12px",borderRadius:12,
                    border:"1px solid rgba(255,255,255,.06)",
                    background:"rgba(255,255,255,.02)",
                    transition:"all .15s",cursor:"default",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(168,85,247,.25)";e.currentTarget.style.background="rgba(168,85,247,.06)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.06)";e.currentTarget.style.background="rgba(255,255,255,.02)";}}>
                  <span style={{ fontSize:18 }}>{f.emoji}</span>
                  <div>
                    <div style={{ fontSize:12.5,fontWeight:700,color:"rgba(255,255,255,.85)" }}>{f.label}</div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,.35)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,.3)",
              letterSpacing:1.5,marginBottom:20,textTransform:"uppercase" }}>Contact & Connect</h4>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {SOCIALS.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  style={{
                    display:"flex",alignItems:"center",gap:12,
                    padding:"12px 14px",borderRadius:14,
                    border:`1px solid ${s.color}22`,background:`${s.color}08`,
                    textDecoration:"none",transition:"all .15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}18`;e.currentTarget.style.borderColor=`${s.color}44`;e.currentTarget.style.transform="translateX(3px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${s.color}08`;e.currentTarget.style.borderColor=`${s.color}22`;e.currentTarget.style.transform="translateX(0)";}}>
                  <div style={{ width:32,height:32,borderRadius:9,flexShrink:0,
                    background:`${s.color}15`,border:`1px solid ${s.color}33`,
                    display:"flex",alignItems:"center",justifyContent:"center",color:s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:13.5,fontWeight:700,color:"rgba(255,255,255,.85)" }}>{s.label}</div>
                    <div style={{ fontSize:11.5,color:"rgba(255,255,255,.3)" }}>
                      {s.label==="Gmail"?"sagy48@gmail.com":"@studyos"}
                    </div>
                  </div>
                  <ArrowRight size={13} style={{ marginLeft:"auto",color:"rgba(255,255,255,.2)" }}/>
                </a>
              ))}
              <p style={{ fontSize:12,color:"rgba(255,255,255,.3)",marginTop:4,paddingLeft:4 }}>
                💬 Usually replies within 24 hours
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h4 style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,.3)",
              letterSpacing:1.5,marginBottom:20,textTransform:"uppercase" }}>Feedback</h4>
            <p style={{ fontSize:13.5,color:"rgba(255,255,255,.4)",marginBottom:14,lineHeight:1.6 }}>
              Found a bug? Have a feature idea? We read every message.
            </p>
            <textarea
              value={feedback}
              onChange={e=>setFeedback(e.target.value)}
              placeholder="Share your thoughts on StudyOS…"
              rows={4}
              style={{
                width:"100%",background:"rgba(255,255,255,.03)",
                border:"1px solid rgba(255,255,255,.09)",borderRadius:14,
                padding:"12px 14px",color:"rgba(255,255,255,.85)",fontSize:13.5,
                lineHeight:1.6,resize:"none",outline:"none",
                fontFamily:"'Inter',-apple-system,sans-serif",
                boxSizing:"border-box",transition:"border-color .2s",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(168,85,247,.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.09)"}
            />
            <button onClick={handleSend}
              style={{
                marginTop:10,display:"flex",alignItems:"center",gap:8,
                padding:"11px 22px",borderRadius:12,border:"none",cursor:"pointer",
                fontSize:13.5,fontWeight:700,color:"#fff",
                background:sent?"rgba(52,211,153,.8)":"linear-gradient(135deg,#a855f7,#a855f7bb)",
                boxShadow:sent?"0 8px 20px -6px rgba(52,211,153,.4)":"0 8px 22px -6px rgba(168,85,247,.5)",
                transition:"all .3s",
              }}>
              {sent ? <><span>✓</span> Sent!</> : <><Send size={14}/> Send Feedback</>}
            </button>
          </div>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────── */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"22px 0",flexWrap:"wrap",gap:12 }}>
          <p style={{ fontSize:13,color:"rgba(255,255,255,.25)",margin:0 }}>
            © 2026 StudyOS. All rights reserved.
          </p>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            {["Privacy Policy","Terms of Service"].map(l=>(
              <a key={l} href="#" style={{ fontSize:13,color:"rgba(255,255,255,.3)",
                textDecoration:"none",transition:"color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#a855f7"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.3)"}>
                {l}
              </a>
            ))}
          </div>
          <p style={{ fontSize:13,margin:0 }}>
            <span style={{ color:"rgba(255,255,255,.3)" }}>Built with </span>
            <span style={{ color:"#f87171" }}>❤️</span>
            <span style={{ color:"rgba(255,255,255,.3)" }}> by </span>
            <span style={{ color:"#a855f7",fontWeight:700 }}>Yatish</span>
          </p>
        </div>
      </div>
    </footer>
  );
}