import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getUser()
      .then(({ data, error: userError }) => {
        if (!active) return;
        if (userError) setError(userError.message);
        setUser(data?.user || null);
      })
      .catch((userError) => {
        if (active) setError(userError.message || "Unable to load your account.");
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    if (!supabase) {
      setError("Google sign-in is not configured yet. Add the Supabase browser environment variables.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError.message || "Unable to connect to Google sign-in.");
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
  }

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2] px-5 py-16 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#D6CDBE] bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold">Shop MK Finds</p>
        <h1 className="mt-3 text-3xl font-bold text-[#2C2C2A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your account</h1>
        {user ? (
          <>
            <p className="mt-4 text-sm text-gray-600">Signed in as <strong>{user.email}</strong></p>
            <button onClick={signOut} className="mt-6 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 font-semibold">Sign out</button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-gray-500">Sign in securely with your Google account.</p>
            <button onClick={signIn} disabled={loading} className="mt-6 w-full rounded-xl bg-[#6D213C] px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Connecting to Google…" : "Continue with Google"}
            </button>
          </>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Link to="/shop" className="mt-6 inline-block text-sm font-semibold text-[#6D213C]">Continue shopping</Link>
      </section>
    </main>
  );
}
