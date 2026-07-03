import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Star,
  StarOff,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Hash,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  FileText,
  BookOpen,
  X,
  MoreHorizontal,
} from "lucide-react";

// Updated to match the dark purple aesthetic from the dashboard
const COLORS = {
  bg: "#09050e", // Deepest background
  panel: "#12091c", // Slightly elevated elements
  border: "#2a1b38", // Subtle purple-tinted borders
  text: "#ffffff", // Main crisp text
  muted: "#a79db5", // Secondary text
  faint: "#6d5f7a", // Tertiary/faint text
  hover: "#1e112d", // Hover states
  primary: "#a855f7", // Vibrant purple accent
  primarySoft: "#2a1744", // Selected state background
};

const HIGHLIGHT_COLORS = [
  { label: "Purple", bg: "rgba(168,85,247,0.35)", border: "#a855f7" },
  { label: "Cyan", bg: "rgba(34,211,238,0.3)", border: "#22d3ee" },
  { label: "Pink", bg: "rgba(244,114,182,0.3)", border: "#f472b6" },
  { label: "Yellow", bg: "rgba(250,204,21,0.3)", border: "#facc15" },
  { label: "Green", bg: "rgba(52,211,153,0.3)", border: "#34d399" },
  { label: "Red", bg: "rgba(248,113,113,0.3)", border: "#f87171" },
];

const STICKY_COLORS = [
  { bg: "rgba(250,204,21,0.18)", border: "#facc15", text: "#fef9c3" },
  { bg: "rgba(168,85,247,0.18)", border: "#a855f7", text: "#ede9fe" },
  { bg: "rgba(244,114,182,0.18)", border: "#f472b6", text: "#fce7f3" },
  { bg: "rgba(34,211,238,0.18)", border: "#22d3ee", text: "#cffafe" },
  { bg: "rgba(52,211,153,0.18)", border: "#34d399", text: "#d1fae5" },
];

const SUBJECT_COLORS = [
  "#a855f7",
  "#22d3ee",
  "#f472b6",
  "#fb923c",
  "#34d399",
  "#facc15",
  "#60a5fa",
  "#f87171",
];

const BLOCK_TYPES = [
  { type: "h1", label: "Heading 1", icon: <Hash size={14} /> },
  { type: "h2", label: "Heading 2", icon: <Hash size={12} /> },
  { type: "h3", label: "Heading 3", icon: <Hash size={10} /> },
  { type: "p", label: "Text", icon: <FileText size={14} /> },
  { type: "bullet", label: "Bulleted list", icon: <List size={14} /> },
  { type: "numbered", label: "Numbered list", icon: <ListOrdered size={14} /> },
  { type: "quote", label: "Quote", icon: <Quote size={14} /> },
  { type: "code", label: "Code", icon: <Code2 size={14} /> },
  { type: "divider", label: "Divider", icon: <Minus size={14} /> },
  { type: "image", label: "Image", icon: <ImagePlus size={14} /> },
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
});

const createNote = (subjectId) => ({
  id: makeId(),
  subjectId,
  title: "Untitled",
  starred: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cover: "",
  blocks: [createBlock("p", "")],
});

const initialSubjects = [
  {
    id: "sub-1",
    name: "Data Structures",
    emoji: "🌲",
    color: SUBJECT_COLORS[0],
  },
  {
    id: "sub-2",
    name: "Machine Learning",
    emoji: "🤖",
    color: SUBJECT_COLORS[1],
  },
  {
    id: "sub-3",
    name: "Web Development",
    emoji: "🌐",
    color: SUBJECT_COLORS[2],
  },
];

