// src/pages/NotesPage.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  Star,
  GripVertical,
  ChevronRight,
  ChevronDown,
  ImagePlus,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
  Lightbulb,
  BookOpen,
  X,
  Copy,
  RefreshCw,
  FileText,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TEMPORARY: all notes live in React state (mock-data-first).
// SWAP POINT — when the backend exists, replace the useState
// initialisers with a fetch to /api/notes and call the API inside
// updateNote / addNote / deleteNote. The component tree doesn't
// need to change; only where the data comes from.
// ─────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  "#a855f7", "#22d3ee", "#f472b6", "#fb923c",
  "#34d399", "#facc15", "#60a5fa", "#f87171",
];

const BLOCK_TYPES = [
  { type: "p",        label: "Text",           icon: Type,        hint: "Plain paragraph" },
  { type: "h1",       label: "Heading 1",      icon: Heading1,    hint: "# " },
  { type: "h2",       label: "Heading 2",      icon: Heading2,    hint: "## " },
  { type: "h3",       label: "Heading 3",      icon: Heading3,    hint: "### " },
  { type: "bullet",   label: "Bulleted list",  icon: List,        hint: "- " },
  { type: "numbered", label: "Numbered list",  icon: ListOrdered, hint: "1. " },
  { type: "todo",     label: "To-do list",     icon: ListTodo,    hint: "[] " },
  { type: "quote",    label: "Quote",          icon: Quote,       hint: "> " },
  { type: "callout",  label: "Callout",        icon: Lightbulb,   hint: "Highlight an idea" },
  { type: "code",     label: "Code",           icon: Code2,       hint: "```" },
  { type: "divider",  label: "Divider",        icon: Minus,       hint: "---" },
  { type: "image",    label: "Image",          icon: ImagePlus,   hint: "Upload" },
];

// typing these at the start of a block + space converts it
const MD_SHORTCUTS = [
  { match: "#",   type: "h1" },
  { match: "##",  type: "h2" },
  { match: "###", type: "h3" },
  { match: "-",   type: "bullet" },
  { match: "*",   type: "bullet" },
  { match: "1.",  type: "numbered" },
  { match: ">",   type: "quote" },
  { match: "[]",  type: "todo" },
];

const COVERS = [
  "",
  "linear-gradient(135deg, #2e1065 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #0e7490 0%, #164e63 100%)",
  "linear-gradient(135deg, #9d174d 0%, #4a044e 100%)",
  "linear-gradient(135deg, #92400e 0%, #451a03 100%)",
  "linear-gradient(135deg, #065f46 0%, #022c22 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
];

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const createBlock = (type = "p", text = "") => ({
  id: makeId(),
  type,
  text,
  src: "",
  checked: false,
});

const createNote = (subjectId) => ({
  id: makeId(),
  subjectId,
  title: "",
  starred: false,
  cover: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  blocks: [createBlock("p", "")],
});

const initialSubjects = [
  { id: "sub-1", name: "Data Structures",  emoji: "🌲", color: SUBJECT_COLORS[0] },
  { id: "sub-2", name: "Machine Learning", emoji: "🤖", color: SUBJECT_COLORS[1] },
  { id: "sub-3", name: "Web Development",  emoji: "🌐", color: SUBJECT_COLORS[2] },
];

const initialNotes = [
  {
    ...createNote("sub-1"),
    id: "note-1",
    title: "Binary Trees",
    starred: true,
    cover: COVERS[1],
    blocks: [
      createBlock("p", "A binary tree is a hierarchical structure where each node has at most two children."),
      createBlock("h2", "Types"),
      createBlock("bullet", "Full binary tree"),
      createBlock("bullet", "Complete binary tree"),
      createBlock("bullet", "Perfect binary tree"),
      { ...createBlock("callout", "Height of a balanced BST with n nodes is O(log n) — this is why lookups are fast.") },
      createBlock("code", "struct Node {\n  int data;\n  Node *left, *right;\n};"),
      { ...createBlock("todo", "Practice: implement level-order traversal"), checked: false },
      { ...createBlock("todo", "Re-derive height formula"), checked: true },
    ],
  },
  {
    ...createNote("sub-2"),
    id: "note-2",
    title: "Gradient Descent",
    blocks: [
      createBlock("p", "Optimization algorithm used to minimize loss."),
      createBlock("quote", "Follow the negative gradient — the direction of steepest descent."),
    ],
  },
];

