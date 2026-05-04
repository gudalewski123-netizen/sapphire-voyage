import { useEffect } from "react";
import { Link } from "wouter";
import {
  PhoneCall, MapPin, Clock, Briefcase, Palette, Star,
  Layers, MessageSquare, ArrowLeft, CheckCircle, User, Image
} from "lucide-react";
import { BUSINESS, HERO, ABOUT, CTA_BANNER, BADGES, SERVICES, REVIEWS, THEME } from "../config";

function hslToHex(hsl: string) {
  const [h, s, l] = hsl.split(" ").map((v, i) => i === 0 ? parseFloat(v) : parseFloat(v) / 100);
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-white/8 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-white/3">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <h2 className="font-condensed text-xl font-bold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-40 shrink-0">{label}</span>
      <span className={`text-white font-medium ${mono ? "font-mono text-sm" : ""}`}>{value}</span>
    </div>
  );
}

function ColorSwatch({ label, hsl }: { label: string; hsl: string }) {
  const hex = hslToHex(hsl);
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded border border-white/10 shrink-0" style={{ background: `hsl(${hsl})` }}></div>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-white font-mono text-sm">{hex} <span className="text-muted-foreground">· hsl({hsl})</span></div>
      </div>
    </div>
  );
}

export default function AdminPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-white/10 bg-card/60 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Back to Site</span>
            </Link>
            <div className="w-px h-5 bg-white/10"></div>
            <h1 className="font-condensed text-2xl font-bold uppercase tracking-widest">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <CheckCircle className="w-4 h-4" />
            Live Config
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">

        {/* Business Info */}
        <Section icon={Briefcase} title="Business Info">
          <Row label="Full Name" value={BUSINESS.name} />
          <Row label="Short Name" value={BUSINESS.shortName} />
          <Row label="Trade / Type" value={BUSINESS.trade} />
          <Row label="Location" value={BUSINESS.location} />
          <Row label="Service Area" value={BUSINESS.serviceArea} />
          <Row label="Phone" value={BUSINESS.phone} />
          <Row label="Phone (raw)" value={BUSINESS.phoneRaw} mono />
          <Row label="Email" value={BUSINESS.email || "— not set —"} />
          <Row label="Hours" value={BUSINESS.hours} />
          <Row label="Years in Business" value={BUSINESS.yearsInBusiness || "— not set —"} />
        </Section>

        {/* Theme Colors */}
        <Section icon={Palette} title="Brand Colors">
          <div className="grid gap-4">
            <ColorSwatch label="Primary (brand accent)" hsl={THEME.primary} />
            <ColorSwatch label="Background" hsl={THEME.background} />
            <ColorSwatch label="Card / Panel" hsl={THEME.card} />
            <ColorSwatch label="Accent" hsl={THEME.accent} />
            <ColorSwatch label="Muted Text" hsl={THEME.mutedFg} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Edit <code className="bg-white/10 px-1 rounded">src/config.ts</code> → THEME to change colors.</p>
        </Section>

        {/* Hero */}
        <Section icon={MessageSquare} title="Hero Copy">
          <Row label="Headline Line 1" value={HERO.headline1} />
          <Row label="Headline Line 2" value={HERO.headline2} />
          <Row label="Subheading" value={HERO.subheading} />
          <Row label="CTA Button 1" value={HERO.cta1} />
          <Row label="CTA Button 2" value={HERO.cta2} />
        </Section>

        {/* About */}
        <Section icon={User} title="About Section">
          <Row label="Headline" value={ABOUT.headline} />
          <Row label="Body Para 1" value={ABOUT.body1} />
          <Row label="Body Para 2" value={ABOUT.body2} />
          <Row label="Photo Alt Text" value={ABOUT.teamPhotoAlt} />
        </Section>

        {/* CTA Banner */}
        <Section icon={MessageSquare} title="CTA Banner">
          <Row label="Headline" value={CTA_BANNER.headline} />
          <Row label="Body" value={CTA_BANNER.body} />
        </Section>

        {/* Trust Badges */}
        <Section icon={CheckCircle} title="Trust Badges">
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b, i) => (
              <span key={i} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded text-sm font-bold uppercase tracking-wider">{b}</span>
            ))}
          </div>
        </Section>

        {/* Services — full width */}
        <div className="lg:col-span-2">
          <Section icon={Layers} title={`Services (${SERVICES.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map((s, i) => (
                <div key={i} className="bg-background border border-white/5 rounded-lg p-4">
                  <div className="font-condensed font-bold uppercase tracking-wide text-white mb-1">{s.name}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Reviews — full width */}
        <div className="lg:col-span-2">
          <Section icon={Star} title={`Reviews (${REVIEWS.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="bg-background border border-white/5 rounded-lg p-4">
                  <div className="flex gap-1 text-yellow-500 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-sm text-white/80 italic mb-3">"{r.text}"</p>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">{r.author}</div>
                  <div className="text-xs text-muted-foreground">{r.source}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Images */}
        <div className="lg:col-span-2">
          <Section icon={Image} title="Images (public/)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { file: "/hero-bg.png", label: "Hero Background", desc: "Full-screen hero image behind the headline" },
                { file: "/team-photo.png", label: "About Photo", desc: "Project/team photo in the About section" },
                { file: "/services-bg.png", label: "CTA Banner BG", desc: "Subtle overlay texture on the CTA banner" },
              ].map((img, i) => (
                <div key={i} className="bg-background border border-white/5 rounded-lg overflow-hidden">
                  <img src={img.file} alt={img.label} className="w-full h-36 object-cover opacity-80" />
                  <div className="p-3">
                    <div className="font-bold text-sm text-white mb-1">{img.label}</div>
                    <div className="text-xs text-muted-foreground mb-1">{img.desc}</div>
                    <code className="text-xs text-primary">public{img.file}</code>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Replace image files in <code className="bg-white/10 px-1 rounded">artifacts/trades-template/public/</code> to update photos.</p>
          </Section>
        </div>

      </div>

      <div className="container mx-auto px-6 pb-10 max-w-6xl">
        <div className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
          Template config lives in <code className="bg-white/10 px-1 rounded">src/config.ts</code> — edit that file to rebrand for any new client.
        </div>
      </div>
    </div>
  );
}
