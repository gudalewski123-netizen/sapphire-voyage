import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { PhoneCall, Menu, X, Gem, Globe, UserRound } from "lucide-react";
import { BUSINESS, THEME } from "../config";
import { useLang } from "../i18n";
import { useAuth } from "../auth";

export function useApplyTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", THEME.primary);
    root.style.setProperty("--primary-foreground", THEME.primaryFg);
    root.style.setProperty("--background", THEME.background);
    root.style.setProperty("--foreground", THEME.foreground);
    root.style.setProperty("--card", THEME.card);
    root.style.setProperty("--card-foreground", THEME.cardFg);
    root.style.setProperty("--accent", THEME.accent);
    root.style.setProperty("--accent-foreground", THEME.accentFg);
    root.style.setProperty("--muted-foreground", THEME.mutedFg);
    root.style.setProperty("--border", THEME.border);
    root.style.setProperty("--input", THEME.border);
    root.style.setProperty("--ring", THEME.primary);
    root.style.setProperty("--muted", THEME.card);
  }, []);
}

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center rounded-full border border-white/15 overflow-hidden ${compact ? "text-xs" : "text-sm"}`}>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 font-medium transition-colors ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1 font-medium transition-colors ${lang === "es" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[hsl(219_84%_38%)] flex items-center justify-center shadow-lg shadow-primary/20">
        <Gem className="text-white w-5 h-5" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-xl font-bold tracking-tight text-white">Sapphire Voyage</div>
        <div className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-gold">
          {BUSINESS.location}
        </div>
      </div>
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { t } = useLang();
  const { user } = useAuth();
  const onLanding = location === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goSection = (id: string) => {
    setMenuOpen(false);
    if (onLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocation("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || !onLanding ? "bg-background/90 backdrop-blur-md border-b border-white/10 py-3 shadow-xl" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-6 flex justify-between items-center gap-4">
        <Brand />
        <div className="hidden lg:flex items-center gap-7">
          <button onClick={() => goSection("services")} className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t.nav.services}</button>
          <button onClick={() => goSection("how")} className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t.nav.howItWorks}</button>
          <button onClick={() => goSection("about")} className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t.nav.fleet}</button>
          <Link href="/account" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
            <UserRound className="w-4 h-4" /> {user ? t.nav.account : t.nav.login}
          </Link>
          <LangToggle />
          <Link href="/book" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25">
            {t.nav.book}
          </Link>
        </div>
        <div className="flex lg:hidden items-center gap-3">
          <LangToggle compact />
          <button className="text-white p-1.5" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-4">
          <button onClick={() => goSection("services")} className="text-lg font-medium text-left text-white/90">{t.nav.services}</button>
          <button onClick={() => goSection("how")} className="text-lg font-medium text-left text-white/90">{t.nav.howItWorks}</button>
          <button onClick={() => goSection("about")} className="text-lg font-medium text-left text-white/90">{t.nav.fleet}</button>
          <Link href="/account" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-left text-white/90 flex items-center gap-2">
            <UserRound className="w-5 h-5" /> {user ? t.nav.account : t.nav.login}
          </Link>
          <Link href="/book" onClick={() => setMenuOpen(false)} className="bg-primary text-white text-center px-5 py-3 rounded-full font-semibold mt-2">
            {t.nav.book}
          </Link>
          <a href={`tel:${BUSINESS.phoneRaw}`} className="flex items-center justify-center gap-2 border border-white/15 text-white px-5 py-3 rounded-full font-medium">
            <PhoneCall className="w-4 h-4" /> {BUSINESS.phone}
          </a>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-background border-t border-white/10 py-14">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <Brand />
            <p className="text-muted-foreground text-sm mt-4 max-w-xs leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/book" className="hover:text-white transition-colors">{t.nav.book}</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">{t.nav.account}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href={`tel:${BUSINESS.phoneRaw}`} className="hover:text-white transition-colors">{BUSINESS.phone}</a></li>
              <li><a href={`mailto:${BUSINESS.email}`} className="hover:text-white transition-colors break-all">{BUSINESS.email}</a></li>
              <li>{BUSINESS.serviceArea}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5 text-xs text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} {BUSINESS.name}. {t.footer.rights}</div>
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
