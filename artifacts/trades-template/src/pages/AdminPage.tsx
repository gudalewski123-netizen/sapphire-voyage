import { useEffect, useMemo, useState, useCallback, type FormEvent } from "react";
import { Link } from "wouter";
import {
  PhoneCall, Mail, ArrowLeft, Inbox,
  RefreshCw, LogOut, Trash2, ChevronDown, ChevronRight, AlertCircle,
  KeyRound, AlertTriangle, Download, X,
  CalendarClock, CalendarX2, MapPin, Plus, Users, Car,
} from "lucide-react";
import { BUSINESS, THEME } from "../config";

// ============================================================
//  Admin dashboard — Tier 1
//
//  /admin shows incoming leads from the quote form.
//
//  Auth: username + password (default Admin / Password). On first sign-in
//  the user is shown an orange banner prompting them to rotate credentials
//  in the Account tab. Once rotated the defaults stop working. The backend
//  also accepts ADMIN_PASSWORD as an emergency break-glass override.
// ============================================================

type Status = "new" | "contacted" | "won" | "lost";
type Tab = "bookings" | "leads" | "availability" | "account";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Booking {
  id: number;
  createdAt: string;
  customerId: number | null;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  tripType: string;
  pickup: string;
  dropoff: string;
  passengers: number;
  date: string;
  time: string;
  returnDate: string | null;
  returnTime: string | null;
  notes: string | null;
  status: BookingStatus;
  priceQuote: string | null;
  adminNotes: string | null;
}

interface BlockedSlot {
  id: number;
  date: string;
  time: string | null;
  reason: string | null;
}

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

function fmtSlot(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface Lead {
  id: number;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  service: string | null;
  message: string | null;
  status: Status;
  adminNotes: string | null;
}

interface MeResponse {
  username: string;
  isDefault: boolean;
}

const TOKEN_KEY = "admin_token";
const USERNAME_KEY = "admin_username";

const STATUS_COLORS: Record<Status, string> = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  won: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-300 border-red-500/30",
};

const EXPORT_COLUMNS = ["Date", "Name", "Email", "Phone", "Service", "Message", "Status", "Notes"] as const;

