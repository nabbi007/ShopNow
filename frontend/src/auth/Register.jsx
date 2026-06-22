import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { useAuth } from "../context/AuthContext";

const RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function Rule({ met, label }) {
  return (
    <li
      className={`flex items-center gap-2 text-sm transition-colors ${
        met ? "text-green-600" : "text-gray-400"
      }`}
    >
      {met ? <FiCheck className="size-4" /> : <FiX className="size-4" />}
      {label}
    </li>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordValid = RULES.every((r) => r.test(form.password));
  const passwordsMatch = confirm.length > 0 && form.password === confirm;
  const canSubmit =
    form.name.trim() && form.email.trim() && passwordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-20">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Create Account
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              required
              placeholder="Jane Doe"
              className="w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none"
            />
          </label>

          {/* Password */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                onFocus={() => setPasswordFocused(true)}
                required
                placeholder="Create a password"
                className="w-full border border-gray-300 px-4 py-3 pr-11 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="size-5" />
                ) : (
                  <FiEye className="size-5" />
                )}
              </button>
            </div>
          </label>

          {/* Live constraints */}
          {(passwordFocused || form.password.length > 0) && (
            <ul className="space-y-1.5 rounded border border-gray-100 bg-gray-50 p-4">
              {RULES.map((r) => (
                <Rule key={r.label} met={r.test(form.password)} label={r.label} />
              ))}
            </ul>
          )}

          {/* Confirm password */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </span>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter your password"
                className={`w-full border px-4 py-3 pr-11 text-sm text-gray-900 transition-colors focus:outline-none ${
                  confirm.length === 0
                    ? "border-gray-300 focus:border-gray-900"
                    : passwordsMatch
                    ? "border-green-500 focus:border-green-500"
                    : "border-rose-400 focus:border-rose-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-gray-700"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <FiEyeOff className="size-5" />
                ) : (
                  <FiEye className="size-5" />
                )}
              </button>
            </div>
            {confirm.length > 0 && !passwordsMatch && (
              <span className="mt-1 block text-sm text-rose-500">
                Passwords do not match.
              </span>
            )}
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={busy || !canSubmit}
            className="w-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from }}
            className="font-medium text-gray-900 underline hover:text-rose-500"
          >
            Sign in
          </Link>
        </p>
      </main>
      <Footer3 />
    </div>
  );
}
