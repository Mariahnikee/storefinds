import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setUser(data?.session?.user || null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Account sign-in is not configured. Check your Supabase environment variables.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;

        if (data.session) {
          setUser(data.user);
          setMessage("Your account has been created successfully.");
        } else {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
          setIsSignUp(false);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setUser(data.user);
        setMessage("You are now signed in.");
      }
    } catch (authError) {
      setError(authError.message || "Unable to complete your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    setUser(null);
    setMessage("You have signed out.");
  }

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2] px-5 py-16 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#D6CDBE] bg-white p-8 shadow-sm">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold">Shop MK Finds</p>
        <h1 className="mt-3 text-center text-3xl font-bold text-[#2C2C2A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your account</h1>

        {user ? (
          <div className="text-center">
            <p className="mt-4 text-sm text-gray-600">Signed in as <strong>{user.email}</strong></p>
            <button type="button" onClick={signOut} className="mt-6 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 font-semibold">Sign out</button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-center text-sm text-gray-500">
              {isSignUp ? "Create an account to get started." : "Sign in with your email and password."}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="account-email" className="mb-1 block text-left text-sm font-medium text-gray-700">Email address</label>
                <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="account-password" className="mb-1 block text-left text-sm font-medium text-gray-700">Password</label>
                <input id="account-password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" placeholder="At least 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6D213C] px-4 py-3 font-semibold text-white disabled:opacity-60">
                {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "New to Shop MK Finds?"}{" "}
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }} className="font-semibold text-[#6D213C] underline">
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        <div className="text-center">
          <Link to="/shop" className="mt-6 inline-block text-sm font-semibold text-[#6D213C]">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
}
