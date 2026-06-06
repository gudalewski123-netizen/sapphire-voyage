import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Link } from "wouter";
import { CalendarCheck, Clock, Loader2, CheckCircle2, CalendarPlus, Download, ArrowLeft } from "lucide-react";
import { BUSINESS } from "../config";
import { useLang } from "../i18n";
import { useAuth } from "../auth";
import { apiGet, apiSend, type Slot, type BookingPayload } from "../lib/api";
import { downloadIcs, googleCalendarUrl } from "../lib/calendar";
import { useApplyTheme } from "../components/chrome";

const SERVICE_KEYS = ["airport", "point-to-point", "long-distance", "event", "tour"] as const;

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function BookingPage() {
  useApplyTheme();
  const { t } = useLang();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string>("");

  const [serviceType, setServiceType] = useState<string>(() => {
    if (typeof window === "undefined") return "airport";
    const q = new URLSearchParams(window.location.search).get("service");
    return q && (SERVICE_KEYS as readonly string[]).includes(q) ? q : "airport";
  });
  const [tripType, setTripType] = useState<string>("one-way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<BookingPayload | null>(null);

  // Prefill contact fields from the logged-in customer.
  useEffect(() => {
    if (user) {
      setName((n) => n || user.name || "");
      setEmail((e) => e || user.email || "");
      setPhone((p) => p || user.phone || "");
    }
  }, [user]);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!dateStr) {
      setSlots(null);
      return;
    }
    let active = true;
    setLoadingSlots(true);
    setTime("");
    apiGet<{ slots: Slot[] }>(`/api/availability?date=${dateStr}`)
      .then((d) => {
        if (active) setSlots(d.slots);
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [dateStr]);

  const serviceLabel = (key: string) =>
    t.services.items.find((s) => s.key === key)?.name ?? key;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!dateStr || !time || !pickup.trim() || !dropoff.trim() || !name.trim() || !email.trim() || !phone.trim()) {
      setError(t.booking.required);
      return;
    }
    setSubmitting(true);

    const payload: BookingPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceType,
      tripType,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      passengers,
      date: dateStr,
      time,
      returnDate: tripType === "round-trip" && returnDate ? returnDate : null,
      returnTime: tripType === "round-trip" && returnTime ? returnTime : null,
      notes: notes.trim() || null,
    };

    try {
      // 1. Persist to our DB (source of truth, prevents double-booking).
      await apiSend("/api/bookings", "POST", payload);

      // 2. Notify the operator by email via FormSubmit (frontend → bypasses SMTP block).
      try {
        const fd = new FormData();
        fd.append("_subject", `New booking — ${serviceLabel(serviceType)} on ${dateStr} ${fmtTime(time)}`);
        fd.append("_template", "table");
        fd.append("_captcha", "false");
        fd.append("Name", payload.name);
        fd.append("Phone", payload.phone);
        fd.append("Email", payload.email);
        fd.append("Service", serviceLabel(serviceType));
        fd.append("Trip type", tripType);
        fd.append("Date", dateStr);
        fd.append("Time", fmtTime(time));
        fd.append("Pickup", payload.pickup);
        fd.append("Drop-off", payload.dropoff);
        fd.append("Passengers", String(passengers));
        if (payload.returnDate) fd.append("Return", `${payload.returnDate} ${payload.returnTime ? fmtTime(payload.returnTime) : ""}`);
        if (payload.notes) fd.append("Notes", payload.notes);
        fd.append("Add to calendar", googleCalendarUrl(payload));
        await fetch(`https://formsubmit.co/${encodeURIComponent(BUSINESS.email)}`, { method: "POST", body: fd });
      } catch {
        /* email is best-effort; booking is already saved */
      }

      setConfirmed(payload);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please call us.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setConfirmed(null);
    setSelectedDate(undefined);
    setSlots(null);
    setTime("");
    setPickup("");
    setDropoff("");
    setNotes("");
    setReturnDate("");
    setReturnTime("");
  }

  if (confirmed) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-card border border-primary/30 rounded-2xl p-8 md:p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-5" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{t.booking.successTitle}</h1>
            <p className="text-muted-foreground mb-8">{t.booking.successBody}</p>

            <div className="text-left bg-background/60 border border-white/10 rounded-xl p-6 mb-8 space-y-2 text-sm">
              <Row label={t.booking.serviceType} value={serviceLabel(confirmed.serviceType)} />
              <Row label={t.booking.tripType} value={confirmed.tripType === "round-trip" ? t.booking.roundTrip : t.booking.oneWay} />
              <Row label="Date / Time" value={`${confirmed.date} · ${fmtTime(confirmed.time)}`} />
              <Row label={t.booking.pickup} value={confirmed.pickup} />
              <Row label={t.booking.dropoff} value={confirmed.dropoff} />
              <Row label={t.booking.passengers} value={String(confirmed.passengers)} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={googleCalendarUrl(confirmed)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                <CalendarPlus className="w-5 h-5" /> Google Calendar
              </a>
              <button
                onClick={() => downloadIcs(confirmed)}
                className="flex items-center justify-center gap-2 border border-white/20 hover:border-primary text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                <Download className="w-5 h-5" /> {t.booking.addToCalendar} (.ics)
              </button>
            </div>
            <button onClick={resetForm} className="mt-6 text-sm text-muted-foreground hover:text-white underline">
              {t.booking.bookAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.common.backHome}
        </Link>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">{t.booking.title}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.booking.subtitle}</p>
          {user ? (
            <p className="text-sm text-gold mt-3">{t.booking.loggedInAs} {user.name || user.email}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">
              {t.booking.signInPrompt} <Link href="/account" className="text-primary underline">{t.nav.login}</Link>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Left: date + time */}
          <div className="space-y-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-display font-semibold text-white mb-4">
                <CalendarCheck className="w-5 h-5 text-primary" /> {t.booking.stepDate}
              </h2>
              <div className="rdp-wrap flex justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: new Date() }}
                  showOutsideDays
                />
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-display font-semibold text-white mb-4">
                <Clock className="w-5 h-5 text-primary" /> {t.booking.stepTime}
              </h2>
              {!dateStr && <p className="text-sm text-muted-foreground">{t.booking.selectDateFirst}</p>}
              {dateStr && loadingSlots && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.booking.loadingSlots}
                </p>
              )}
              {dateStr && !loadingSlots && slots && slots.filter((s) => s.available).length === 0 && (
                <p className="text-sm text-muted-foreground">{t.booking.noSlots}</p>
              )}
              {dateStr && !loadingSlots && slots && slots.filter((s) => s.available).length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setTime(s.time)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border ${
                        time === s.time
                          ? "bg-primary text-white border-primary"
                          : s.available
                            ? "bg-background border-white/10 text-white/90 hover:border-primary"
                            : "bg-background/40 border-white/5 text-muted-foreground/40 line-through cursor-not-allowed"
                      }`}
                    >
                      {fmtTime(s.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: trip details */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-4 h-fit">
            <h2 className="text-lg font-display font-semibold text-white mb-1">{t.booking.stepDetails}</h2>

            <Field label={t.booking.serviceType}>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={selectCls}>
                {SERVICE_KEYS.map((k) => (
                  <option key={k} value={k}>{serviceLabel(k)}</option>
                ))}
              </select>
            </Field>

            <Field label={t.booking.tripType}>
              <div className="grid grid-cols-2 gap-2">
                {(["one-way", "round-trip"] as const).map((tt) => (
                  <button
                    type="button"
                    key={tt}
                    onClick={() => setTripType(tt)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${tripType === tt ? "bg-primary text-white border-primary" : "bg-background border-white/10 text-white/80 hover:border-primary"}`}
                  >
                    {tt === "one-way" ? t.booking.oneWay : t.booking.roundTrip}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-4">
              <Field label={t.booking.pickup}>
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputCls} placeholder="SJU Airport, Hotel..." required />
              </Field>
              <Field label={t.booking.dropoff}>
                <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} className={inputCls} placeholder="Fajardo, Old San Juan..." required />
              </Field>
            </div>

            {tripType === "round-trip" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.booking.returnDate}>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label={t.booking.returnTime}>
                  <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}

            <Field label={t.booking.passengers}>
              <input type="number" min={1} max={14} value={passengers} onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))} className={inputCls} />
            </Field>

            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-white/10">
              <Field label={t.booking.name}>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.booking.email}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                </Field>
                <Field label={t.booking.phone}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} required />
                </Field>
              </div>
              <Field label={t.booking.notes}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </Field>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white py-3.5 rounded-full font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.booking.submitting}</> : t.booking.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary text-sm";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}
