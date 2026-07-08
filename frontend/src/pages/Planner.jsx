import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, Bell,
  Tag, Repeat, Calendar, List, LayoutGrid,
  Trash2, CalendarDays, Loader2,
} from "lucide-react";
import { api } from "../lib/api";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const ACCENT = "#a855f7";
const TODAY  = new Date();

const VIEWS = [
  { id:"month",  icon:<LayoutGrid size={15}/>, label:"Month"  },
  { id:"week",   icon:<CalendarDays size={15}/>, label:"Week" },
  { id:"agenda", icon:<List size={15}/>,       label:"Agenda" },
];

const DAYS_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS      = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];

const HOURS = Array.from({length:24},(_,i)=>{
  const h = i % 12 || 12;
  return `${h}:00 ${i<12?"AM":"PM"}`;
});

const CATEGORIES = [
  { id:"study",      label:"Study",      color:"#a855f7" },
  { id:"assignment", label:"Assignment", color:"#f472b6" },
  { id:"exam",       label:"Exam",       color:"#f87171" },
  { id:"personal",   label:"Personal",   color:"#34d399" },
  { id:"reminder",   label:"Reminder",   color:"#facc15" },
  { id:"meeting",    label:"Meeting",    color:"#22d3ee" },
  { id:"other",      label:"Other",      color:"#94a3b8" },
];

const REMINDERS = [
  { value:"0",    label:"At event time" },
  { value:"10",   label:"10 minutes before" },
  { value:"30",   label:"30 minutes before" },
  { value:"60",   label:"1 hour before" },
  { value:"1440", label:"1 day before" },
];

const REPEATS = [
  { value:"none",    label:"Does not repeat" },
  { value:"daily",   label:"Every day" },
  { value:"weekly",  label:"Every week" },
  { value:"monthly", label:"Every month" },
];

const EVENT_COLORS = [
  "#a855f7","#f472b6","#f87171","#fb923c",
  "#facc15","#34d399","#22d3ee","#60a5fa","#94a3b8",
];

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ── backend Task <-> frontend event shape mapping ──
function toFrontendEvent(task) {
  return {
    id: task._id,
    title: task.title,
    date: fmt(new Date(task.date)),
    startTime: task.startTime || "09:00",
    endTime: task.endTime || "10:00",
    color: task.color || ACCENT,
    category: task.category || "other",
    description: task.notes || "",
    reminder: task.reminder || "30",
    repeat: task.repeat || "none",
    allDay: !!task.allDay,
  };
}

