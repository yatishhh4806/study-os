// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import {
  Pencil,
  Check,
  X,
  Camera,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flame,
  Clock,
  TrendingUp,
  BookMarked,
  Shield,
  Bell,
  KeyRound,
} from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Reusable field: shows plain text normally, an input when editing.
function Field({ label, value, editing, onChange, icon: Icon, type = "text" }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
        />
      ) : (
        <p className="text-sm text-white/90">{value || "—"}</p>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <Icon className="w-4 h-4 text-purple-400" />
      <div>
        <p className="text-sm font-semibold text-white leading-none">{value}</p>
        <p className="text-[11px] text-white/40 mt-1">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-white mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function Profile() {
  const { profileData, loading, updateProfile } = useProfileData();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileData) setDraft(profileData);
  }, [profileData]);

  if (loading || !draft) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-white/40 text-sm">
        Loading profile...
      </div>
    );
  }

  function updateField(path, value) {
    setDraft((prev) => {
      const next = { ...prev };
      if (path.includes(".")) {
        const [parent, child] = path.split(".");
        next[parent] = { ...prev[parent], [child]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    await updateProfile(draft);
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(profileData);
    setIsEditing(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          {draft.avatarUrl ? (
            <img
              src={draft.avatarUrl}
              alt={draft.name}
              className="w-20 h-20 rounded-2xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl font-semibold">
              {getInitials(draft.name)}
            </div>
          )}
          {isEditing && (
            <button
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-purple-600 border-2 border-[#0b0a0e] flex items-center justify-center hover:bg-purple-500 transition-colors"
              title="Change photo (backend not connected yet)"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <input
              value={draft.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="text-xl font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white w-full max-w-xs focus:outline-none focus:border-purple-400/50"
            />
          ) : (
            <h1 className="text-xl font-semibold text-white">{draft.name}</h1>
          )}
          <p className="text-sm text-white/50 mt-1">
            {draft.academic?.course} · {draft.academic?.university}
          </p>
          <p className="text-xs text-white/30 mt-1">
            Member since {formatDate(draft.stats?.joinedOn)}
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-purple-500/10 hover:border-purple-400/40 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Flame} value={`${draft.stats?.streak}d`} label="Streak" />
        <StatPill icon={Clock} value={`${draft.stats?.studyHours}h`} label="Study Hours" />
        <StatPill icon={TrendingUp} value={`${draft.stats?.productivity}%`} label="Productivity" />
        <StatPill icon={BookMarked} value={draft.stats?.subjectsTracked} label="Subjects Tracked" />
      </div>

      {/* Academic Info */}
      <SectionCard title="Academic Information">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="University"
            icon={GraduationCap}
            value={draft.academic?.university}
            editing={isEditing}
            onChange={(v) => updateField("academic.university", v)}
          />
          <Field
            label="Course"
            icon={BookMarked}
            value={draft.academic?.course}
            editing={isEditing}
            onChange={(v) => updateField("academic.course", v)}
          />
          <Field
            label="Year"
            value={draft.academic?.year}
            editing={isEditing}
            onChange={(v) => updateField("academic.year", v)}
          />
          <Field
            label="Semester"
            value={draft.academic?.semester}
            editing={isEditing}
            onChange={(v) => updateField("academic.semester", v)}
          />
          <Field
            label="Enrollment No."
            value={draft.academic?.enrollmentNo}
            editing={isEditing}
            onChange={(v) => updateField("academic.enrollmentNo", v)}
          />
          <Field
            label="Expected Graduation"
            value={draft.academic?.expectedGraduation}
            editing={isEditing}
            onChange={(v) => updateField("academic.expectedGraduation", v)}
          />
        </div>
      </SectionCard>

      {/* Personal Info */}
      <SectionCard title="Personal Information">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Email"
            icon={Mail}
            value={draft.email}
            editing={isEditing}
            type="email"
            onChange={(v) => updateField("email", v)}
          />
          <Field
            label="Phone"
            icon={Phone}
            value={draft.phone}
            editing={isEditing}
            onChange={(v) => updateField("phone", v)}
          />
          <Field
            label="Date of Birth"
            icon={Calendar}
            value={draft.dob}
            editing={isEditing}
            type="date"
            onChange={(v) => updateField("dob", v)}
          />
          <Field
            label="Location"
            icon={MapPin}
            value={draft.location}
            editing={isEditing}
            onChange={(v) => updateField("location", v)}
          />
        </div>

        <div className="mt-5">
          <label className="text-xs text-white/40 mb-1.5 block">Bio</label>
          {isEditing ? (
            <textarea
              value={draft.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
            />
          ) : (
            <p className="text-sm text-white/70 leading-relaxed">{draft.bio}</p>
          )}
        </div>
      </SectionCard>

      {/* Account & Security — placeholders until backend/auth exists */}
      <SectionCard title="Account & Security">
        <div className="space-y-1">
          <button
            disabled
            title="Available once backend is connected"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="flex items-center gap-3 text-sm text-white/80">
              <KeyRound className="w-4 h-4" />
              Change password
            </span>
            <span className="text-xs text-white/30">Coming soon</span>
          </button>
          <button
            disabled
            title="Available once backend is connected"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="flex items-center gap-3 text-sm text-white/80">
              <Bell className="w-4 h-4" />
              Notification preferences
            </span>
            <span className="text-xs text-white/30">Coming soon</span>
          </button>
          <button
            disabled
            title="Available once backend is connected"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="flex items-center gap-3 text-sm text-white/80">
              <Shield className="w-4 h-4" />
              Two-factor authentication
            </span>
            <span className="text-xs text-white/30">Coming soon</span>
          </button>
        </div>
      </SectionCard>
    </div>
  );
}