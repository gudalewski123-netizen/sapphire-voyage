import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, LogOut, ArrowLeft, MapPin, CalendarClock, Plus } from "lucide-react";
import { useLang } from "../i18n";
import { useAuth } from "../auth";
import { apiGet, type Booking } from "../lib/api";
import { useApplyTheme } from "../components/chrome";

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function AccountPage() {
  useApplyTheme();
  const { t } = useLang();
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.common.backHome}
        </Link>
        {user ? <Dashboard /> : <AuthForms onLogin={login} onRegister={register} />}
      </div>
    </div>
  );

  function Dashboard() {
    const [bookings, setBookings] = useState<Booking[] | null>(null);
    useEffect(() => {
      apiGet<Booking[]>("/api/bookings/mine").then(setBookings).catch(() => setBookings([]));
    }, []);

    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{t.account.title}</h1>
            <p className="text-muted-foreground mt-1">{t.account.welcome}, {user!.name || user!.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm border border-white/15 hover:border-white/40 text-white/80 px-4 py-2 rounded-full transition-all">
            <LogOut className="w-4 h-4" /> {t.account.signOut}
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-white">{t.account.myTrips}</h2>
          <Link href="/book" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-semibold">
            <Plus className="w-4 h-4" /> {t.account.bookNow}
          </Link>
        </div>

        {bookings === null && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        {bookings && bookings.length === 0 && (
          <div className="bg-card border border-white/10 rounded-2xl p-10 text-center text-muted-foreground">
            {t.account.noTrips}
          </div>
        )}
        {bookings && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CalendarClock className="w-4 h-4 text-primary" />
                    {b.date} · {fmtTime(b.time)}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[b.status] ?? statusColors.pending}`}>
                    {t.status[b.status as keyof typeof t.status] ?? b.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{b.pickup} → {b.dropoff}</span>
                </div>
                {b.priceQuote && (
                  <div className="mt-2 text-sm text-gold font-semibold">{b.priceQuote}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

function AuthForms({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, phone: string, password: string) => Promise<void>;
}) {
  const { t } = useLang();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await onLogin(email.trim(), password);
      else await onRegister(name.trim(), email.trim(), phone.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary";

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 text-center">
        {mode === "login" ? t.account.signInTitle : t.account.registerTitle}
      </h1>
      <p className="text-muted-foreground text-center mb-8 text-sm">{t.booking.signInPrompt}</p>

      <form onSubmit={submit} className="bg-card border border-white/10 rounded-2xl p-6 space-y-4">
        {mode === "register" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.account.name} className={inputCls} required />
        )}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.account.email} className={inputCls} required />
        {mode === "register" && (
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.account.phone} className={inputCls} required />
        )}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.account.password} className={inputCls} required minLength={6} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2">
          {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.account.working}</> : mode === "login" ? t.account.signIn : t.account.register}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        className="block mx-auto mt-5 text-sm text-primary hover:underline"
      >
        {mode === "login" ? t.account.toRegister : t.account.toSignIn}
      </button>
    </div>
  );
}