function toBackendPayload(ev) {
  return {
    title: ev.title,
    notes: ev.description || "",
    date: new Date(`${ev.date}T00:00:00`).toISOString(),
    startTime: ev.allDay ? null : ev.startTime,
    endTime: ev.allDay ? null : ev.endTime,
    category: ev.category,
    color: ev.color,
    allDay: ev.allDay,
    reminder: ev.reminder,
    repeat: ev.repeat,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month+1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  for (let i=first-1; i>=0; i--) days.push({ date:new Date(year,month-1,prevTotal-i), cur:false });
  for (let d=1; d<=total; d++) days.push({ date:new Date(year,month,d), cur:true });
  const rem = 42 - days.length;
  for (let d=1; d<=rem; d++) days.push({ date:new Date(year,month+1,d), cur:false });
  return days;
}

function getWeekDays(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({length:7},(_,i)=>{ const nd=new Date(d); nd.setDate(d.getDate()+i); return nd; });
}

function isToday(date) {
  return fmt(date) === fmt(TODAY);
}

function catColor(cat) {
  return CATEGORIES.find(c=>c.id===cat)?.color || "#94a3b8";
}

function timeToMins(t) {
  const [h,m] = t.split(":").map(Number);
  return h*60+m;
}

// ─── EVENT MODAL ─────────────────────────────────────────────────────────────

function EventModal({ event, onSave, onDelete, onClose }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState({
    title:"", date:fmt(TODAY), startTime:"09:00", endTime:"10:00",
    color:ACCENT, category:"study", description:"", reminder:"30",
    repeat:"none", allDay:false,
    ...(event || {}),
  });
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      // don't auto-generate an id here — its presence (or absence) is
      // exactly how the parent decides create vs. update
      await onSave({ ...form, id: form.id });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{ position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.65)",
        backdropFilter:"blur(6px)",display:"flex",alignItems:"center",
        justifyContent:"center",fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",
        background:"linear-gradient(180deg,rgba(22,14,32,.98),rgba(8,6,12,.99))",
        border:`1px solid ${form.color}44`,borderRadius:24,padding:28,
        boxShadow:`0 40px 80px -20px rgba(0,0,0,.8),0 0 60px -20px rgba(168,85,247,.3)` }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
          <h2 style={{ fontSize:18,fontWeight:800,margin:0 }}>
            {isEdit?"Edit Event":"New Event"}
          </h2>
          <div style={{ display:"flex",gap:8 }}>
            {isEdit && (
              <button onClick={async ()=>{ await onDelete(event.id); onClose(); }}
                style={{ padding:"6px 8px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",
                  background:"rgba(248,113,113,.1)",color:"#f87171",cursor:"pointer",display:"flex" }}>
                <Trash2 size={15}/>
              </button>
            )}
            <button onClick={onClose}
              style={{ padding:"6px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",
                background:"transparent",color:"rgba(255,255,255,.5)",cursor:"pointer",display:"flex" }}>
              <X size={15}/>
            </button>
          </div>
        </div>

        <input value={form.title} onChange={e=>set("title",e.target.value)}
          placeholder="Event title"
          style={{ width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${form.color}44`,
            borderRadius:12,padding:"12px 14px",color:"#fff",fontSize:16,fontWeight:700,
            outline:"none",marginBottom:16,boxSizing:"border-box",
            fontFamily:"'Inter',-apple-system,sans-serif" }}/>

        <div style={{ display:"flex",gap:8,marginBottom:18,alignItems:"center" }}>
          <Tag size={14} color="rgba(255,255,255,.4)"/>
          <span style={{ fontSize:12,color:"rgba(255,255,255,.4)",marginRight:4 }}>Color</span>
          {EVENT_COLORS.map(c=>(
            <button key={c} onClick={()=>set("color",c)}
              style={{ width:22,height:22,borderRadius:"50%",background:c,border:"none",cursor:"pointer",
                boxShadow:form.color===c?`0 0 0 2px #fff,0 0 0 4px ${c}`:"none",
                transition:"box-shadow .15s" }}/>
          ))}
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
            display:"block",marginBottom:7,letterSpacing:.8 }}>CATEGORY</label>
          <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>set("category",c.id)}
                style={{ padding:"5px 12px",borderRadius:8,border:`1px solid ${c.color}44`,
                  background:form.category===c.id?`${c.color}22`:"transparent",
                  color:form.category===c.id?c.color:"rgba(255,255,255,.45)",
                  fontSize:12.5,fontWeight:600,cursor:"pointer",transition:"all .15s" }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:14,padding:"10px 14px",borderRadius:12,
          border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)" }}>
          <span style={{ fontSize:14,color:"rgba(255,255,255,.75)" }}>All day</span>
          <div onClick={()=>set("allDay",!form.allDay)}
            style={{ width:40,height:22,borderRadius:11,cursor:"pointer",
              background:form.allDay?ACCENT:"rgba(255,255,255,.1)",
              position:"relative",transition:"background .2s" }}>
            <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",
              position:"absolute",top:2,transition:"left .2s",
              left:form.allDay?20:2 }}/>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
            display:"block",marginBottom:6,letterSpacing:.8 }}>DATE</label>
          <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}
            style={{ width:"100%",background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.1)",borderRadius:10,
              padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",
              boxSizing:"border-box",colorScheme:"dark" }}/>
        </div>

        {!form.allDay && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12 }}>
            {[["startTime","Start"],["endTime","End"]].map(([k,l])=>(
              <div key={k}>
                <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
                  display:"block",marginBottom:6,letterSpacing:.8 }}>{l.toUpperCase()}</label>
                <input type="time" value={form[k]} onChange={e=>set(k,e.target.value)}
                  style={{ width:"100%",background:"rgba(255,255,255,.04)",
                    border:"1px solid rgba(255,255,255,.1)",borderRadius:10,
                    padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",
                    boxSizing:"border-box",colorScheme:"dark" }}/>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
            display:"block",marginBottom:6,letterSpacing:.8 }}>
            <Bell size={11} style={{ marginRight:5, verticalAlign:"middle" }}/>REMINDER
          </label>
          <select value={form.reminder} onChange={e=>set("reminder",e.target.value)}
            style={{ width:"100%",background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.1)",borderRadius:10,
              padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer" }}>
            {REMINDERS.map(r=><option key={r.value} value={r.value} style={{background:"#09070f"}}>{r.label}</option>)}
          </select>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:5 }}>
            Saved with the event — actual notifications aren't wired up yet.
          </p>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
            display:"block",marginBottom:6,letterSpacing:.8 }}>
            <Repeat size={11} style={{ marginRight:5,verticalAlign:"middle" }}/>REPEAT
          </label>
          <select value={form.repeat} onChange={e=>set("repeat",e.target.value)}
            style={{ width:"100%",background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,255,255,.1)",borderRadius:10,
              padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",cursor:"pointer" }}>
            {REPEATS.map(r=><option key={r.value} value={r.value} style={{background:"#09070f"}}>{r.label}</option>)}
          </select>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:5 }}>
            Saved with the event — this creates one event, not repeating occurrences, yet.
          </p>
        </div>

        <div style={{ marginBottom:22 }}>
          <label style={{ fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.4)",
            display:"block",marginBottom:6,letterSpacing:.8 }}>DESCRIPTION</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)}
            placeholder="Add notes…" rows={3}
            style={{ width:"100%",background:"rgba(255,255,255,.03)",
              border:"1px solid rgba(255,255,255,.08)",borderRadius:10,
              padding:"10px 12px",color:"rgba(255,255,255,.8)",fontSize:13.5,
              lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",
              boxSizing:"border-box" }}/>
        </div>

        <button onClick={handleSave}
          disabled={!form.title.trim() || saving}
          style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",
            cursor:(form.title.trim() && !saving)?"pointer":"not-allowed",fontSize:14.5,fontWeight:700,color:"#fff",
            background:form.title.trim()?`linear-gradient(135deg,${form.color},${form.color}bb)`:"rgba(255,255,255,.08)",
            boxShadow:form.title.trim()?`0 10px 28px -8px ${form.color}66`:"none",
            transition:"all .2s" }}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </div>
  );
}

