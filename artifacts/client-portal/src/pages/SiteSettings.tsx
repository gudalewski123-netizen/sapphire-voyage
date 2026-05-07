import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  ArrowLeft, CheckCircle, Clock, Loader2, Globe, LogOut
} from "lucide-react";

type Tab = "quick" | "custom";

interface ChangeRequest {
  id: number;
  requestType: string;
  status: string;
  createdAt: string;
  businessName: string | null;
  phone: string | null;
  aboutText: string | null;
  servicesText: string | null;
  pricingNotes: string | null;
  photoNotes: string | null;
  promptText: string | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
        <CheckCircle className="w-3 h-3" /> Completed
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400">
        <Loader2 className="w-3 h-3 animate-spin" /> In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/8 text-muted-foreground">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function SiteSettings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("quick");
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick update fields
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [photoNotes, setPhotoNotes] = useState("");

  // Custom request
  const [promptText, setPromptText] = useState("");

  const loadRequests = () => {
    api.getRequests().then(setRequests).catch(() => {});
  };

  useEffect(() => { loadRequests(); }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const hasContent = [businessName, phone, aboutText, servicesText, pricingNotes, photoNotes].some(v => v.trim());
    if (!hasContent) {
      setError("Please fill in at least one field before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await api.createRequest({
        requestType: "structured",
        businessName: businessName || undefined,
        phone: phone || undefined,
        aboutText: aboutText || undefined,
        servicesText: servicesText || undefined,
        pricingNotes: pricingNotes || undefined,
        photoNotes: photoNotes || undefined,
      });
      setSuccess(true);
      setBusinessName(""); setPhone(""); setAboutText(""); setServicesText(""); setPricingNotes(""); setPhotoNotes("");
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!promptText.trim()) { setError("Please describe your request"); return; }
    setSubmitting(true);
    try {
      await api.createRequest({ requestType: "custom", promptText });
      setSuccess(true);
      setPromptText("");
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const inputClass = "w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Site Settings</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Request a Website Change</h1>
          <p className="text-muted-foreground text-sm">
            Fill in what you'd like updated. We'll get it done within 24–48 hours.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl px-5 py-4 mb-6">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold">Request submitted!</div>
              <div className="text-sm text-green-400/80">Thanks! We'll get your changes done within 24–48 hours.</div>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-auto text-green-400/60 hover:text-green-400">✕</button>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-5 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("quick"); setSuccess(false); setError(""); }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${tab === "quick" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-white"}`}
            >
              Quick Updates
            </button>
            <button
              onClick={() => { setTab("custom"); setSuccess(false); setError(""); }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${tab === "custom" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-white"}`}
            >
              Custom Request
            </button>
          </div>

          <div className="p-6">
            {tab === "quick" && (
              <form onSubmit={handleQuickSubmit} className="space-y-5">
                <p className="text-muted-foreground text-sm">Fill in only the fields you want changed — leave the rest blank.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Business Name</label>
                    <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                      className={inputClass} placeholder="New business name" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                      className={inputClass} placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>About Section Text</label>
                  <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4}
                    className={inputClass} placeholder="Describe what you'd like the About section to say..." />
                </div>
                <div>
                  <label className={labelClass}>Services List</label>
                  <textarea value={servicesText} onChange={e => setServicesText(e.target.value)} rows={4}
                    className={inputClass} placeholder="List each service on a new line" />
                </div>
                <div>
                  <label className={labelClass}>Pricing Notes</label>
                  <textarea value={pricingNotes} onChange={e => setPricingNotes(e.target.value)} rows={3}
                    className={inputClass} placeholder="Any pricing info you'd like added or updated..." />
                </div>
                <div>
                  <label className={labelClass}>Photo Instructions</label>
                  <textarea value={photoNotes} onChange={e => setPhotoNotes(e.target.value)} rows={3}
                    className={inputClass} placeholder="Describe what photos you want added/replaced, or paste a Google Drive/Dropbox link..." />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
                  {submitting ? "Submitting..." : "Submit Changes"}
                </button>
              </form>
            )}

            {tab === "custom" && (
              <form onSubmit={handleCustomSubmit} className="space-y-5">
                <p className="text-muted-foreground text-sm">Describe any change you need — no template required.</p>
                <div>
                  <label className={labelClass}>What would you like changed?</label>
                  <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={10}
                    className={inputClass}
                    placeholder="Describe any change you'd like — move a section, add a new page, change the color scheme, etc. The more detail the better — feel free to paste links to photos, Google Drive folders, etc." />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Request history */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Request History</h2>
          {requests.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
              No requests yet. Submit your first change above.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {r.requestType === "structured" ? "Quick Update" : "Custom Request"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Submitted {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                          hour: "numeric", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {r.requestType === "structured" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {r.businessName && <div><span className="text-white/50 font-medium">Business Name: </span>{r.businessName}</div>}
                      {r.phone && <div><span className="text-white/50 font-medium">Phone: </span>{r.phone}</div>}
                      {r.aboutText && <div className="sm:col-span-2"><span className="text-white/50 font-medium">About: </span>{r.aboutText.slice(0, 100)}{r.aboutText.length > 100 ? "…" : ""}</div>}
                      {r.servicesText && <div className="sm:col-span-2"><span className="text-white/50 font-medium">Services: </span>{r.servicesText.slice(0, 100)}{r.servicesText.length > 100 ? "…" : ""}</div>}
                      {r.photoNotes && <div className="sm:col-span-2"><span className="text-white/50 font-medium">Photos: </span>{r.photoNotes.slice(0, 100)}{r.photoNotes.length > 100 ? "…" : ""}</div>}
                    </div>
                  )}
                  {r.requestType === "custom" && r.promptText && (
                    <p className="text-xs text-muted-foreground">{r.promptText.slice(0, 200)}{r.promptText.length > 200 ? "…" : ""}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
