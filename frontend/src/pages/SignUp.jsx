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

  function handleGithubSignup() {
    window.location.href = `${BASE_URL}/auth/github`;
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 text-white outline-none transition focus:border-purple-500 placeholder:text-gray-600 [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding:clamp(0.625rem,1.8vh,1rem)]";
  const selectClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 text-white outline-none focus:border-purple-500 [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding:clamp(0.625rem,1.8vh,1rem)]";
  const labelClass = "text-sm text-gray-400 font-medium";
  const errInputClass = "border-red-500/60 focus:border-red-500";

  return (
    // Same fluid, height-based clamp() sizing as Login.jsx — scales
    // continuously with actual available vertical space rather than
    // jumping between a few fixed breakpoint tiers.
    <div className="flex min-h-screen flex-col bg-[#09070f] lg:flex-row">
      {/* LEFT */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-purple-500 via-[#261238] to-[#02030a] lg:flex lg:w-[38%] lg:flex-col lg:justify-between xl:w-[40%] p-[clamp(1.5rem,4vh,4rem)]ia(min-height:1000px)]:lg:p-16">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 w-[clamp(14rem,32vh,31.25rem)] h-[clamp(14rem,32vh,31.25rem)] filter-[blur(clamp(6rem,10vh,10rem))] [@media(min-height:1000px)]:h-125 [@media(min-height:1000px)]:w-125 [@media(min-height:1000px)]:blur-[160px]" />
        <div className="relative z-10">
          <AuthHero />
        </div>
        <div className="relative z-10">
          <h1 className="font-black leading-[0.95] text-purple-300 text-[clamp(1.75rem,6vh,4.5rem)] [@media(min-height:1000px)]:text-7xl">
            START
            <br />
            LEARNING
          </h1>
          <p className="max-w-md leading-7 text-gray-300 text-[clamp(0.875rem,2vh,1.125rem)] mt-[clamp(0.75rem,2vh,1rem)](min-height:1000px)]:mt-4 [@media(min-height:1000px)]:text-lg">
            Join thousands of students using StudyOS to organize their academics
            and boost productivity.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-1 overflow-y-auto px-4 sm:px-8 pt-[clamp(1.5rem,4vh,4rem)] pb-[clamp(1.5rem,4vh,4rem)] [@media(min-height:1000px)]:py-16">
        <div className="absolute rounded-full bg-purple-500/5 w-[clamp(14rem,28vh,25rem)] h-[clamp(14rem,28vh,25rem)] filter-[blur(clamp(5rem,8vh,8.75rem))] [@media(min-height:1000px)]:h-100 [@media(min-height:1000px)]:w-100 [@media(min-height:1000px)]:blur-[140px]" />

        <div className="relative z-10 m-auto w-full max-w-[clamp(22rem,32vw,28rem)]">
          <h1 className="text-center font-black text-white text-[clamp(1.5rem,4.5vh,3rem)]dia(min-height:1000px)]:text-5xl">
            Study<span className="text-purple-400">OS</span>
          </h1>

          <h2 className="text-center font-bold text-white text-[clamp(1.25rem,3.5vh,2.5rem)] mt-[clamp(0.75rem,2vh,1.5rem)] [@media(min-height:1000px)]:mt-10 [@media(min-height:1000px)]:text-4xl">
            Create Account
          </h2>

          <p className="mt-2 text-center text-gray-400 text-[clamp(0.8125rem,1.6vh,1rem)]">
            Already have an account?
            <Link to="/login" className="ml-2 font-semibold text-purple-400 hover:text-purple-300">
              Sign In
            </Link>
          </p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mt-[clamp(1rem,2.5vh,1.5rem)]">
            <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 1 ? "bg-purple-500" : "bg-white/10"}`} />
            <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 2 ? "bg-purple-500" : "bg-white/10"}`} />
          </div>

          {errors.form && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <div className="mt-[clamp(1rem,2.5vh,1.5rem)]">
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

                <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                <div className="flex items-center gap-4 mt-[clamp(1rem,2.5vh,2rem)] mb-[clamp(1rem,2.5vh,2rem)]">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-gray-500">or continue with</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => googleSignup()}
                    disabled={googleLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 text-white transition hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-[clamp(0.8125rem,1.6vh,1rem)] pt-[clamp(0.625rem,1.8vh,1rem)] pb-[clamp(0.625rem,1.8vh,1rem)]"
                  >
                    <FcGoogle size={20} />
                    {googleLoading ? "Signing in..." : "Google"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGithubSignup}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 text-white transition hover:border-purple-500/40 hover:bg-white/5 text-[clamp(0.8125rem,1.6vh,1rem)] pt-[clamp(0.625rem,1.8vh,1rem)] pb-[clamp(0.625rem,1.8vh,1rem)]"
                  >
                    <FaGithub size={18} />
                    GitHub
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-xl bg-purple-500 font-bold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02] hover:bg-purple-600 text-[clamp(0.875rem,1.8vh,1rem)] mt-[clamp(1rem,2.5vh,1.5rem)] pt-[clamp(0.625rem,1.8vh,1rem)] pb-[clamp(0.625rem,1.8vh,1rem)]"
                >
                  Next →
                </button>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div className="mt-[clamp(1rem,2.5vh,1.5rem)]">
                  <label className={labelClass}>Institution Type</label>
                  <select
                    name="institutionType"
                    value={formData.institutionType}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option className="bg-[#09070f]">College / University</option>
                    <option className="bg-[#09070f]">School</option>
                  </select>
                </div>

                <div className="[margin-top:clamp(0.75rem,2vh,1.25rem)]">
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
                    <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                    <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                    <div className="grid grid-cols-2 gap-3 mt-[clamp(0.75rem,2vh,1.25rem)]">
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
                    <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
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

                    <div className="grid grid-cols-2 gap-3 [margin-top:clamp(0.75rem,2vh,1.25rem)]">
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

                <div className="flex gap-4 [margin-top:clamp(1rem,2.5vh,1.5rem)]">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setStep(1);
                    }}
                    className="flex-1 rounded-xl border border-white/10 font-semibold text-white transition hover:bg-white/5 pt-[clamp(0.625rem,1.8vh,1rem)] [padding-bottom:clamp(0.625rem,1.8vh,1rem)]"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-purple-500 font-bold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed [padding-top:clamp(0.625rem,1.8vh,1rem)] [padding-bottom:clamp(0.625rem,1.8vh,1rem)]"
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