const initialNotes = [
  {
    ...createNote("sub-1"),
    id: "note-1",
    title: "Binary Trees",
    starred: true,
    blocks: [
      createBlock("h1", "Binary Trees"),
      createBlock(
        "p",
        "A binary tree is a hierarchical structure where each node has at most two children."
      ),
      createBlock("h2", "Types"),
      createBlock("bullet", "Full binary tree"),
      createBlock("bullet", "Complete binary tree"),
      createBlock("bullet", "Perfect binary tree"),
      createBlock(
        "code",
        "struct Node {\n  int data;\n  Node *left, *right;\n};"
      ),
    ],
  },
  {
    ...createNote("sub-2"),
    id: "note-2",
    title: "Gradient Descent",
    blocks: [createBlock("p", "Optimization algorithm used to minimize loss.")],
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function plainTextFromBlocks(blocks) {
  return blocks
    .filter((b) => b.type !== "divider" && b.type !== "image")
    .map((b) => b.text || "")
    .join(" ")
    .trim();
}

function subjectCount(notes, id) {
  return notes.filter((n) => n.subjectId === id).length;
}

function SlashMenu({ query, position, onSelect, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCK_TYPES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => {
      if (!items.length) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((p) => (p + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((p) => (p - 1 + items.length) % items.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(items[activeIndex].type);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, activeIndex, onClose, onSelect]);

  if (!items.length || !position) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: position.y + 28,
        left: position.x,
        width: 260,
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        boxShadow: "0 12px 36px rgba(0,0,0,.4)",
        padding: 8,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.faint,
          padding: "6px 8px",
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}
      >
        Insert block
      </div>

      {items.map((item, index) => (
        <button
          key={item.type}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item.type);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: activeIndex === index ? COLORS.hover : "transparent",
            color: COLORS.text,
            textAlign: "left",
          }}
        >
          <span style={{ color: COLORS.muted, display: "flex" }}>
            {item.icon}
          </span>
          <span style={{ fontSize: 14 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function BlockRow({
  block,
  index,
  totalBlocks,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onMove,
  onDelete,
  onOpenSlash,
  autoFocus,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value?.length ?? 0;
      inputRef.current.setSelectionRange?.(len, len);
    }
  }, [autoFocus]);

  const baseInputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: COLORS.text,
    resize: "none",
    padding: 0,
    margin: 0,
    fontFamily:
      block.type === "code"
        ? "'JetBrains Mono', 'Fira Code', monospace"
        : "Inter, ui-sans-serif, system-ui, sans-serif",
  };

  const sharedKeyDown = (e) => {
    if (e.key === "Enter" && block.type !== "code" && !e.shiftKey) {
      e.preventDefault();
      onEnter(
        block.id,
        block.type === "bullet" || block.type === "numbered" ? block.type : "p"
      );
      return;
    }

    if (e.key === "Backspace" && !block.text) {
      e.preventDefault();
      onBackspaceEmpty(block.id);
      return;
    }

    if (e.key === "/" && !block.text) {
      const rect = e.currentTarget.getBoundingClientRect();
      requestAnimationFrame(() => {
        onOpenSlash(block.id, { x: rect.left + 44, y: rect.top + 8 }, "");
      });
    }

    if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      onMove(block.id, "up");
    }

    if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      onMove(block.id, "down");
    }
  };

  if (block.type === "divider") {
    return (
      <div
        style={{
          padding: "14px 0",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => onDelete(block.id)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: COLORS.faint,
            padding: 4,
          }}
          title="Delete block"
        >
          <Trash2 size={14} />
        </button>
        <div style={{ height: 1, background: COLORS.border, flex: 1 }} />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          padding: "4px 0",
        }}
      >
        <div style={{ width: 28, paddingTop: 10, color: COLORS.faint }}>
          <GripVertical size={16} />
        </div>
        <div style={{ flex: 1 }}>
          {block.src ? (
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                overflow: "hidden",
                background: COLORS.panel,
              }}
            >
              <img
                src={block.src}
                alt="Uploaded note"
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                }}
              />
              <div
                style={{ padding: 10, borderTop: `1px solid ${COLORS.border}` }}
              >
                <button
                  onClick={() => onChange({ ...block, src: "" })}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bg,
                    color: COLORS.text,
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                minHeight: 180,
                border: `1px dashed ${COLORS.border}`,
                borderRadius: 14,
                background: COLORS.panel,
                cursor: "pointer",
                color: COLORS.muted,
              }}
            >
              <ImagePlus size={28} />
              <span style={{ fontSize: 14 }}>Upload an image</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    onChange({ ...block, src: URL.createObjectURL(file) });
                }}
              />
            </label>
          )}
        </div>
      </div>
    );
  }

  const prefix =
    block.type === "bullet" ? (
      <div
        style={{ width: 22, paddingTop: 10, color: COLORS.muted, fontSize: 18 }}
      >
        •
      </div>
    ) : block.type === "numbered" ? (
      <div
        style={{ width: 22, paddingTop: 10, color: COLORS.muted, fontSize: 14 }}
      >
        {index + 1}.
      </div>
    ) : null;

  const textAreaStyle =
    block.type === "h1"
      ? { fontSize: 40, fontWeight: 700, lineHeight: 1.15, minHeight: 48 }
      : block.type === "h2"
      ? { fontSize: 30, fontWeight: 700, lineHeight: 1.2, minHeight: 38 }
      : block.type === "h3"
      ? { fontSize: 22, fontWeight: 600, lineHeight: 1.3, minHeight: 32 }
      : block.type === "quote"
      ? {
          fontSize: 16,
          lineHeight: 1.8,
          minHeight: 32,
          fontStyle: "italic",
          borderLeft: `3px solid ${COLORS.primary}`,
          paddingLeft: 14,
          color: COLORS.muted,
        }
      : block.type === "code"
      ? {
          fontSize: 14,
          lineHeight: 1.7,
          minHeight: 84,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: 14,
        }
      : { fontSize: 16, lineHeight: 1.8, minHeight: 32 };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "2px 0",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          width: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 8,
          color: COLORS.faint,
        }}
        title="Alt + ↑ / Alt + ↓ to move"
      >
        <GripVertical size={16} />
      </div>

      {prefix}

      <textarea
        ref={inputRef}
        value={block.text}
        rows={1}
        placeholder={
          block.type === "h1"
            ? "Heading 1"
            : block.type === "h2"
            ? "Heading 2"
            : block.type === "h3"
            ? "Heading 3"
            : block.type === "quote"
            ? "Quote"
            : block.type === "code"
            ? "Write code…"
            : "Type '/' for commands"
        }
        onChange={(e) => {
          onChange({ ...block, text: e.target.value });
          const value = e.target.value;
          if (value.startsWith("/")) {
            const rect = e.currentTarget.getBoundingClientRect();
            onOpenSlash(
              block.id,
              { x: rect.left + 32, y: rect.top + 8 },
              value.slice(1)
            );
          } else {
            onOpenSlash(null, null, "");
          }
          e.target.style.height = "0px";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onFocus={(e) => {
          e.target.style.height = "0px";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={sharedKeyDown}
        style={{
          ...baseInputStyle,
          ...textAreaStyle,
          overflow: "hidden",
        }}
      />

      <div style={{ display: "flex", gap: 4, paddingTop: 6 }}>
        <button
          onClick={() => onMove(block.id, "up")}
          disabled={index === 0}
          style={miniButton(index === 0)}
          title="Move up"
        >
          ↑
        </button>
        <button
          onClick={() => onMove(block.id, "down")}
          disabled={index === totalBlocks - 1}
          style={miniButton(index === totalBlocks - 1)}
          title="Move down"
        >
          ↓
        </button>
        <button
          onClick={() => onDelete(block.id)}
          style={miniButton(false)}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function miniButton(disabled) {
  return {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `1px solid ${disabled ? "transparent" : COLORS.border}`,
    background: disabled ? "transparent" : COLORS.panel,
    color: disabled ? COLORS.faint : COLORS.muted,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };
}

function Editor({ note, onChange }) {
  const [slash, setSlash] = useState({
    blockId: null,
    position: null,
    query: "",
  });
  const [focusBlockId, setFocusBlockId] = useState(null);

  const updateNote = (next) =>
    onChange({
      ...next,
      updatedAt: new Date().toISOString(),
    });

  const updateBlock = (id, patch) => {
    updateNote({
      ...note,
      blocks: note.blocks.map((b) => (b.id === id ? patch : b)),
    });
  };

  const insertAfter = (blockId, type = "p") => {
    const index = note.blocks.findIndex((b) => b.id === blockId);
    const nextBlock = createBlock(type, "");
    const nextBlocks = [...note.blocks];
    nextBlocks.splice(index + 1, 0, nextBlock);

    updateNote({ ...note, blocks: nextBlocks });
    setFocusBlockId(nextBlock.id);
  };

  const removeBlock = (blockId) => {
    if (note.blocks.length === 1) {
      updateBlock(blockId, { ...note.blocks[0], text: "", type: "p" });
      return;
    }

    const index = note.blocks.findIndex((b) => b.id === blockId);
    const fallback = note.blocks[index - 1] || note.blocks[index + 1];

    updateNote({
      ...note,
      blocks: note.blocks.filter((b) => b.id !== blockId),
    });

    if (fallback) setFocusBlockId(fallback.id);
  };

  const moveBlock = (blockId, direction) => {
    const index = note.blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= note.blocks.length) return;

    const next = [...note.blocks];
    [next[index], next[target]] = [next[target], next[index]];
    updateNote({ ...note, blocks: next });
    setFocusBlockId(blockId);
  };

  const selectSlashType = (type) => {
    const current = note.blocks.find((b) => b.id === slash.blockId);
    if (!current) return;

    const cleaned = current.text.startsWith("/") ? "" : current.text;
    updateBlock(current.id, {
      ...current,
      type,
      text: type === "divider" || type === "image" ? "" : cleaned,
      src: type === "image" ? current.src || "" : "",
    });

    setSlash({ blockId: null, position: null, query: "" });
    setFocusBlockId(current.id);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      {note.cover && (
        <div
          style={{
            height: 160,
            background: note.cover,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        />
      )}

      <div
        style={{
          maxWidth: 840,
          margin: "0 auto",
          padding: note.cover ? "24px 48px 96px" : "52px 48px 96px",
        }}
      >
        <input
          value={note.title}
          onChange={(e) =>
            updateNote({
              ...note,
              title: e.target.value,
            })
          }
          placeholder="Untitled"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: 46,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: COLORS.text,
            marginBottom: 24,
            background: "transparent",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {note.blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              block={block}
              index={index}
              totalBlocks={note.blocks.length}
              autoFocus={focusBlockId === block.id}
              onChange={(nextBlock) => updateBlock(block.id, nextBlock)}
              onEnter={insertAfter}
              onBackspaceEmpty={removeBlock}
              onMove={moveBlock}
              onDelete={removeBlock}
              onOpenSlash={(blockId, position, query) =>
                setSlash({ blockId, position, query })
              }
            />
          ))}
        </div>

        <button
          onClick={() => {
            const block = createBlock("p", "");
            updateNote({ ...note, blocks: [...note.blocks, block] });
            setFocusBlockId(block.id);
          }}
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            color: COLORS.faint,
            cursor: "pointer",
            fontSize: 14,
            padding: "8px 4px",
          }}
        >
          <Plus size={14} />
          Add a block
        </button>
      </div>

      <SlashMenu
        query={slash.query}
        position={slash.position}
        onSelect={selectSlashType}
        onClose={() => setSlash({ blockId: null, position: null, query: "" })}
      />
    </div>
  );
}

export default function NotesPage() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [notes, setNotes] = useState(initialNotes);
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubjects[0].id);
  const [activeNoteId, setActiveNoteId] = useState(initialNotes[0].id);
  const [search, setSearch] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => n.subjectId === activeSubjectId)
      .filter((n) => {
        const hay = `${n.title} ${plainTextFromBlocks(n.blocks)}`.toLowerCase();
        return hay.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [notes, activeSubjectId, search]);

  const activeNote =
    notes.find((n) => n.id === activeNoteId) || filteredNotes[0] || null;

  useEffect(() => {
    if (activeNote && activeNote.id !== activeNoteId) {
      setActiveNoteId(activeNote.id);
    }
  }, [activeNote, activeNoteId]);

  const updateNote = (nextNote) => {
    setNotes((prev) => prev.map((n) => (n.id === nextNote.id ? nextNote : n)));
  };

  const addNote = () => {
    const note = createNote(activeSubjectId);
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
  };

  const deleteNote = (id) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);

    if (activeNoteId === id) {
      const next =
        remaining.find((n) => n.subjectId === activeSubjectId) || null;
      setActiveNoteId(next?.id || null);
    }
  };

  const toggleStar = (id) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, starred: !n.starred, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const subject = {
      id: makeId(),
      name: newSubject.trim(),
      emoji: "📘",
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };
    setSubjects((prev) => [...prev, subject]);
    setNewSubject("");
    setAddingSubject(false);
    setActiveSubjectId(subject.id);

    const note = createNote(subject.id);
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
  };

  // Updated gradients to look good in dark mode
  const coverOptions = [
    "",
    "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
    "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
    "linear-gradient(135deg, #831843 0%, #9d174d 100%)",
    "linear-gradient(135deg, #312e81 0%, #3730a3 100%)",
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 250,
          borderRight: `1px solid ${COLORS.border}`,
          background: COLORS.panel,
          display: "flex",
          flexDirection: "column",
          padding: 14,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 8px 14px",
          }}
        >
          <BookOpen size={18} />
          <div style={{ fontSize: 15, fontWeight: 700 }}>My Notes</div>
        </div>

        <div
          style={{
            fontSize: 11,
            color: COLORS.faint,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            padding: "8px 8px 6px",
          }}
        >
          Subjects
        </div>

        {subjects.map((subject) => {
          const active = subject.id === activeSubjectId;
          return (
            <button
              key={subject.id}
              onClick={() => {
                setActiveSubjectId(subject.id);
                const next = notes.find((n) => n.subjectId === subject.id);
                setActiveNoteId(next?.id || null);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "none",
                background: active ? COLORS.primarySoft : "transparent",
                borderRadius: 10,
                padding: "10px 10px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: active ? `inset 0 0 0 1px ${COLORS.primary}` : "none",
              }}
            >
              <span>{subject.emoji}</span>
              <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>
                {subject.name}
              </span>
              <span style={{ fontSize: 12, color: COLORS.faint }}>
                {subjectCount(notes, subject.id)}
              </span>
            </button>
          );
        })}

        {addingSubject ? (
          <div style={{ padding: 8 }}>
            <input
              autoFocus
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addSubject();
                if (e.key === "Escape") setAddingSubject(false);
              }}
              placeholder="New subject"
              style={{
                width: "100%",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                outline: "none",
                background: COLORS.bg,
                color: COLORS.text,
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={addSubject}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 12px",
                  background: COLORS.primary,
                  color: "#fff", // Keeping this explicit white for button contrast
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setAddingSubject(false)}
                style={{
                  width: 42,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  background: COLORS.bg,
                  color: COLORS.text,
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingSubject(true)}
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              background: "transparent",
              color: COLORS.muted,
              padding: "10px 10px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Plus size={14} />
            New subject
          </button>
        )}
      </div>

      <div
        style={{
          width: 320,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          background: COLORS.bg,
        }}
      >
        <div
          style={{ padding: 16, borderBottom: `1px solid ${COLORS.border}` }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: activeSubject?.color || COLORS.primary,
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {activeSubject?.name || "Notes"}
              </div>
            </div>

            <button
              onClick={addNote}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.panel,
                color: COLORS.text,
                cursor: "pointer",
              }}
            >
              <Plus size={15} />
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.faint,
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes"
              style={{
                width: "100%",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "10px 12px 10px 32px",
                outline: "none",
                background: COLORS.panel,
                color: COLORS.text,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {filteredNotes.length === 0 ? (
            <div
              style={{
                padding: 28,
                color: COLORS.faint,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              No notes found.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const selected = note.id === activeNote?.id;
              const snippet = plainTextFromBlocks(note.blocks).slice(0, 90);

              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    cursor: "pointer",
                    background: selected ? COLORS.primarySoft : "transparent",
                    border: `1px solid ${selected ? COLORS.primary : "transparent"}`,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {note.title || "Untitled"}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: COLORS.muted,
                          marginTop: 4,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {snippet || "No content yet"}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: COLORS.faint,
                          marginTop: 6,
                        }}
                      >
                        Edited {formatDate(note.updatedAt)}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(note.id);
                        }}
                        style={iconButtonStyle()}
                      >
                        {note.starred ? (
                          <Star size={14} fill="#a855f7" color="#a855f7" />
                        ) : (
                          <StarOff size={14} color={COLORS.faint} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        style={iconButtonStyle()}
                      >
                        <Trash2 size={14} color={COLORS.faint} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {activeNote ? (
          <>
            <div
              style={{
                height: 56,
                borderBottom: `1px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                justifyContent: "space-between",
                background: COLORS.bg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: COLORS.muted,
                  minWidth: 0,
                }}
              >
                <span>
                  {activeSubject?.emoji} {activeSubject?.name}
                </span>
                <ChevronRight size={14} />
                <span
                  style={{
                    color: COLORS.text,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {activeNote.title || "Untitled"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: COLORS.faint }}>
                  Saved {formatDate(activeNote.updatedAt)}
                </span>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowCoverMenu((p) => !p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.panel,
                      color: COLORS.text,
                      borderRadius: 10,
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Cover
                    <ChevronDown size={14} />
                  </button>

                  {showCoverMenu && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 42,
                        background: COLORS.panel,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 12,
                        boxShadow: "0 12px 36px rgba(0,0,0,.4)",
                        padding: 10,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 44px)",
                        gap: 8,
                        zIndex: 1000,
                      }}
                    >
                      {coverOptions.map((cover, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            updateNote({ ...activeNote, cover });
                            setShowCoverMenu(false);
                          }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: `1px solid ${COLORS.border}`,
                            background: cover || COLORS.bg,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {!cover ? <X size={14} color={COLORS.faint} /> : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button style={iconButtonStyle()}>
                  <MoreHorizontal size={16} color={COLORS.muted} />
                </button>
              </div>
            </div>

            <Editor note={activeNote} onChange={updateNote} />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              color: COLORS.faint,
              fontSize: 15,
            }}
          >
            Select or create a note
          </div>
        )}
      </div>
    </div>
  );
}

function iconButtonStyle() {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };
}