function slugify(name: string): string {
  return (name || "leads")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "leads";
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function leadRow(l: Lead): string[] {
  return [
    new Date(l.createdAt).toLocaleString(),
    l.name || "",
    l.email || "",
    l.phone || "",
    l.service || "",
    l.message || "",
    l.status,
    l.adminNotes || "",
  ];
}

// RFC 4180 — wrap any field containing comma, quote, CR, or LF in quotes;
// double any embedded quote. Always emit CRLF between records.
function csvEscape(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function buildCsv(leads: Lead[]): string {
  const lines: string[] = [];
  lines.push(EXPORT_COLUMNS.map(csvEscape).join(","));
  for (const lead of leads) {
    lines.push(leadRow(lead).map(csvEscape).join(","));
  }
  return lines.join("\r\n");
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadCsv(leads: Lead[], slug: string) {
  const csv = buildCsv(leads);
  // UTF-8 BOM so Excel opens accented characters correctly
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(`${slug}-leads-${todayISO()}.csv`, blob);
}

async function downloadPdf(leads: Lead[], slug: string, filterLabel: string) {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableMod as { default: (doc: unknown, opts: unknown) => void }).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BUSINESS.name, margin, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Leads Export", margin, 66);

  doc.setFontSize(10);
  const dateLabel = new Date().toLocaleDateString();
  doc.text(dateLabel, pageWidth - margin, 48, { align: "right" });
  doc.text(`Filter: ${filterLabel}`, pageWidth - margin, 66, { align: "right" });

  autoTable(doc, {
    head: [Array.from(EXPORT_COLUMNS)],
    body: leads.map(leadRow),
    startY: 84,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 90 },
      2: { cellWidth: 110 },
      3: { cellWidth: 80 },
      4: { cellWidth: 80 },
      5: { cellWidth: 160 },
      6: { cellWidth: 50 },
      7: { cellWidth: 80 },
    },
    didDrawPage: (data: { pageNumber: number }) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(
        `Total leads: ${leads.length}  •  Filter: ${filterLabel}`,
        margin,
        pageHeight - 18,
      );
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - margin,
        pageHeight - 18,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  doc.save(`${slug}-leads-${todayISO()}.pdf`);
}

function DownloadModal({
  open,
  onClose,
  allLeads,
  filteredLeads,
  currentFilter,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  allLeads: Lead[];
  filteredLeads: Lead[];
  currentFilter: Status | "all";
  onDone: (count: number) => void;
}) {
  const filterActive = currentFilter !== "all";
  const [csv, setCsv] = useState(true);
  const [pdf, setPdf] = useState(true);
  const [scope, setScope] = useState<"all" | "filtered">(filterActive ? "filtered" : "all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCsv(true);
      setPdf(true);
      setScope(filterActive ? "filtered" : "all");
      setErr(null);
    }
  }, [open, filterActive]);

  if (!open) return null;

  const targetLeads = scope === "filtered" ? filteredLeads : allLeads;
  const slug = slugify(BUSINESS.name);
  const filterLabel = scope === "filtered" ? currentFilter : "all";

  async function handleDownload() {
    if (!csv && !pdf) {
      setErr("Pick at least one format.");
      return;
    }
    if (targetLeads.length === 0) {
      setErr("Nothing to export — the selected scope has zero leads.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      if (csv) await downloadCsv(targetLeads, slug);
      if (pdf) await downloadPdf(targetLeads, slug, filterLabel);
      onDone(targetLeads.length);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Download failed.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card border border-white/10 rounded-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-condensed text-xl font-bold uppercase tracking-widest">Download leads</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white -mt-1 -mr-1 p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Format</div>
          <label className="flex items-center gap-3 px-3 py-2 rounded border border-white/10 cursor-pointer hover:bg-white/5">
            <input type="checkbox" checked={pdf} onChange={(e) => setPdf(e.target.checked)} className="accent-primary" />
            <span className="text-sm text-white">PDF <span className="text-muted-foreground">(printable, branded)</span></span>
          </label>
          <label className="flex items-center gap-3 px-3 py-2 rounded border border-white/10 cursor-pointer hover:bg-white/5">
            <input type="checkbox" checked={csv} onChange={(e) => setCsv(e.target.checked)} className="accent-primary" />
            <span className="text-sm text-white">CSV <span className="text-muted-foreground">(opens in Excel / Sheets)</span></span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scope</div>
          <label className="flex items-center gap-3 px-3 py-2 rounded border border-white/10 cursor-pointer hover:bg-white/5">
            <input
              type="radio"
              name="scope"
              checked={scope === "all"}
              onChange={() => setScope("all")}
              className="accent-primary"
            />
            <span className="text-sm text-white">All leads <span className="text-muted-foreground">({allLeads.length})</span></span>
          </label>
          <label className={`flex items-center gap-3 px-3 py-2 rounded border border-white/10 cursor-pointer hover:bg-white/5 ${!filterActive ? "opacity-60" : ""}`}>
            <input
              type="radio"
              name="scope"
              checked={scope === "filtered"}
              onChange={() => setScope("filtered")}
              disabled={!filterActive}
              className="accent-primary"
            />
            <span className="text-sm text-white">
              Currently-filtered <span className="text-muted-foreground">({filteredLeads.length}{filterActive ? ` · ${currentFilter}` : " · no filter"})</span>
            </span>
          </label>
        </div>

        {err && (
          <div className="flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/30 text-sm rounded p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {err}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded border border-white/10 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleDownload()}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2 rounded bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-bold uppercase tracking-wider"
          >
            <Download className="w-4 h-4" /> {busy ? "Preparing…" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({
  onLogin,
  initialMessage,
}: {
  onLogin: (token: string, username: string) => void;
  initialMessage?: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Sign-in failed.");
        setBusy(false);
        return;
      }
      onLogin(data.token, data.username);
    } catch {
      setErr("Network error — is the backend deployed?");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <form onSubmit={handle} className="w-full max-w-sm bg-card border border-white/10 rounded-xl p-8 space-y-5">
        <div className="text-center">
          <h1 className="font-condensed text-2xl font-bold uppercase tracking-widest mb-2">Admin Sign In</h1>
          <p className="text-muted-foreground text-sm">{BUSINESS.name}</p>
          <p className="text-muted-foreground text-xs mt-2">
            Default: <span className="font-mono text-white">Admin</span> / <span className="font-mono text-white">Password</span>
          </p>
        </div>
        {initialMessage && (
          <div className="text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 text-sm rounded p-3">
            {initialMessage}
          </div>
        )}
        <input
          type="text" autoFocus required autoComplete="username"
          placeholder="Username"
          value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-background border border-white/10 rounded px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <input
          type="password" required autoComplete="current-password"
          placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background border border-white/10 rounded px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        {err && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {err}
          </div>
        )}
        <button
          type="submit" disabled={busy || !username || !password}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-6 py-3 rounded font-condensed text-lg uppercase tracking-wider font-bold"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-white">
            ← Back to site
          </Link>
        </div>
      </form>
    </div>
  );
}

function LeadsList({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { onLogout(); return; }
      if (!res.ok) { setErr(`Failed (${res.status})`); return; }
      setLeads(await res.json());
    } catch {
      setErr("Network error");
    }
  }, [token, onLogout]);

  useEffect(() => { void load(); }, [load]);

  async function update(id: number, changes: Partial<Pick<Lead, "status" | "adminNotes">>) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(changes),
    });
    if (res.ok) await load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this lead permanently?")) return;
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await load();
  }

  const filtered = useMemo(
    () => (leads || []).filter((l) => filter === "all" || l.status === filter),
    [leads, filter],
  );
  const counts = (leads || []).reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-condensed text-2xl font-bold uppercase tracking-widest mr-auto">
          Leads <span className="text-muted-foreground">({leads?.length ?? 0})</span>
        </h2>
        {(["all", "new", "contacted", "won", "lost"] as const).map((s) => (
          <button
            key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider transition ${
              filter === s ? "bg-primary text-white border-primary" : "bg-card border-white/10 text-muted-foreground hover:text-white"
            }`}
          >
            {s} {s !== "all" && counts[s] !== undefined && `(${counts[s]})`}
          </button>
        ))}
        <button
          onClick={() => setDownloadOpen(true)}
          disabled={!leads || leads.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export leads as CSV and/or PDF"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <button onClick={() => void load()} className="p-2 rounded border border-white/10 text-muted-foreground hover:text-white" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-300">
          {err} — is the backend deployed and is /api/admin/leads accessible?
        </div>
      )}

      {leads === null && !err && (
        <div className="text-muted-foreground text-center py-12">Loading…</div>
      )}

      {leads !== null && filtered.length === 0 && (
        <div className="text-muted-foreground text-center py-12 border border-white/8 rounded-xl bg-card">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          No leads yet. Submissions from the quote form will appear here.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((lead) => {
          const expanded = expandedId === lead.id;
          return (
            <div key={lead.id} className="bg-card border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : lead.id)}
                className="w-full grid grid-cols-12 gap-3 items-center px-5 py-4 text-left hover:bg-white/3 transition"
              >
                <div className="col-span-3 sm:col-span-2 text-xs text-muted-foreground font-mono">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-5 sm:col-span-3 font-medium text-white truncate">{lead.name}</div>
                <div className="col-span-4 sm:col-span-3 text-muted-foreground truncate">{lead.service || "—"}</div>
                <div className="hidden sm:flex sm:col-span-2 items-center gap-2 text-xs text-muted-foreground truncate">
                  <PhoneCall className="w-3 h-3" /> {lead.phone}
                </div>
                <div className="hidden sm:flex sm:col-span-1 justify-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="hidden sm:flex sm:col-span-1 justify-end text-muted-foreground">
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-white/8 px-5 py-5 space-y-4 bg-background/30">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                      <PhoneCall className="w-4 h-4" /> {lead.phone}
                    </a>
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Mail className="w-4 h-4" /> {lead.email}
                    </a>
                  </div>

                  {lead.message && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Message</div>
                      <p className="text-white whitespace-pre-wrap text-sm">{lead.message}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                      <select
                        value={lead.status}
                        onChange={(e) => void update(lead.id, { status: e.target.value as Status })}
                        className="w-full bg-card border border-white/10 rounded px-3 py-2 text-white text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Internal notes</div>
                    <textarea
                      rows={2}
                      defaultValue={lead.adminNotes || ""}
                      onBlur={(e) => {
                        if (e.target.value !== (lead.adminNotes || "")) {
                          void update(lead.id, { adminNotes: e.target.value });
                        }
                      }}
                      placeholder="Notes only you see (saves on blur)…"
                      className="w-full bg-card border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => void remove(lead.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        allLeads={leads || []}
        filteredLeads={filtered}
        currentFilter={filter}
        onDone={(count) => setToast(`Downloaded ${count} lead${count === 1 ? "" : "s"}`)}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500/90 text-white text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg backdrop-blur"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function AccountTab({
  token,
  currentUsername,
  onChanged,
}: {
  token: string;
  currentUsername: string;
  onChanged: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (newUsername.trim().length < 3) {
      setErr("New username must be at least 3 characters.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Password confirmation does not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Could not update credentials.");
        setBusy(false);
        return;
      }
      onChanged();
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-condensed text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Change Username & Password
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          After updating, you'll be signed out and need to sign back in with the new credentials.
        </p>
      </div>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Password</label>
          <input
            type="password" required autoComplete="current-password"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">New Username</label>
          <input
            type="text" required minLength={3} autoComplete="username"
            value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">New Password</label>
          <input
            type="password" required minLength={8} autoComplete="new-password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Confirm New Password</label>
          <input
            type="password" required minLength={8} autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        {err && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {err}
          </div>
        )}
        <button
          type="submit" disabled={busy}
          className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-6 py-3 rounded font-condensed text-lg uppercase tracking-wider font-bold"
        >
          {busy ? "Saving…" : "Update Credentials"}
        </button>
      </form>
    </div>
  );
}

function BookingsList({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { onLogout(); return; }
      if (!res.ok) { setErr(`Failed (${res.status})`); return; }
      setBookings(await res.json());
    } catch {
      setErr("Network error");
    }
  }, [token, onLogout]);

  useEffect(() => { void load(); }, [load]);

  async function update(id: number, changes: Partial<Pick<Booking, "status" | "priceQuote" | "adminNotes">>) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(changes),
    });
    if (res.ok) await load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this booking permanently?")) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) await load();
  }

  const filtered = useMemo(
    () => (bookings || []).filter((b) => filter === "all" || b.status === filter),
    [bookings, filter],
  );
  const counts = (bookings || []).reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-condensed text-2xl font-bold uppercase tracking-widest mr-auto flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" /> Bookings <span className="text-muted-foreground">({bookings?.length ?? 0})</span>
        </h2>
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider transition ${
              filter === s ? "bg-primary text-white border-primary" : "bg-card border-white/10 text-muted-foreground hover:text-white"
            }`}
          >
            {s} {s !== "all" && counts[s] !== undefined && `(${counts[s]})`}
          </button>
        ))}
        <button onClick={() => void load()} className="p-2 rounded border border-white/10 text-muted-foreground hover:text-white" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-300">
          {err} — is the backend deployed and is /api/admin/bookings accessible?
        </div>
      )}

      {bookings === null && !err && <div className="text-muted-foreground text-center py-12">Loading…</div>}

      {bookings !== null && filtered.length === 0 && (
        <div className="text-muted-foreground text-center py-12 border border-white/8 rounded-xl bg-card">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          No bookings yet. Online ride bookings will appear here.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((b) => {
          const expanded = expandedId === b.id;
          return (
            <div key={b.id} className="bg-card border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : b.id)}
                className="w-full grid grid-cols-12 gap-3 items-center px-5 py-4 text-left hover:bg-white/3 transition"
              >
                <div className="col-span-4 sm:col-span-2 text-xs text-white font-mono flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-primary" /> {b.date}
                </div>
                <div className="col-span-3 sm:col-span-1 text-xs text-muted-foreground">{fmtSlot(b.time)}</div>
                <div className="col-span-5 sm:col-span-3 font-medium text-white truncate">{b.name}</div>
                <div className="hidden sm:block sm:col-span-3 text-muted-foreground truncate text-sm">{b.pickup} → {b.dropoff}</div>
                <div className="hidden sm:flex sm:col-span-2 justify-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${BOOKING_STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>
                <div className="hidden sm:flex sm:col-span-1 justify-end text-muted-foreground">
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-white/8 px-5 py-5 space-y-4 bg-background/30">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-primary hover:underline"><PhoneCall className="w-4 h-4" /> {b.phone}</a>
                    <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="w-4 h-4" /> {b.email}</a>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-white"><MapPin className="w-4 h-4 text-muted-foreground" /> {b.pickup} → {b.dropoff}</div>
                    <div className="flex items-center gap-2 text-white"><Users className="w-4 h-4 text-muted-foreground" /> {b.passengers} passenger{b.passengers === 1 ? "" : "s"}</div>
                    <div className="text-muted-foreground">Service: <span className="text-white">{b.serviceType}</span></div>
                    <div className="text-muted-foreground">Trip: <span className="text-white">{b.tripType}</span>{b.customerId ? <span className="ml-2 text-xs text-gold">· account</span> : null}</div>
                  </div>
                  {b.returnDate && (
                    <div className="text-sm text-muted-foreground">Return: <span className="text-white">{b.returnDate} {b.returnTime ? fmtSlot(b.returnTime) : ""}</span></div>
                  )}
                  {b.notes && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Customer notes</div>
                      <p className="text-white whitespace-pre-wrap text-sm">{b.notes}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                      <select
                        value={b.status}
                        onChange={(e) => void update(b.id, { status: e.target.value as BookingStatus })}
                        className="w-full bg-card border border-white/10 rounded px-3 py-2 text-white text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Price quote</div>
                      <input
                        defaultValue={b.priceQuote || ""}
                        onBlur={(e) => { if (e.target.value !== (b.priceQuote || "")) void update(b.id, { priceQuote: e.target.value }); }}
                        placeholder="$150"
                        className="w-full bg-card border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Internal notes</div>
                    <textarea
                      rows={2}
                      defaultValue={b.adminNotes || ""}
                      onBlur={(e) => { if (e.target.value !== (b.adminNotes || "")) void update(b.id, { adminNotes: e.target.value }); }}
                      placeholder="Notes only you see (saves on blur)…"
                      className="w-full bg-card border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => void remove(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilityTab({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [blocks, setBlocks] = useState<BlockedSlot[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch("/api/admin/blocked-slots", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { onLogout(); return; }
      if (!res.ok) { setErr(`Failed (${res.status})`); return; }
      setBlocks(await res.json());
    } catch {
      setErr("Network error");
    }
  }, [token, onLogout]);

  useEffect(() => { void load(); }, [load]);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, time: time || undefined, reason: reason || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d?.error || `Failed (${res.status})`);
      } else {
        setDate(""); setTime(""); setReason("");
        await load();
      }
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/blocked-slots/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-condensed text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
          <CalendarX2 className="w-6 h-6 text-primary" /> Availability
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Block dates or specific times when you're unavailable. Blocked slots won't be bookable on the site. Leave the time empty to block the whole day.
        </p>
      </div>

      <form onSubmit={add} className="bg-card border border-white/10 rounded-xl p-5 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Time (optional)</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} step={3600} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Reason (optional)</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Personal, booked elsewhere…" className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-muted-foreground" />
        </div>
        <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wider">
          <Plus className="w-4 h-4" /> Block
        </button>
      </form>

      {err && <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-300 text-sm">{err}</div>}

      {blocks === null && <div className="text-muted-foreground text-center py-8">Loading…</div>}
      {blocks && blocks.length === 0 && (
        <div className="text-muted-foreground text-center py-10 border border-white/8 rounded-xl bg-card">No blocked dates. Your full schedule is open for booking.</div>
      )}
      {blocks && blocks.length > 0 && (
        <div className="space-y-2">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between bg-card border border-white/8 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarX2 className="w-4 h-4 text-primary" />
                <span className="text-white font-medium">{b.date}</span>
                <span className="text-muted-foreground">{b.time ? fmtSlot(b.time) : "All day"}</span>
                {b.reason && <span className="text-muted-foreground italic">· {b.reason}</span>}
              </div>
              <button onClick={() => void remove(b.id)} className="text-red-400 hover:text-red-300 p-1" title="Remove block">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY),
  );
  const [username, setUsername] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(USERNAME_KEY) ?? "",
  );
  const [me, setMe] = useState<MeResponse | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [loginMessage, setLoginMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", THEME.primary);
    root.style.setProperty("--background", THEME.background);
    root.style.setProperty("--foreground", THEME.foreground);
    root.style.setProperty("--card", THEME.card);
    root.style.setProperty("--card-foreground", THEME.cardFg);
    root.style.setProperty("--muted-foreground", THEME.mutedFg);
    root.style.setProperty("--border", THEME.border);
    root.style.setProperty("--muted", THEME.card);
  }, []);

  const loadMe = useCallback(async (authToken: string) => {
    try {
      const res = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USERNAME_KEY);
        setToken(null);
        setMe(null);
        return;
      }
      const data: MeResponse = await res.json();
      setMe(data);
      if (data.username) setUsername(data.username);
    } catch {
      // network error — keep token, user can retry
    }
  }, []);

  useEffect(() => {
    if (token) void loadMe(token);
  }, [token, loadMe]);

  function handleLoginSuccess(newToken: string, newUsername: string) {
    window.localStorage.setItem(TOKEN_KEY, newToken);
    window.localStorage.setItem(USERNAME_KEY, newUsername);
    setToken(newToken);
    setUsername(newUsername);
    setLoginMessage(undefined);
  }

  function handleLogout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername("");
    setMe(null);
    setTab("bookings");
  }

  function handleCredentialsChanged() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername("");
    setMe(null);
    setTab("bookings");
    setLoginMessage("Credentials updated. Sign in with your new username and password.");
  }

  if (!token) {
    return <LoginScreen onLogin={handleLoginSuccess} initialMessage={loginMessage} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-card/60 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Back to Site</span>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <h1 className="font-condensed text-xl font-bold uppercase tracking-widest">{BUSINESS.shortName} Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-card border border-white/10 rounded overflow-hidden">
              <button onClick={() => setTab("bookings")} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === "bookings" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}>Bookings</button>
              <button onClick={() => setTab("leads")} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === "leads" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}>Leads</button>
              <button onClick={() => setTab("availability")} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === "availability" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}>Availability</button>
              <button onClick={() => setTab("account")} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === "account" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}>Account</button>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:inline">
              <span className="text-white">{username}</span>
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded border border-white/10 text-xs text-muted-foreground hover:text-white">
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {me?.isDefault && (
        <div className="bg-orange-500/15 border-b border-orange-500/40 text-orange-100">
          <div className="container mx-auto px-6 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-300" />
            <p className="text-sm font-bold">
              You're using default credentials. Change them now in
              {" "}
              <button onClick={() => setTab("account")} className="underline font-extrabold">Account</button>.
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8">
        {tab === "bookings" && <BookingsList token={token} onLogout={handleLogout} />}
        {tab === "leads" && <LeadsList token={token} onLogout={handleLogout} />}
        {tab === "availability" && <AvailabilityTab token={token} onLogout={handleLogout} />}
        {tab === "account" && (
          <AccountTab token={token} currentUsername={username} onChanged={handleCredentialsChanged} />
        )}
      </main>
    </div>
  );
}