// ── helpers ──────────────────────────────────────────────────
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function plainText(blocks) {
  return blocks
    .filter((b) => !["divider", "image"].includes(b.type))
    .map((b) => b.text || "")
    .join(" ")
    .trim();
}

function wordCount(blocks) {
  const t = plainText(blocks);
  return t ? t.split(/\s+/).length : 0;
}

// number for a numbered-list item = position within its contiguous run
function numberedIndex(blocks, index) {
  let n = 1;
  for (let i = index - 1; i >= 0; i--) {
    if (blocks[i].type === "numbered") n++;
    else break;
  }
  return n;
}

// ─────────────────────────────────────────────────────────────
// Slash menu — fixed-position, anchored to the block that opened
// it, clamped to the viewport (flips above when near the bottom),
// closes on scroll / outside click / Escape.
// ─────────────────────────────────────────────────────────────
function SlashMenu({ anchorRect, query, onSelect, onClose }) {
  const menuRef = useRef(null);
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_TYPES;
    return BLOCK_TYPES.filter(
      (b) => b.label.toLowerCase().includes(q) || b.type.includes(q)
    );
  }, [query]);

  useEffect(() => setActive(0), [query]);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (!items.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((p) => (p + 1) % items.length); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((p) => (p - 1 + items.length) % items.length); }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); onSelect(items[active].type); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [items, active, onSelect, onClose]);

  // outside click
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  if (!anchorRect) return null;

  // viewport-clamped placement
  const MENU_W = 288;
  const MENU_H = Math.min(items.length * 44 + 44, 340);
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top =
    spaceBelow > MENU_H + 12
      ? anchorRect.bottom + 6
      : Math.max(12, anchorRect.top - MENU_H - 6);
  const left = Math.min(Math.max(12, anchorRect.left), window.innerWidth - MENU_W - 12);

  return (
    <div
      ref={menuRef}
      className="notes-menu-in fixed z-1000 w-72 max-h-85 overflow-y-auto rounded-xl bg-[#15111c] border border-white/10 shadow-2xl shadow-black/60 p-1.5"
      style={{ top, left }}
    >
      <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/40">
        Insert block
      </p>
      {items.length === 0 && (
        <p className="px-2.5 py-3 text-sm text-white/40">No matches — press Esc</p>
      )}
      {items.map(({ type, label, icon: Icon, hint }, i) => (
        <button
          key={type}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => { e.preventDefault(); onSelect(type); }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
            i === active ? "bg-purple-500/15 text-white" : "text-white/75"
          }`}
        >
          <span className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${
            i === active ? "border-purple-400/40 bg-purple-500/10 text-purple-300" : "border-white/10 bg-white/5 text-white/50"
          }`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="flex-1 text-sm">{label}</span>
          <span className="text-[11px] text-white/30 font-mono">{hint}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Block context menu (opens from the grip): turn into / duplicate
// / delete. Same fixed+clamped positioning strategy.
// ─────────────────────────────────────────────────────────────
function BlockMenu({ anchorRect, onTurnInto, onDuplicate, onDelete, onClose }) {
  const menuRef = useRef(null);
  const [showTurnInto, setShowTurnInto] = useState(false);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!anchorRect) return null;

  const MENU_H = showTurnInto ? 480 : 140;
  const top = Math.min(anchorRect.top, window.innerHeight - MENU_H - 12);
  const left = Math.min(anchorRect.right + 8, window.innerWidth - 240 - 12);

  return (
    <div
      ref={menuRef}
      className="notes-menu-in fixed z-1000 w-60 rounded-xl bg-[#15111c] border border-white/10 shadow-2xl shadow-black/60 p-1.5"
      style={{ top, left }}
    >
      <button
        onClick={() => setShowTurnInto((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-white/75 hover:bg-white/5 hover:text-white transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5 text-white/50" />
        <span className="flex-1">Turn into</span>
        <ChevronRight className={`w-3.5 h-3.5 text-white/40 transition-transform ${showTurnInto ? "rotate-90" : ""}`} />
      </button>

      {showTurnInto && (
        <div className="ml-2 my-1 pl-2 border-l border-white/10 max-h-56 overflow-y-auto">
          {BLOCK_TYPES.filter((b) => !["image", "divider"].includes(b.type)).map(
            ({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => onTurnInto(type)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-white/40" />
                {label}
              </button>
            )
          )}
        </div>
      )}

      <button
        onClick={onDuplicate}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-white/75 hover:bg-white/5 hover:text-white transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-white/50" />
        Duplicate
      </button>
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-red-400/90 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// One editable block row. Controls (grip + add) appear on hover
// to the LEFT, Notion-style — nothing permanently on the right.
// ─────────────────────────────────────────────────────────────
function BlockRow({
  block,
  index,
  blocks,
  focusRequest,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onMove,
  onOpenSlash,
  onCloseSlash,
  onOpenBlockMenu,
  onAddBelow,
}) {
  const inputRef = useRef(null);
  const gripRef = useRef(null);

  // focus when requested (id + ts so repeated requests re-fire)
  useEffect(() => {
    if (focusRequest?.id === block.id && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value?.length ?? 0;
      inputRef.current.setSelectionRange?.(len, len);
    }
  }, [focusRequest, block.id]);

  const resize = (el) => {
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    resize(e.target);

    // markdown shortcuts — convert "## " etc. into the block type
    if (block.type === "p" && value.endsWith(" ")) {
      const token = value.slice(0, -1);
      const md = MD_SHORTCUTS.find((s) => s.match === token);
      if (md) {
        onChange({ ...block, type: md.type, text: "" });
        return;
      }
      if (token === "---") {
        onChange({ ...block, type: "divider", text: "" });
        return;
      }
      if (token === "```") {
        onChange({ ...block, type: "code", text: "" });
        return;
      }
    }

    onChange({ ...block, text: value });

    // slash menu — anchored to THIS textarea's live rect, so it
    // always opens exactly under the block regardless of scroll
    if (value.startsWith("/")) {
      const rect = e.target.getBoundingClientRect();
      onOpenSlash(block.id, rect, value.slice(1));
    } else {
      onCloseSlash();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && block.type !== "code" && !e.shiftKey) {
      // slash menu open? let it consume Enter (it listens in capture phase)
      if (block.text.startsWith("/")) return;
      e.preventDefault();
      // empty list item → exit list back to paragraph
      if (["bullet", "numbered", "todo"].includes(block.type) && !block.text) {
        onChange({ ...block, type: "p" });
        return;
      }
      const continuation = ["bullet", "numbered", "todo"].includes(block.type)
        ? block.type
        : "p";
      onEnter(block.id, continuation);
      return;
    }
    if (e.key === "Backspace" && !block.text) {
      e.preventDefault();
      onBackspaceEmpty(block.id);
      return;
    }
    if (e.altKey && e.key === "ArrowUp")   { e.preventDefault(); onMove(block.id, "up"); }
    if (e.altKey && e.key === "ArrowDown") { e.preventDefault(); onMove(block.id, "down"); }
    if (e.key === "Escape") onCloseSlash();
  };

  // ── left-side hover controls (shared by every block type) ──
  const controls = (
    <div className="absolute -left-14 top-1 flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity duration-150">
      <button
        type="button"
        title="Add block below"
        onClick={() => onAddBelow(block.id)}
        className="w-6 h-6 rounded-md flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        type="button"
        ref={gripRef}
        title="Block options (drag: Alt+↑/↓)"
        onClick={() => {
          const rect = gripRef.current.getBoundingClientRect();
          onOpenBlockMenu(block.id, rect);
        }}
        className="w-6 h-6 rounded-md flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 cursor-grab transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </button>
    </div>
  );

  // ── special renders ──
  if (block.type === "divider") {
    return (
      <div className="group/block relative py-3">
        {controls}
        <div className="h-px bg-white/10" />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="group/block relative py-1">
        {controls}
        {block.src ? (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white/2">
            <img src={block.src} alt="" className="block w-full max-h-105 object-cover" />
            <div className="px-3 py-2 border-t border-white/10">
              <button
                onClick={() => onChange({ ...block, src: "" })}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 min-h-40 rounded-xl border border-dashed border-white/15 bg-white/2 text-white/50 cursor-pointer hover:border-purple-400/40 hover:text-white/70 transition-colors">
            <ImagePlus className="w-6 h-6" />
            <span className="text-sm">Upload an image</span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChange({ ...block, src: URL.createObjectURL(f) });
              }}
            />
          </label>
        )}
      </div>
    );
  }

  // ── text-based blocks ──
  const typeStyles = {
    h1: "text-[2rem] font-bold leading-tight tracking-tight",
    h2: "text-2xl font-bold leading-snug tracking-tight",
    h3: "text-lg font-semibold leading-snug",
    p: "text-[15px] leading-[1.8]",
    bullet: "text-[15px] leading-[1.8]",
    numbered: "text-[15px] leading-[1.8]",
    todo: "text-[15px] leading-[1.8]",
    quote: "text-[15px] leading-[1.8] italic text-white/70",
    callout: "text-[15px] leading-[1.7]",
    code: "font-mono text-[13px] leading-[1.7]",
  };

  const placeholder = {
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    quote: "Quote",
    code: "Write code…",
    callout: "Write a callout…",
    todo: "To-do",
    bullet: "List item",
    numbered: "List item",
    p: "Type '/' for commands",
  }[block.type];

  const textarea = (
    <textarea
      ref={inputRef}
      rows={1}
      value={block.text}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={(e) => resize(e.target)}
      onKeyDown={handleKeyDown}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none placeholder-white/25 text-white ${typeStyles[block.type]} ${
        block.type === "todo" && block.checked ? "line-through text-white/40" : ""
      }`}
    />
  );

  // wrappers per type
  let body;
  if (block.type === "quote") {
    body = <div className="border-l-2 border-purple-400/70 pl-4">{textarea}</div>;
  } else if (block.type === "callout") {
    body = (
      <div className="flex gap-3 rounded-xl bg-purple-500/8 border border-purple-400/20 px-4 py-3">
        <Lightbulb className="w-4 h-4 text-purple-300 shrink-0 mt-1" />
        {textarea}
      </div>
    );
  } else if (block.type === "code") {
    body = (
      <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-3">
        {textarea}
      </div>
    );
  } else if (block.type === "bullet") {
    body = (
      <div className="flex gap-2">
        <span className="text-white/50 pt-0.75 select-none">•</span>
        {textarea}
      </div>
    );
  } else if (block.type === "numbered") {
    body = (
      <div className="flex gap-2">
        <span className="text-white/50 pt-0.5 text-sm w-5 text-right select-none">
          {numberedIndex(blocks, index)}.
        </span>
        {textarea}
      </div>
    );
  } else if (block.type === "todo") {
    body = (
      <div className="flex gap-2.5 items-start">
        <button
          type="button"
          onClick={() => onChange({ ...block, checked: !block.checked })}
          className={`mt-1.25w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${
            block.checked
              ? "bg-purple-500 border-purple-500"
              : "border-white/25 hover:border-purple-400"
          }`}
        >
          {block.checked && (
            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="2">
              <path d="M1 4l2.5 2.5L9 1" />
            </svg>
          )}
        </button>
        {textarea}
      </div>
    );
  } else {
    body = textarea;
  }

  return (
    <div className="group/block relative rounded-md px-1 -mx-1 hover:bg-white/2 transition-colors">
      {controls}
      {body}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Editor pane
// ─────────────────────────────────────────────────────────────
function Editor({ note, subject, onChange }) {
  const scrollRef = useRef(null);
  const [slash, setSlash] = useState({ blockId: null, anchorRect: null, query: "" });
  const [blockMenu, setBlockMenu] = useState({ blockId: null, anchorRect: null });
  const [focusRequest, setFocusRequest] = useState(null);

  const requestFocus = (id) => setFocusRequest({ id, ts: Date.now() });

  const update = (next) => onChange({ ...next, updatedAt: new Date().toISOString() });

  const updateBlock = (id, patch) =>
    update({ ...note, blocks: note.blocks.map((b) => (b.id === id ? patch : b)) });

  const insertAfter = (blockId, type = "p") => {
    const i = note.blocks.findIndex((b) => b.id === blockId);
    const nb = createBlock(type, "");
    const blocks = [...note.blocks];
    blocks.splice(i + 1, 0, nb);
    update({ ...note, blocks });
    requestFocus(nb.id);
  };

  const removeBlock = (blockId) => {
    if (note.blocks.length === 1) {
      updateBlock(blockId, { ...note.blocks[0], text: "", type: "p" });
      return;
    }
    const i = note.blocks.findIndex((b) => b.id === blockId);
    const fallback = note.blocks[i - 1] || note.blocks[i + 1];
    update({ ...note, blocks: note.blocks.filter((b) => b.id !== blockId) });
    if (fallback) requestFocus(fallback.id);
  };

  const moveBlock = (blockId, dir) => {
    const i = note.blocks.findIndex((b) => b.id === blockId);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= note.blocks.length) return;
    const blocks = [...note.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    update({ ...note, blocks });
    requestFocus(blockId);
  };

  const duplicateBlock = (blockId) => {
    const i = note.blocks.findIndex((b) => b.id === blockId);
    const copy = { ...note.blocks[i], id: makeId() };
    const blocks = [...note.blocks];
    blocks.splice(i + 1, 0, copy);
    update({ ...note, blocks });
  };

  // slash select: set type + strip the "/query" text
  const selectSlashType = useCallback(
    (type) => {
      const current = note.blocks.find((b) => b.id === slash.blockId);
      if (!current) return;
      updateBlock(current.id, {
        ...current,
        type,
        text: "",
        src: type === "image" ? current.src || "" : "",
      });
      setSlash({ blockId: null, anchorRect: null, query: "" });
      if (type !== "divider" && type !== "image") requestFocus(current.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.blocks, slash.blockId]
  );

  // close menus on editor scroll so they never drift from their block
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const close = () => {
      setSlash((s) => (s.blockId ? { blockId: null, anchorRect: null, query: "" } : s));
      setBlockMenu((m) => (m.blockId ? { blockId: null, anchorRect: null } : m));
    };
    el.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      el.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, []);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {/* cover */}
      {note.cover && (
        <div className="h-40 w-full" style={{ background: note.cover }} />
      )}

      <div className={`max-w-3xl mx-auto px-14 pb-32 ${note.cover ? "pt-8" : "pt-14"}`}>
        {/* title */}
        <input
          value={note.title}
          onChange={(e) => update({ ...note, title: e.target.value })}
          placeholder="Untitled"
          className="w-full bg-transparent outline-none text-[2.6rem] font-bold tracking-tight leading-tight text-white placeholder-white/20 mb-1"
        />
        <p className="text-xs text-white/35 mb-8">
          {subject?.emoji} {subject?.name} · {wordCount(note.blocks)} words · edited {relativeTime(note.updatedAt)}
        </p>

        {/* blocks */}
        <div className="flex flex-col gap-1">
          {note.blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              block={block}
              index={index}
              blocks={note.blocks}
              focusRequest={focusRequest}
              onChange={(nb) => updateBlock(block.id, nb)}
              onEnter={insertAfter}
              onBackspaceEmpty={removeBlock}
              onMove={moveBlock}
              onAddBelow={(id) => insertAfter(id, "p")}
              onOpenSlash={(blockId, anchorRect, query) =>
                setSlash({ blockId, anchorRect, query })
              }
              onCloseSlash={() =>
                setSlash((s) => (s.blockId ? { blockId: null, anchorRect: null, query: "" } : s))
              }
              onOpenBlockMenu={(blockId, anchorRect) =>
                setBlockMenu({ blockId, anchorRect })
              }
            />
          ))}
        </div>

        {/* add block */}
        <button
          onClick={() => {
            const nb = createBlock("p", "");
            update({ ...note, blocks: [...note.blocks, nb] });
            requestFocus(nb.id);
          }}
          className="mt-3 flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a block
        </button>
      </div>

      {slash.blockId && (
        <SlashMenu
          anchorRect={slash.anchorRect}
          query={slash.query}
          onSelect={selectSlashType}
          onClose={() => setSlash({ blockId: null, anchorRect: null, query: "" })}
        />
      )}

      {blockMenu.blockId && (
        <BlockMenu
          anchorRect={blockMenu.anchorRect}
          onTurnInto={(type) => {
            const b = note.blocks.find((x) => x.id === blockMenu.blockId);
            if (b) updateBlock(b.id, { ...b, type });
            setBlockMenu({ blockId: null, anchorRect: null });
          }}
          onDuplicate={() => {
            duplicateBlock(blockMenu.blockId);
            setBlockMenu({ blockId: null, anchorRect: null });
          }}
          onDelete={() => {
            removeBlock(blockMenu.blockId);
            setBlockMenu({ blockId: null, anchorRect: null });
          }}
          onClose={() => setBlockMenu({ blockId: null, anchorRect: null })}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [notes, setNotes] = useState(initialNotes);
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubjects[0].id);
  const [activeNoteId, setActiveNoteId] = useState(initialNotes[0].id);
  const [search, setSearch] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const coverMenuRef = useRef(null);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => n.subjectId === activeSubjectId)
      .filter((n) =>
        `${n.title} ${plainText(n.blocks)}`.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [notes, activeSubjectId, search]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || filteredNotes[0] || null;

  useEffect(() => {
    if (activeNote && activeNote.id !== activeNoteId) setActiveNoteId(activeNote.id);
  }, [activeNote, activeNoteId]);

  // close cover menu on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (coverMenuRef.current && !coverMenuRef.current.contains(e.target))
        setCoverMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const updateNote = (next) =>
    setNotes((prev) => prev.map((n) => (n.id === next.id ? next : n)));

  const addNote = () => {
    const n = createNote(activeSubjectId);
    setNotes((prev) => [n, ...prev]);
    setActiveNoteId(n.id);
  };

  const deleteNote = (id) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining.find((n) => n.subjectId === activeSubjectId)?.id || null);
    }
  };

  const toggleStar = (id) =>
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))
    );

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const s = {
      id: makeId(),
      name: newSubject.trim(),
      emoji: "📘",
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };
    setSubjects((prev) => [...prev, s]);
    setNewSubject("");
    setAddingSubject(false);
    setActiveSubjectId(s.id);
    const n = createNote(s.id);
    setNotes((prev) => [n, ...prev]);
    setActiveNoteId(n.id);
  };

  const deleteSubject = (id) => {
    const remainingSubjects = subjects.filter((s) => s.id !== id);
    const remainingNotes = notes.filter((n) => n.subjectId !== id);
    setSubjects(remainingSubjects);
    setNotes(remainingNotes);
    if (activeSubjectId === id) {
      const newActive = remainingSubjects[0]?.id || null;
      setActiveSubjectId(newActive);
      setActiveNoteId(remainingNotes.find((n) => n.subjectId === newActive)?.id || null);
    }
  };

  return (
    <div className="relative flex h-screen w-full bg-[#09050e] text-white overflow-hidden">
      <style>{`
        @keyframes notesMenuIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notesFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notes-menu-in { animation: notesMenuIn 0.12s ease-out both; }
        .notes-fade-up { animation: notesFadeUp 0.25s ease-out both; }
      `}</style>

      {/* ambient wash, consistent with AI Tutor page */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(168,85,247,0.08), transparent 60%)",
          }}
        />
      </div>

      {/* ── Sidebar: subjects ─────────────────────────────── */}
      <aside className="w-60 shrink-0 border-r border-white/10 bg-white/2 backdrop-blur-sm flex flex-col">
        <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-900/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">My Notes</p>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-purple-400/80 uppercase">
              Knowledge Base
            </p>
          </div>
        </div>

        <p className="px-4 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35">
          Subjects
        </p>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {subjects.map((s) => {
            const active = s.id === activeSubjectId;
            const count = notes.filter((n) => n.subjectId === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSubjectId(s.id);
                  setActiveNoteId(notes.find((n) => n.subjectId === s.id)?.id || null);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  active
                    ? "bg-purple-500/15 border border-purple-400/30 text-white"
                    : "border border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-sm">{s.emoji}</span>
                <span className="flex-1 text-sm truncate">{s.name}</span>
                <span className="text-[11px] text-white/35">{count}</span>
                <span
                  role="button"
                  tabIndex={0}
                  title="Delete subject"
                  onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), deleteSubject(s.id))}
                  className="w-6 h-6 ml-1 rounded-md flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}

          {addingSubject ? (
            <div className="px-1 pt-2">
              <input
                autoFocus
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubject();
                  if (e.key === "Escape") setAddingSubject(false);
                }}
                placeholder="Subject name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none placeholder-white/30 focus:border-purple-400/50"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  onClick={addSubject}
                  className="flex-1 rounded-lg bg-purple-600 hover:bg-purple-500 py-1.5 text-sm transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingSubject(false)}
                  className="w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubject(true)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg text-left text-sm text-white/45 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New subject
            </button>
          )}
        </div>
      </aside>

      {/* ── Notes list ─────────────────────────────────────── */}
      <section className="w-72 shrink-0 border-r border-white/10 flex flex-col">
        <div className="px-4 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: activeSubject?.color || "#a855f7" }}
              />
              <h2 className="text-sm font-semibold">{activeSubject?.name || "Notes"}</h2>
            </div>
            <button
              onClick={addNote}
              title="New note"
              className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-md shadow-purple-900/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm outline-none placeholder-white/30 focus:border-purple-400/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <FileText className="w-6 h-6 text-white/20" />
              <p className="text-sm text-white/40">No notes here yet</p>
              <button
                onClick={addNote}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Create one
              </button>
            </div>
          ) : (
            filteredNotes.map((n, i) => {
              const selected = n.id === activeNote?.id;
              const snippet = plainText(n.blocks).slice(0, 80);
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                  className={`notes-fade-up group/card w-full text-left rounded-xl px-3 py-2.5 mb-1 border transition-colors ${
                    selected
                      ? "bg-purple-500/10 border-purple-400/30"
                      : "border-transparent hover:bg-white/4"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {n.starred && (
                          <Star className="w-3 h-3 shrink-0 fill-purple-400 text-purple-400" />
                        )}
                        <p className="text-sm font-medium truncate">
                          {n.title || "Untitled"}
                        </p>
                      </div>
                      <p className="text-xs text-white/45 mt-1 line-clamp-2 leading-relaxed">
                        {snippet || "Empty note"}
                      </p>
                      <p className="text-[11px] text-white/30 mt-1.5">
                        {relativeTime(n.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <span
                        role="button"
                        tabIndex={0}
                        title={n.starred ? "Unstar" : "Star"}
                        onClick={(e) => { e.stopPropagation(); toggleStar(n.id); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), toggleStar(n.id))}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-purple-300 hover:bg-white/10 transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${n.starred ? "fill-purple-400 text-purple-400" : ""}`} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        title="Delete note"
                        onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), deleteNote(n.id))}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* ── Editor ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <>
            {/* toolbar */}
            <div className="h-13 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/1.5kdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[13px] text-white/50 min-w-0">
                <span className="shrink-0">
                  {activeSubject?.emoji} {activeSubject?.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/30" />
                <span className="text-white/90 font-medium truncate">
                  {activeNote.title || "Untitled"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-white/30 hidden sm:block">
                  Saved {relativeTime(activeNote.updatedAt)}
                </span>

                <button
                  onClick={() => toggleStar(activeNote.id)}
                  title={activeNote.starred ? "Unstar" : "Star"}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-purple-300 hover:bg-white/10 transition-colors"
                >
                  <Star className={`w-4 h-4 ${activeNote.starred ? "fill-purple-400 text-purple-400" : ""}`} />
                </button>

                <div className="relative" ref={coverMenuRef}>
                  <button
                    onClick={() => setCoverMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 h-8 rounded-lg bg-white/5 border border-white/10 px-3 text-[13px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cover
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {coverMenuOpen && (
                    <div className="notes-menu-in absolute right-0 top-10 z-30 grid grid-cols-4 gap-2 rounded-xl bg-[#15111c] border border-white/10 shadow-2xl shadow-black/60 p-2.5">
                      {COVERS.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            updateNote({ ...activeNote, cover: c, updatedAt: new Date().toISOString() });
                            setCoverMenuOpen(false);
                          }}
                          className={`w-11 h-11 rounded-lg border transition-transform hover:scale-105 ${
                            activeNote.cover === c ? "border-purple-400" : "border-white/10"
                          }`}
                          style={{ background: c || "#09050e" }}
                        >
                          {!c && <X className="w-3.5 h-3.5 m-auto text-white/40" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Editor note={activeNote} subject={activeSubject} onChange={updateNote} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white/70 font-medium">No note selected</p>
            <p className="text-sm text-white/40">Pick a note from the list, or create a new one.</p>
            <button
              onClick={addNote}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm transition-colors shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              New note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}