"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { registerUser } from "@/actions/auth";
import { AlertCircle, Compass, Loader2, LogIn, UserPlus, User, HardHat } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type Mode = "login" | "register" | null;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [role, setRole] = useState<"builder" | "traveller">("traveller");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        setLoading(false);
        router.push("/planner");
        router.refresh();
      }
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = registerSchema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const result = await registerUser({ name, email, password, role });

    if (result.success) {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created. Please sign in.");
        setLoading(false);
      } else {
        setLoading(false);
        router.push("/planner");
        router.refresh();
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleGuest() {
    router.push("/planner");
  }

  if (!mode) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,66,114,0.1),rgba(255,255,255,0.98)_48%)] px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-[0_18px_40px_-26px_rgba(15,66,114,0.55)] backdrop-blur text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Travel Itinerary</h1>
            <p className="mt-1 text-sm text-slate-600">
              Plan your Nepal adventure with AI
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_-26px_rgba(15,66,114,0.55)] backdrop-blur space-y-3">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>

            <button
              onClick={() => { setMode("register"); setRole("traveller"); setError(""); }}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <UserPlus className="h-4 w-4" />
              Create account
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGuest}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Compass className="h-4 w-4" />
              Continue as guest
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,66,114,0.1),rgba(255,255,255,0.98)_48%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-[0_18px_40px_-26px_rgba(15,66,114,0.55)] backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {mode === "login" ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "login"
              ? "Sign in to your account"
              : "Choose your account type"}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {mode === "register" && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("traveller")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition ${
                role === "traveller"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <User className="h-5 w-5" />
              Traveller
              <span className="text-[10px] font-normal text-slate-500">Chat & explore</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("builder")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition ${
                role === "builder"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <HardHat className="h-5 w-5" />
              Builder
              <span className="text-[10px] font-normal text-slate-500">Add places</span>
            </button>
          </div>
        )}

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "••••••••" : "At least 6 characters"}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              `Create ${role === "builder" ? "builder" : "traveller"} account`
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setMode("register"); setRole("traveller"); setError(""); }}
                className="font-medium text-primary hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(null); setError(""); }}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Back to menu
          </button>
        </div>
      </div>
    </main>
  );
}
