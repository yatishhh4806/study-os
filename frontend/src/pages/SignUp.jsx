import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import AuthHero from "../components/AuthHero/AuthHero";
import { useAuth } from "../context/AuthContext";
import { api, BASE_URL } from "../lib/api";

const COLLEGE_COURSES = [
  "B.Tech",
  "BBA",
  "BCA",
  "B.Sc",
  "B.Com",
  "BA",
  "MBA",
  "M.Tech",
  "M.Sc",
  "MCA",
  "PhD",
];
const SCHOOL_CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SCHOOL_STREAMS = ["PCM", "PCB", "PCMB", "Commerce", "Humanities", "Arts"];
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const isSchool = (type) => type === "School";

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ color: "#f87171", fontSize: 12, marginTop: 5 }}>{msg}</p>;
}

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If GitHub's callback failed, our backend redirects here with
  // ?error=... so the person sees why instead of a silent failure.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setErrors((prev) => ({ ...prev, form: oauthError }));
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institutionType: "College / University",
    institutionName: "",
    course: "B.Tech",
    branch: "",
    year: "1st Year",
    semester: "Semester 1",
    schoolClass: "Class 11",
    stream: "PCM",
    board: "CBSE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      e.password = "Password is required.";
    } else if (formData.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.institutionName.trim())
      e.institutionName = "Institution name is required.";
    if (!isSchool(formData.institutionType) && !formData.branch.trim()) {
      e.branch = "Branch / Stream is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, form: "" }));

    try {
      await register(formData.fullName.trim(), formData.email.trim(), formData.password);

      const profilePayload = {
        institutionType: formData.institutionType,
        institutionName: formData.institutionName.trim(),
        ...(isSchool(formData.institutionType)
          ? {
              schoolClass: formData.schoolClass,
              stream: formData.stream,
              board: formData.board,
            }
          : {
              course: formData.course,
              branch: formData.branch.trim(),
              year: formData.year,
              semester: formData.semester,
            }),
      };

      try {
        await api.patch("/auth/profile", profilePayload);
      } catch (profileErr) {
        console.error("Account created, but saving academic profile failed:", profileErr);
      }

      navigate("/dashboard");
    } catch (err) {
      setStep(1);
      setErrors((prev) => ({
        ...prev,
        form: err.response?.data?.error || "Couldn't create your account. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrors((prev) => ({ ...prev, form: "" }));
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        // Google users skip the academic-profile step for now — they can
        // fill it in later from the Profile page. Sending them straight
        // to /dashboard avoids forcing step 2 on a flow that didn't
        // collect a password.
        navigate("/dashboard");
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          form: err.response?.data?.error || "Google sign-up failed. Please try again.",
        }));
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () =>
      setErrors((prev) => ({
        ...prev,
        form: "Google sign-up was cancelled or failed. Please try again.",
      })),
  });

  // Same full-page redirect flow as Login.jsx — see handleGithubLogin there.
  function handleGithubSignup() {
    window.location.href = `${BASE_URL}/auth/github`;
  }

  const inputClass =
    "mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-purple-500 placeholder:text-gray-600";
  const selectClass =
    "mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-purple-500";
  const labelClass = "text-sm text-gray-400 font-medium";
  const errInputClass = "border-red-500/60 focus:border-red-500";

  return (
    <div className="flex min-h-screen bg-[#09070f]">
      {/* LEFT */}
      <div className="relative hidden w-[40%] overflow-hidden bg-gradient-to-br from-purple-500 via-[#261238] to-[#02030a] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[160px]" />
        <div className="relative z-10">
          <AuthHero />
        </div>
        <div className="relative z-10 mb-20">
          <h1 className="text-7xl font-black text-purple-300">
            START
            <br />
            LEARNING
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-gray-300">
            Join thousands of students using StudyOS to organize their academics
            and boost productivity.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-1 items-center justify-center px-10 py-20">
        <div className="absolute h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[140px]" />

        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-center text-5xl font-black text-white">
            Study<span className="text-purple-400">OS</span>
          </h1>

          <h2 className="mt-10 text-center text-4xl font-bold text-white">
            Create Account
          </h2>

          <p className="mt-3 text-center text-gray-400">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign In
            </Link>
          </p>

          {/* Progress */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div
              className={`h-2 w-20 rounded-full transition-all ${step >= 1 ? "bg-purple-500" : "bg-white/10"}`}
            />
            <div
              className={`h-2 w-20 rounded-full transition-all ${step >= 2 ? "bg-purple-500" : "bg-white/10"}`}
            />
          </div>

          {errors.form && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <div className="mt-10">
                  <label className={labelClass}>Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    type="text"
                    className={`${inputClass} ${errors.fullName ? errInputClass : ""}`}
                  />
                  <FieldError msg={errors.fullName} />
                </div>

                <div className="mt-6">
                  <label className={labelClass}>Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    className={`${inputClass} ${errors.email ? errInputClass : ""}`}
                  />
                  <FieldError msg={errors.email} />
                </div>

                <div className="mt-6">
                  <label className={labelClass}>Password</label>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    className={`${inputClass} ${errors.password ? errInputClass : ""}`}
                  />
                  <FieldError msg={errors.password} />
                </div>

                <div className="mt-6">
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    className={`${inputClass} ${errors.confirmPassword ? errInputClass : ""}`}
                  />
                  <FieldError msg={errors.confirmPassword} />
                </div>

                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-sm text-gray-500">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => googleSignup()}
                    disabled={googleLoading}
                    className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 py-4 text-white transition hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FcGoogle size={24} />
                    {googleLoading ? "Signing in..." : "Google"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGithubSignup}
                    className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 py-4 text-white transition hover:border-purple-500/40 hover:bg-white/5"
                  >
                    <FaGithub size={22} /> GitHub
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-10 w-full rounded-xl bg-purple-500 py-4 font-bold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02] hover:bg-purple-600"
                >
                  Next →
                </button>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div className="mt-10">
                  <label className={labelClass}>Institution Type</label>
                  <select
                    name="institutionType"
                    value={formData.institutionType}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option className="bg-[#09070f]">
                      College / University
                    </option>
                    <option className="bg-[#09070f]">School</option>
                  </select>
                </div>

                <div className="mt-6">
                  <label className={labelClass}>Institution Name</label>
                  <input
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    type="text"
                    className={`${inputClass} ${errors.institutionName ? errInputClass : ""}`}
                  />
                  <FieldError msg={errors.institutionName} />
                </div>

                {!isSchool(formData.institutionType) && (
                  <>
                    <div className="mt-6">
                      <label className={labelClass}>Course / Degree</label>
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        {COLLEGE_COURSES.map((c) => (
                          <option key={c} className="bg-[#09070f]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6">
                      <label className={labelClass}>Branch / Stream</label>
                      <input
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        type="text"
                        placeholder="e.g. AI & ML, Computer Science"
                        className={`${inputClass} ${errors.branch ? errInputClass : ""}`}
                      />
                      <FieldError msg={errors.branch} />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Year</label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          {YEARS.map((y) => (
                            <option key={y} className="bg-[#09070f]">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Semester</label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          {SEMESTERS.map((s) => (
                            <option key={s} className="bg-[#09070f]">
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {isSchool(formData.institutionType) && (
                  <>
                    <div className="mt-6">
                      <label className={labelClass}>Class</label>
                      <select
                        name="schoolClass"
                        value={formData.schoolClass}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        {SCHOOL_CLASSES.map((c) => (
                          <option key={c} className="bg-[#09070f]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Stream</label>
                        <select
                          name="stream"
                          value={formData.stream}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          {SCHOOL_STREAMS.map((s) => (
                            <option key={s} className="bg-[#09070f]">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Board</label>
                        <select
                          name="board"
                          value={formData.board}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          {BOARDS.map((b) => (
                            <option key={b} className="bg-[#09070f]">
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setStep(1);
                    }}
                    className="flex-1 rounded-xl border border-white/10 py-4 font-semibold text-white transition hover:bg-white/5"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-purple-500 py-4 font-bold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}