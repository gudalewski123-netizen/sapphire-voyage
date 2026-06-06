import React, { useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Plane, Car, Route as RouteIcon, Sparkles, Camera, ArrowRight, PhoneCall,
  ShieldCheck, MapPin, Clock, ChevronDown, CheckCircle2, Star,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BUSINESS } from "./config";
import { LanguageProvider, useLang } from "./i18n";
import { AuthProvider } from "./auth";
import { Nav, Footer, useApplyTheme } from "./components/chrome";
import AdminPage from "./pages/AdminPage";
import BookingPage from "./pages/BookingPage";
import AccountPage from "./pages/AccountPage";

const queryClient = new QueryClient();

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  airport: Plane,
  "point-to-point": Car,
  "long-distance": RouteIcon,
  event: Sparkles,
  tour: Camera,
};

// Lightweight scroll-reveal — no framer-motion (avoids the monorepo's
// duplicate-React hook issue). IntersectionObserver toggles a CSS class.
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-70px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function SectionHead({ eyebrow, title, subtitle, align = "center" }: { eyebrow: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <div className={`mb-14 ${align === "center" ? "text-center max-w-2xl mx-auto" : "text-left max-w-xl"}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-8 bg-gold/50" /> {eyebrow}
      </div>
      <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-[1.08]">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function LandingPage() {
  useApplyTheme();
  const { t } = useLang();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      <Nav />

      {/* ===== Hero ===== */}
      <section id="hero" className="relative min-h-[100svh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src="/hero.jpg" alt="Luxury private car at dusk" className="hero-zoom w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          <div className="absolute -top-1/4 -right-1/4 w-[55rem] h-[55rem] rounded-full bg-primary/10 blur-[140px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-28 pb-20">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 backdrop-blur-sm px-4 py-1.5 mb-7 text-xs font-medium tracking-[0.15em] uppercase text-gold">
                <Star className="w-3.5 h-3.5 fill-current" /> {t.hero.eyebrow}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-[3.25rem] leading-[0.98] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight text-white mb-7">
                {t.hero.headline1}<br />
                <span className="bg-gradient-to-r from-[hsl(199_95%_70%)] via-primary to-[hsl(219_84%_58%)] bg-clip-text text-transparent">{t.hero.headline2}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">{t.hero.subheading}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book" className="group flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-semibold tracking-wide transition-all hover:-translate-y-0.5 shadow-2xl shadow-primary/40">
                  {t.hero.ctaBook} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={`tel:${BUSINESS.phoneRaw}`} className="flex items-center justify-center gap-3 border border-white/20 hover:border-gold/60 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:-translate-y-0.5">
                  <PhoneCall className="w-5 h-5" /> {t.hero.ctaCall}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3">
                {[t.hero.stat1, t.hero.stat2, t.hero.stat3].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-gold" /> {s}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] uppercase tracking-[0.25em]">{t.scrollHint}</span>
          <div className="float-down"><ChevronDown className="w-5 h-5" /></div>
        </div>
      </section>

      {/* ===== Stats band ===== */}
      <section className="relative border-y border-white/10 bg-card/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/8">
            {t.stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.08} className="py-8 px-4 text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-gold mb-1">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground tracking-wide">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Services ===== */}
      <section id="services" className="py-24 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <Reveal><SectionHead eyebrow={t.services.eyebrow} title={t.services.title} subtitle={t.services.subtitle} /></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service, i) => {
              const Icon = SERVICE_ICONS[service.key] ?? Car;
              return (
                <Reveal key={service.key} delay={(i % 3) * 0.08}>
                  <div className="group h-full bg-gradient-to-b from-card to-card/60 border border-white/8 p-8 rounded-2xl hover:border-gold/30 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:text-gold transition-all">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-3">{service.name}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{service.desc}</p>
                  </div>
                </Reveal>
              );
            })}
            <Reveal delay={0.16}>
              <Link href="/book" className="group h-full min-h-[220px] bg-gradient-to-br from-primary to-[hsl(219_84%_34%)] p-8 rounded-2xl flex flex-col justify-between transition-all hover:-translate-y-1.5 shadow-xl shadow-primary/25">
                <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-white"><Clock className="w-7 h-7" /></div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{t.nav.book}</h3>
                  <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
                    {t.hero.ctaBook} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== Experience + gallery ===== */}
      <section id="experience" className="py-24 md:py-28 bg-card border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div>
                <SectionHead eyebrow={t.experience.eyebrow} title={t.experience.title} align="left" />
                <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl">{t.experience.body}</p>
                <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                  {t.experience.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-white/90">
                      <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
                <Link href="/book" className="inline-flex items-center gap-2 bg-white text-background hover:bg-white/90 px-7 py-3.5 rounded-full font-semibold tracking-wide transition-all hover:-translate-y-0.5">
                  {t.hero.ctaBook} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="grid grid-cols-2 gap-4">
                <GalleryTile src="/fleet-1.jpg" className="row-span-2 h-full min-h-[320px]" />
                <GalleryTile src="/fleet-2.jpg" className="h-40 md:h-52" />
                <GalleryTile src="/chauffeur.jpg" className="h-40 md:h-52" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="py-24 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <Reveal><SectionHead eyebrow={t.how.eyebrow} title={t.how.title} /></Reveal>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {t.how.steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="relative">
                  <div className="text-6xl font-display font-bold bg-gradient-to-b from-gold to-gold/20 bg-clip-text text-transparent mb-3">{step.n}</div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">{step.t}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Destinations band ===== */}
      <section id="destinations" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/island.jpg" alt="Puerto Rico coastline" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/82" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <Reveal><SectionHead eyebrow={t.destinations.eyebrow} title={t.destinations.title} subtitle={t.destinations.subtitle} /></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {t.destinations.list.map((d, i) => (
              <Reveal key={d} delay={(i % 4) * 0.06}>
                <div className="bg-card/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex items-center gap-3 hover:border-gold/40 hover:bg-card transition-all h-full">
                  <MapPin className="w-5 h-5 text-gold shrink-0" />
                  <span className="text-sm font-medium text-white/90">{d}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/ocean.jpg" alt="Caribbean ocean at sunset" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/50" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-2xl">
          <Reveal>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">
              <span className="h-px w-8 bg-gold/50" /> {t.finalCta.eyebrow} <span className="h-px w-8 bg-gold/50" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-5">{t.finalCta.title}</h2>
            <p className="text-white/75 mb-9 text-lg">{t.finalCta.body}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-9 py-4 rounded-full font-bold tracking-wide transition-all hover:-translate-y-0.5 shadow-2xl shadow-primary/40">
                {t.hero.ctaBook} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href={`tel:${BUSINESS.phoneRaw}`} className="inline-flex items-center justify-center gap-2 border border-white/25 bg-white/5 backdrop-blur-sm text-white px-9 py-4 rounded-full font-semibold transition-all hover:border-gold/60">
                <PhoneCall className="w-5 h-5" /> {BUSINESS.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function GalleryTile({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 ${className}`}>
      <img src={src} alt="Sapphire Voyage" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/book" component={BookingPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin" component={AdminPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
