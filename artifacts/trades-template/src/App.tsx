import React from "react";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Plane, Car, Route as RouteIcon, Sparkles, Camera, ArrowRight, PhoneCall,
  ShieldCheck, MapPin, Clock, Gem, CheckCircle2, Star,
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

function LandingPage() {
  useApplyTheme();
  const { t } = useLang();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      <Nav />

      {/* Hero */}
      <section id="hero" className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222_47%_9%)] via-background to-[hsl(219_60%_12%)]" />
          <div className="absolute -top-1/3 -right-1/4 w-[60rem] h-[60rem] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] rounded-full bg-[hsl(41_86%_62%)]/5 blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10 py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 mb-7 text-xs font-medium tracking-wide text-gold">
              <Gem className="w-3.5 h-3.5" /> {t.hero.eyebrow}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.02] mb-6 text-white">
              {t.hero.headline1}<br />
              <span className="bg-gradient-to-r from-primary to-[hsl(199_90%_60%)] bg-clip-text text-transparent">{t.hero.headline2}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">{t.hero.subheading}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-semibold tracking-wide transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30">
                {t.hero.ctaBook} <ArrowRight className="w-5 h-5" />
              </Link>
              <a href={`tel:${BUSINESS.phoneRaw}`} className="flex items-center justify-center gap-3 border border-white/15 hover:border-white/40 bg-white/5 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:-translate-y-0.5">
                <PhoneCall className="w-5 h-5" /> {t.hero.ctaCall}
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
              {[t.hero.stat1, t.hero.stat2, t.hero.stat3].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <SectionHead eyebrow={t.services.eyebrow} title={t.services.title} subtitle={t.services.subtitle} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service) => {
              const Icon = SERVICE_ICONS[service.key] ?? Car;
              return (
                <div key={service.key} className="group bg-card border border-white/8 p-8 rounded-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{service.name}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{service.desc}</p>
                </div>
              );
            })}
            <Link href="/book" className="group bg-gradient-to-br from-primary to-[hsl(219_84%_38%)] p-8 rounded-2xl flex flex-col justify-between transition-all hover:-translate-y-1.5 shadow-xl shadow-primary/20">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-6 text-white">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-2">{t.nav.book}</h3>
                <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
                  {t.hero.ctaBook} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-card border-y border-white/5">
        <div className="container mx-auto px-6">
          <SectionHead eyebrow={t.how.eyebrow} title={t.how.title} />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.how.steps.map((step) => (
              <div key={step.n} className="relative">
                <div className="text-6xl font-display font-bold text-primary/20 mb-3">{step.n}</div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">{step.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/book" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25">
              {t.hero.ctaBook} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <SectionHead eyebrow={t.destinations.eyebrow} title={t.destinations.title} subtitle={t.destinations.subtitle} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {t.destinations.list.map((d) => (
              <div key={d} className="bg-card border border-white/8 rounded-xl p-5 flex items-center gap-3 hover:border-primary/40 transition-all">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-white/90">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-card border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/30 via-[hsl(219_60%_18%)] to-background border border-white/10 flex items-center justify-center overflow-hidden">
                <Gem className="w-24 h-24 text-primary/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(41_86%_62%/0.15),transparent_50%)]" />
              </div>
            </div>
            <div>
              <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} align="left" />
              <p className="text-muted-foreground leading-relaxed mb-5">{t.about.body1}</p>
              <p className="text-muted-foreground leading-relaxed mb-8">{t.about.body2}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {t.about.badges.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(219_84%_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-5 max-w-2xl mx-auto">{t.hero.headline1} {t.hero.headline2}</h2>
          <p className="text-white/85 mb-9 max-w-xl mx-auto">{t.services.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-full font-bold tracking-wide transition-all hover:scale-105">
              {t.hero.ctaBook} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href={`tel:${BUSINESS.phoneRaw}`} className="inline-flex items-center justify-center gap-2 bg-primary-foreground/10 border border-white/30 text-white px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10">
              <PhoneCall className="w-5 h-5" /> {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHead({ eyebrow, title, subtitle, align = "center" }: { eyebrow: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <div className={`mb-14 ${align === "center" ? "text-center max-w-2xl mx-auto" : "text-left"}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-3 ${align === "center" ? "justify-center" : ""}`}>
        <Star className="w-3.5 h-3.5" /> {eyebrow}
      </div>
      <h2 className="text-3xl md:text-5xl font-display font-bold text-white">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-4 leading-relaxed">{subtitle}</p>}
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
