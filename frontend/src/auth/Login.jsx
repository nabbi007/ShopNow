import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer3 } from "../home/components/Footer3";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(form);
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
            Sign In
          </h1>
          <span className="mx-auto block h-0.5 w-16 bg-gray-900" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </span>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none"
            />
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gray-900 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            state={{ from }}
            className="font-medium text-gray-900 underline hover:text-rose-500"
          >
            Create one
          </Link>
        </p>
      </main>
      <Footer3 />
    </div>
  );
}