// ─── EVENT PILL ──────────────────────────────────────────────────────────────

function EventPill({ ev, onClick, compact=false }) {
  return (
    <div onClick={e=>{e.stopPropagation();onClick(ev);}}
      style={{ display:"flex",alignItems:"center",gap:4,
        padding:compact?"2px 6px":"3px 8px",borderRadius:6,
        background:`${ev.color}22`,border:`1px solid ${ev.color}44`,
        cursor:"pointer",marginBottom:2,overflow:"hidden",
        transition:"all .15s",
      }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${ev.color}38`;}}
      onMouseLeave={e=>{e.currentTarget.style.background=`${ev.color}22`;}}>
      <div style={{ width:5,height:5,borderRadius:"50%",background:ev.color,flexShrink:0 }}/>
      <span style={{ fontSize:11.5,fontWeight:600,color:"#fff",
        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
        {!ev.allDay && `${ev.startTime} · `}{ev.title}
      </span>
    </div>
  );
}

// ─── MONTH VIEW ──────────────────────────────────────────────────────────────

function MonthView({ year, month, events, onDayClick, onEventClick }) {
  const days = useMemo(()=>getDaysInMonth(year,month),[year,month]);

  const eventsOn = (date) =>
    events.filter(e=>e.date===fmt(date))
      .sort((a,b)=>timeToMins(a.startTime)-timeToMins(b.startTime));

  return (
    <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",
        borderBottom:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.3)" }}>
        {DAYS_SHORT.map((d,i)=>(
          <div key={d} style={{ padding:"12px 0",textAlign:"center",fontSize:12,
            fontWeight:700,letterSpacing:1,
            color: i===0||i===6 ? "rgba(168,85,247,.7)" : "rgba(255,255,255,.45)" }}>
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      <div style={{ flex:1,display:"grid",gridTemplateColumns:"repeat(7,1fr)",
        gridTemplateRows:"repeat(6,1fr)" }}>
        {days.map((cell,i)=>{
          const dayEvs = eventsOn(cell.date);
          const today  = isToday(cell.date);
          const isWeekend = cell.date.getDay()===0||cell.date.getDay()===6;
          return (
            <div key={i} onClick={()=>onDayClick(cell.date)}
              style={{
                borderRight:"1px solid rgba(255,255,255,.07)",
                borderBottom:"1px solid rgba(255,255,255,.07)",
                padding:"10px 8px 8px",cursor:"pointer",minHeight:110,
                background: today
                  ? "rgba(168,85,247,.07)"
                  : !cell.cur
                  ? "rgba(0,0,0,.25)"
                  : isWeekend
                  ? "rgba(255,255,255,.012)"
                  : "rgba(255,255,255,.018)",
                transition:"background .15s",
                boxShadow: today ? `inset 0 0 0 1px rgba(168,85,247,.25)` : "none",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=today
                ?"rgba(168,85,247,.12)":"rgba(168,85,247,.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=today
                ?"rgba(168,85,247,.07)":!cell.cur?"rgba(0,0,0,.25)":isWeekend?"rgba(255,255,255,.012)":"rgba(255,255,255,.018)"}>

              <div style={{ display:"flex",justifyContent:"flex-start",marginBottom:6 }}>
                <span style={{
                  fontSize:14, fontWeight: today ? 900 : cell.cur ? 600 : 400,
                  width:28,height:28,borderRadius:"50%",display:"flex",
                  alignItems:"center",justifyContent:"center",
                  background: today ? ACCENT : "transparent",
                  color: today ? "#fff" : cell.cur ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.2)",
                  boxShadow: today ? `0 0 14px rgba(168,85,247,.65)` : "none",
                }}>{cell.date.getDate()}</span>
              </div>

              {dayEvs.slice(0,3).map(ev=>(
                <div key={ev.id} onClick={e=>{e.stopPropagation();onEventClick(ev);}}
                  style={{
                    display:"flex",alignItems:"center",gap:5,
                    padding:"4px 8px",borderRadius:7,marginBottom:3,
                    background:`${ev.color}28`,
                    borderLeft:`3px solid ${ev.color}`,
                    cursor:"pointer",overflow:"hidden",
                    transition:"all .15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${ev.color}45`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${ev.color}28`}>
                  <span style={{
                    fontSize:12,fontWeight:600,color:"#fff",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                    lineHeight:1.3,
                  }}>
                    {!ev.allDay && (
                      <span style={{ color:`${ev.color}`, fontWeight:700, marginRight:3, fontSize:11 }}>
                        {ev.startTime}
                      </span>
                    )}
                    {ev.title}
                  </span>
                </div>
              ))}
              {dayEvs.length>3 && (
                <div style={{ fontSize:11,color:"rgba(168,85,247,.8)",
                  padding:"2px 8px",fontWeight:700 }}>
                  +{dayEvs.length-3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WEEK VIEW ───────────────────────────────────────────────────────────────

function WeekView({ date, events, onEventClick, onSlotClick }) {
  const weekDays = useMemo(()=>getWeekDays(date),[date]);
  const scrollRef = useRef(null);

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop = 7*48;
  },[]);

  const eventsOn = (d) =>
    events.filter(e=>e.date===fmt(d)&&!e.allDay)
      .sort((a,b)=>timeToMins(a.startTime)-timeToMins(b.startTime));

  const allDayOn = (d) => events.filter(e=>e.date===fmt(d)&&e.allDay);

  return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
      <div style={{ display:"grid",gridTemplateColumns:"56px repeat(7,1fr)",
        borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0 }}>
        <div/>
        {weekDays.map((d,i)=>{
          const today=isToday(d);
          return (
            <div key={i} style={{ padding:"10px 0",textAlign:"center" }}>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",fontWeight:600 }}>{DAYS_SHORT[d.getDay()]}</div>
              <div style={{
                fontSize:20,fontWeight:800,
                width:36,height:36,borderRadius:"50%",margin:"4px auto 0",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:today?ACCENT:"transparent",
                color:today?"#fff":"rgba(255,255,255,.8)",
                boxShadow:today?`0 0 14px rgba(168,85,247,.6)`:"none",
              }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"56px repeat(7,1fr)",
        borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0,minHeight:28 }}>
        <div style={{ padding:"4px 6px",fontSize:10,color:"rgba(255,255,255,.3)",
          display:"flex",alignItems:"center",justifyContent:"flex-end" }}>all-day</div>
        {weekDays.map((d,i)=>(
          <div key={i} style={{ padding:"2px 4px",borderLeft:"1px solid rgba(255,255,255,.04)" }}>
            {allDayOn(d).map(ev=>(
              <EventPill key={ev.id} ev={ev} onClick={onEventClick} compact/>
            ))}
          </div>
        ))}
      </div>

      <div ref={scrollRef} style={{ flex:1,overflowY:"auto",position:"relative" }}>
        <div style={{ display:"grid",gridTemplateColumns:"56px repeat(7,1fr)",
          minHeight:`${24*48}px` }}>
          <div>
            {HOURS.map((h,i)=>(
              <div key={i} style={{ height:48,display:"flex",alignItems:"flex-start",
                justifyContent:"flex-end",paddingRight:8,paddingTop:2 }}>
                <span style={{ fontSize:10.5,color:"rgba(255,255,255,.25)",whiteSpace:"nowrap" }}>{h}</span>
              </div>
            ))}
          </div>

          {weekDays.map((d,di)=>{
            const dayEvs = eventsOn(d);
            const today  = isToday(d);
            return (
              <div key={di} style={{ position:"relative",
                borderLeft:"1px solid rgba(255,255,255,.04)",
                background:today?"rgba(168,85,247,.02)":"transparent" }}>
                {HOURS.map((_,hi)=>(
                  <div key={hi}
                    onClick={()=>onSlotClick(d,hi)}
                    style={{ height:48,borderTop:"1px solid rgba(255,255,255,.04)",cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(168,85,247,.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}/>
                ))}

                {dayEvs.map(ev=>{
                  const top  = (timeToMins(ev.startTime)/60)*48;
                  const ht   = Math.max(((timeToMins(ev.endTime)-timeToMins(ev.startTime))/60)*48,24);
                  return (
                    <div key={ev.id} onClick={()=>onEventClick(ev)}
                      style={{ position:"absolute",left:2,right:2,top,height:ht,
                        background:`${ev.color}28`,border:`1px solid ${ev.color}66`,
                        borderLeft:`3px solid ${ev.color}`,
                        borderRadius:7,padding:"3px 7px",cursor:"pointer",
                        overflow:"hidden",zIndex:2,transition:"all .15s",
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${ev.color}42`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${ev.color}28`}>
                      <div style={{ fontSize:11.5,fontWeight:700,color:"#fff",
                        lineHeight:1.3,overflow:"hidden" }}>{ev.title}</div>
                      {ht>30&&<div style={{ fontSize:10.5,color:"rgba(255,255,255,.55)" }}>
                        {ev.startTime} – {ev.endTime}</div>}
                    </div>
                  );
                })}

                {today && (()=>{
                  const now = new Date();
                  const mins = now.getHours()*60+now.getMinutes();
                  return (
                    <div style={{ position:"absolute",left:0,right:0,
                      top:`${(mins/60)*48}px`,zIndex:3,pointerEvents:"none" }}>
                      <div style={{ height:2,background:ACCENT,
                        boxShadow:`0 0 6px rgba(168,85,247,.8)`,position:"relative" }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",
                          background:ACCENT,position:"absolute",left:-1,top:-4 }}/>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AGENDA VIEW ─────────────────────────────────────────────────────────────

function AgendaView({ events, onEventClick }) {
  const sorted = [...events]
    .filter(e=>e.date>=fmt(TODAY))
    .sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime));

  const grouped = {};
  sorted.forEach(e=>{
    if(!grouped[e.date]) grouped[e.date]=[];
    grouped[e.date].push(e);
  });

  if (!sorted.length) return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:14,opacity:.4 }}>
      <Calendar size={44}/>
      <p style={{ fontSize:16 }}>No upcoming events</p>
    </div>
  );

  return (
    <div style={{ flex:1,overflowY:"auto",padding:"12px 24px 40px" }}>
      {Object.entries(grouped).map(([date,evs])=>{
        const d = new Date(date+"T12:00:00");
        const isT = date===fmt(TODAY);
        return (
          <div key={date} style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
              <div style={{ textAlign:"center",minWidth:48 }}>
                <div style={{ fontSize:11,fontWeight:700,
                  color:isT?ACCENT:"rgba(255,255,255,.4)",letterSpacing:.8 }}>
                  {DAYS_SHORT[d.getDay()].toUpperCase()}
                </div>
                <div style={{ fontSize:28,fontWeight:900,
                  color:isT?"#fff":"rgba(255,255,255,.7)",lineHeight:1 }}>
                  {d.getDate()}
                </div>
              </div>
              <div style={{ flex:1,height:1,background:"rgba(255,255,255,.07)" }}/>
              {isT&&<span style={{ fontSize:11.5,fontWeight:700,padding:"3px 10px",
                borderRadius:6,background:`${ACCENT}22`,color:ACCENT }}>TODAY</span>}
            </div>

            <div style={{ marginLeft:60,display:"flex",flexDirection:"column",gap:10 }}>
              {evs.map(ev=>(
                <div key={ev.id} onClick={()=>onEventClick(ev)}
                  style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"14px 18px",
                    borderRadius:16,border:`1px solid ${ev.color}33`,
                    background:`${ev.color}0d`,cursor:"pointer",transition:"all .15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${ev.color}1f`;e.currentTarget.style.borderColor=`${ev.color}66`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${ev.color}0d`;e.currentTarget.style.borderColor=`${ev.color}33`;}}>
                  <div style={{ width:4,alignSelf:"stretch",borderRadius:2,background:ev.color,flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                      <span style={{ fontSize:15,fontWeight:700,color:"#fff" }}>{ev.title}</span>
                      <span style={{ fontSize:11.5,fontWeight:700,padding:"2px 9px",borderRadius:6,
                        background:`${catColor(ev.category)}18`,color:catColor(ev.category) }}>
                        {CATEGORIES.find(c=>c.id===ev.category)?.label}
                      </span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:5 }}>
                      {!ev.allDay
                        ? <span style={{ fontSize:12.5,color:"rgba(255,255,255,.45)",
                            display:"flex",alignItems:"center",gap:4 }}>
                            <Clock size={11}/>{ev.startTime} – {ev.endTime}
                          </span>
                        : <span style={{ fontSize:12.5,color:"rgba(255,255,255,.45)" }}>All day</span>}
                      {ev.reminder!=="0"&&<span style={{ fontSize:12.5,color:"rgba(255,255,255,.35)",
                        display:"flex",alignItems:"center",gap:4 }}>
                        <Bell size={10}/>
                        {REMINDERS.find(r=>r.value===ev.reminder)?.label}
                      </span>}
                      {ev.repeat!=="none"&&<span style={{ fontSize:12.5,color:"rgba(255,255,255,.35)",
                        display:"flex",alignItems:"center",gap:4 }}>
                        <Repeat size={10}/>
                        {REPEATS.find(r=>r.value===ev.repeat)?.label}
                      </span>}
                    </div>
                    {ev.description&&<p style={{ fontSize:13,color:"rgba(255,255,255,.4)",
                      margin:"6px 0 0",lineHeight:1.5 }}>{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MINI CALENDAR ───────────────────────────────────────────────────────────

function MiniCalendar({ year, month, selected, events, onSelect, onNav }) {
  const days = getDaysInMonth(year, month);
  const hasEvent = (d) => events.some(e=>e.date===fmt(d));

  return (
    <div style={{ padding:"0 4px" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
        <button onClick={()=>onNav(-1)} style={{ background:"transparent",border:"none",
          color:"rgba(255,255,255,.5)",cursor:"pointer",padding:4,display:"flex" }}>
          <ChevronLeft size={16}/>
        </button>
        <span style={{ fontSize:13,fontWeight:700 }}>{MONTHS[month].slice(0,3)} {year}</span>
        <button onClick={()=>onNav(1)} style={{ background:"transparent",border:"none",
          color:"rgba(255,255,255,.5)",cursor:"pointer",padding:4,display:"flex" }}>
          <ChevronRight size={16}/>
        </button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4 }}>
        {DAYS_SHORT.map(d=>(
          <div key={d} style={{ textAlign:"center",fontSize:9.5,
            fontWeight:700,color:"rgba(255,255,255,.3)",padding:"2px 0" }}>{d[0]}</div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {days.map((cell,i)=>{
          const sel  = selected && fmt(cell.date)===fmt(selected);
          const tod  = isToday(cell.date);
          const hasE = hasEvent(cell.date);
          return (
            <div key={i} onClick={()=>onSelect(cell.date)}
              style={{ textAlign:"center",padding:"4px 2px",borderRadius:6,cursor:"pointer",
                background:sel?ACCENT:tod?"rgba(168,85,247,.15)":"transparent",
                transition:"background .1s",position:"relative",
              }}
              onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="rgba(168,85,247,.15)"; }}
              onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background=tod?"rgba(168,85,247,.1)":"transparent"; }}>
              <span style={{ fontSize:11,fontWeight:sel||tod?700:400,
                color:sel?"#fff":cell.cur?"rgba(255,255,255,.75)":"rgba(255,255,255,.2)" }}>
                {cell.date.getDate()}
              </span>
              {hasE&&!sel&&<div style={{ width:3,height:3,borderRadius:"50%",
                background:ACCENT,margin:"1px auto 0" }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PLANNER ────────────────────────────────────────────────────────────

export default function Planner() {
  const [view,         setView]         = useState("month");
  const [current,      setCurrent]      = useState(new Date(TODAY.getFullYear(),TODAY.getMonth(),1));
  const [events,       setEvents]       = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null); // null | { event? }
  const [selected,     setSelected]     = useState(TODAY);
  const [filterCat,    setFilterCat]    = useState(null);
  const [miniYear,     setMiniYear]     = useState(TODAY.getFullYear());
  const [miniMonth,    setMiniMonth]    = useState(TODAY.getMonth());

  const year  = current.getFullYear();
  const month = current.getMonth();

  // load a generous window of events once on mount — 90 days back,
  // a year forward — rather than refetching on every calendar navigation
  useEffect(() => {
    async function load() {
      try {
        const from = new Date(); from.setDate(from.getDate() - 90);
        const to = new Date(); to.setDate(to.getDate() + 365);
        const { data } = await api.get("/tasks", {
          params: { from: from.toISOString(), to: to.toISOString() },
        });
        // only tasks that actually have a date belong on the calendar —
        // plain checklist items (date: null) live on the Dashboard's
        // Study Plan instead
        setEvents(data.tasks.filter(t => t.date).map(toFrontendEvent));
      } catch (err) {
        console.error("Failed to load planner events:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredEvents = filterCat ? events.filter(e=>e.category===filterCat) : events;

  const navigate = (dir) => {
    setCurrent(prev=>{
      const d = new Date(prev);
      if(view==="month") d.setMonth(d.getMonth()+dir);
      else if(view==="week") d.setDate(d.getDate()+dir*7);
      else d.setDate(d.getDate()+dir*30);
      return d;
    });
  };

  async function saveEvent(ev) {
    const payload = toBackendPayload(ev);
    if (ev.id) {
      const { data } = await api.patch(`/tasks/${ev.id}`, payload);
      setEvents(prev => prev.map(e => e.id === ev.id ? toFrontendEvent(data.task) : e));
    } else {
      const { data } = await api.post("/tasks", payload);
      setEvents(prev => [...prev, toFrontendEvent(data.task)]);
    }
  }

  async function deleteEvent(id) {
    try {
      await api.delete(`/tasks/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  }

  const openCreate = (date, hour) => {
    const d = date || selected;
    const startTime = hour!=null?`${String(hour).padStart(2,"0")}:00`:"09:00";
    const endHour = hour!=null?hour+1:10;
    setModal({ event:{ date:fmt(d), startTime, endTime:`${String(endHour).padStart(2,"0")}:00` } });
  };

  const headerLabel = view==="month"
    ? `${MONTHS[month]} ${year}`
    : view==="week"
    ? `${MONTHS[month]} ${year} – Week of ${getWeekDays(current)[0].getDate()}`
    : "Upcoming Events";

  const upcoming = [...events]
    .filter(e=>e.date>=fmt(TODAY))
    .sort((a,b)=>a.date.localeCompare(b.date))
    .slice(0,5);

  if (loading) {
    return (
      <div style={{ height:"100vh", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#050308" }}>
        <Loader2 size={28} color={ACCENT} style={{ animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      height:"100vh",display:"flex",
      background:"radial-gradient(ellipse 80% 40% at 80% -5%,rgba(168,85,247,.1),transparent 55%),#050308",
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:"#fff",overflow:"hidden",
    }}>
      <style>{`
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:99px}
        select option{background:#09070f}
        input[type=date],input[type=time]{color-scheme:dark}
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{ width:240,borderRight:"1px solid rgba(255,255,255,.06)",
        display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",padding:"20px 12px" }}>

        <div style={{ borderRadius:16,border:"1px solid rgba(255,255,255,.07)",
          background:"rgba(255,255,255,.02)",padding:"14px 10px",marginBottom:16 }}>
          <MiniCalendar
            year={miniYear} month={miniMonth}
            selected={selected} events={events}
            onSelect={d=>{setSelected(d);setCurrent(new Date(d.getFullYear(),d.getMonth(),1));}}
            onNav={dir=>{
              let m=miniMonth+dir,y=miniYear;
              if(m>11){m=0;y++;}if(m<0){m=11;y--;}
              setMiniYear(y);setMiniMonth(m);
            }}
          />
        </div>

        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",
            letterSpacing:1.2,marginBottom:8,padding:"0 4px" }}>CATEGORIES</p>
          <button onClick={()=>setFilterCat(null)}
            style={{ display:"flex",alignItems:"center",gap:8,width:"100%",
              padding:"7px 10px",borderRadius:10,border:"none",cursor:"pointer",
              background:!filterCat?"rgba(168,85,247,.15)":"transparent",
              color:!filterCat?"#fff":"rgba(255,255,255,.5)",fontSize:13,marginBottom:2,
              fontWeight:!filterCat?700:400 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,.4)" }}/>
            All Events
          </button>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setFilterCat(p=>p===c.id?null:c.id)}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",
                padding:"7px 10px",borderRadius:10,border:"none",cursor:"pointer",
                background:filterCat===c.id?`${c.color}18`:"transparent",
                color:filterCat===c.id?c.color:"rgba(255,255,255,.5)",
                fontSize:13,marginBottom:2,fontWeight:filterCat===c.id?700:400 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:c.color,
                boxShadow:filterCat===c.id?`0 0 6px ${c.color}`:"none" }}/>
              {c.label}
              <span style={{ marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,.3)" }}>
                {events.filter(e=>e.category===c.id).length}
              </span>
            </button>
          ))}
        </div>

        <div>
          <p style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",
            letterSpacing:1.2,marginBottom:8,padding:"0 4px" }}>UPCOMING</p>
          {upcoming.map(ev=>(
            <div key={ev.id} onClick={()=>setModal({event:ev})}
              style={{ padding:"9px 10px",borderRadius:10,marginBottom:6,cursor:"pointer",
                border:`1px solid ${ev.color}22`,background:`${ev.color}0a`,
                transition:"all .15s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${ev.color}1a`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${ev.color}0a`;}}>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:ev.color,flexShrink:0 }}/>
                <span style={{ fontSize:12.5,fontWeight:600,color:"rgba(255,255,255,.85)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.title}</span>
              </div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.3)",marginTop:3,paddingLeft:12 }}>
                {new Date(ev.date+"T12:00:00").toLocaleDateString("en-IN",{month:"short",day:"numeric"})}
                {!ev.allDay&&` · ${ev.startTime}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN AREA ───────────────────────────────────────── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>

        <div style={{ display:"flex",alignItems:"center",gap:12,
          padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",
          flexShrink:0,background:"rgba(0,0,0,.2)" }}>

          <button onClick={()=>{setCurrent(new Date(TODAY.getFullYear(),TODAY.getMonth(),1));setSelected(TODAY);}}
            style={{ padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.7)",
              fontSize:13,fontWeight:600,cursor:"pointer" }}>
            Today
          </button>

          <div style={{ display:"flex",gap:2 }}>
            {[-1,1].map(d=>(
              <button key={d} onClick={()=>navigate(d)}
                style={{ padding:"6px 8px",borderRadius:8,border:"none",
                  background:"transparent",color:"rgba(255,255,255,.5)",
                  cursor:"pointer",display:"flex" }}>
                {d===-1?<ChevronLeft size={18}/>:<ChevronRight size={18}/>}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize:18,fontWeight:800,margin:0,letterSpacing:-.3 }}>{headerLabel}</h2>

          <div style={{ marginLeft:"auto",display:"flex",gap:4,
            background:"rgba(255,255,255,.04)",borderRadius:12,padding:4,
            border:"1px solid rgba(255,255,255,.07)" }}>
            {VIEWS.map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)}
                style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
                  borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
                  background:view===v.id?ACCENT:"transparent",
                  color:view===v.id?"#fff":"rgba(255,255,255,.5)",
                  boxShadow:view===v.id?`0 4px 12px -4px rgba(168,85,247,.6)`:"none",
                  transition:"all .15s" }}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>

          <button onClick={()=>openCreate()}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",
              borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",
              background:`linear-gradient(135deg,${ACCENT},${ACCENT}bb)`,
              boxShadow:`0 6px 18px -6px rgba(168,85,247,.5)` }}>
            <Plus size={15}/> Add
          </button>
        </div>

        {view==="month" && (
          <MonthView year={year} month={month} events={filteredEvents}
            onDayClick={d=>openCreate(d)}
            onEventClick={ev=>setModal({event:ev})}/>
        )}
        {view==="week" && (
          <WeekView date={current} events={filteredEvents}
            onEventClick={ev=>setModal({event:ev})}
            onSlotClick={(d,h)=>openCreate(d,h)}/>
        )}
        {view==="agenda" && (
          <AgendaView events={filteredEvents}
            onEventClick={ev=>setModal({event:ev})}/>
        )}
      </div>

      {modal && (
        <EventModal
          event={modal.event}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}