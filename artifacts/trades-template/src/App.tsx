// Macias Multy Services LLC — Miami, FL


import React, { useState, useEffect } from "react";
import { PhoneCall, ShieldCheck, Hammer, Menu, X, MapPin, ChevronRight, Star, ArrowRight, Zap, MessageSquare, Mail, MessageCircle } from "lucide-react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const SERVICES = [
  { name: "Fence Installation", desc: "New fence installations for residential and commercial properties. We work with wood, vinyl, chain link, aluminum, and more — built to last in Florida's climate." },
  { name: "Fence Repair", desc: "Damaged, leaning, or rotting fence? We fix it fast. From broken posts and rails to full panel replacements, we restore your fence to like-new condition." },
  { name: "Wood Fencing", desc: "Beautiful custom wood fences that add privacy and curb appeal. We use quality treated lumber and expert craftsmanship for a fence that looks great for years." },
  { name: "Vinyl & PVC Fencing", desc: "Low-maintenance vinyl fences in a variety of styles and colors. Durable, weather-resistant, and perfect for South Florida's heat and humidity." },
  { name: "Chain Link Fencing", desc: "Affordable and durable chain link fences for residential, commercial, and security applications. Quick installation with long-lasting results." },
  { name: "Gate Installation & Repair", desc: "We install and repair manual and automatic gates for driveways and entrances. Secure, smooth operation — done right the first time." },
];

const REVIEWS = [
  {
    text: "Macias Multy Services did an amazing job replacing our old wooden fence. They were on time, professional, and the finished product looks incredible. Definitely recommend them to anyone in Miami.",
    author: "Roberto G.",
    source: "Google Review"
  },
  {
    text: "Called them for an emergency fence repair after a storm knocked part of it down. They came out the same day and had it fixed quickly. Great price and great service — 5 stars all the way.",
    author: "Maria S.",
    source: "Google Review"
  },
  {
    text: "Had them install a full vinyl privacy fence around our backyard. The crew was clean, respectful, and finished ahead of schedule. Our neighbors already asked for their number!",
    author: "James T.",
    source: "Google Review"
  }
];

const YEARS_IN_BUSINESS = "";

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showYearsBadge = YEARS_IN_BUSINESS && YEARS_IN_BUSINESS !== "0" && YEARS_IN_BUSINESS !== "[[YEARS_IN_BUSINESS]]";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="font-condensed text-2xl font-bold leading-none tracking-wider text-white uppercase">Macias Multy Services</div>
              <div className="font-condensed text-primary text-sm font-bold tracking-widest uppercase leading-none">Fence Contractor · Miami, FL</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('services')} className="font-condensed text-lg uppercase tracking-wide hover:text-primary transition-colors">Services</button>
            <button onClick={() => scrollTo('about')} className="font-condensed text-lg uppercase tracking-wide hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollTo('reviews')} className="font-condensed text-lg uppercase tracking-wide hover:text-primary transition-colors">Reviews</button>
            <a href="tel:+17869298933" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded font-condensed text-xl uppercase tracking-wider font-bold transition-all hover:-translate-y-1 shadow-[0_0_20px_rgba(238,90,68,0.3)]">
              <PhoneCall className="w-5 h-5" />
              (786) 929-8933
            </a>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden">
          <button onClick={() => scrollTo('services')} className="font-condensed text-3xl uppercase tracking-wide text-left border-b border-white/10 pb-4">Services</button>
          <button onClick={() => scrollTo('about')} className="font-condensed text-3xl uppercase tracking-wide text-left border-b border-white/10 pb-4">About</button>
          <button onClick={() => scrollTo('reviews')} className="font-condensed text-3xl uppercase tracking-wide text-left border-b border-white/10 pb-4">Reviews</button>
          <button onClick={() => scrollTo('contact')} className="font-condensed text-3xl uppercase tracking-wide text-left border-b border-white/10 pb-4">Contact</button>
          <a href="tel:+17869298933" className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded font-condensed text-2xl uppercase tracking-wider font-bold mt-4">
            <PhoneCall className="w-6 h-6" />
            (786) 929-8933
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Fence installation professional working in Florida" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-condensed uppercase tracking-tight leading-[0.9] mb-6">
              Fences Built <br/>
              <span className="text-primary">To Stand Strong</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Expert fence installation and repair across Miami and South Florida. From wood and vinyl to chain link and gates — Macias Multy Services delivers quality fencing on time and on budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+17869298933" className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded font-condensed text-2xl uppercase tracking-wider font-bold transition-all hover:-translate-y-1 shadow-[0_0_30px_rgba(238,90,68,0.4)]">
                <PhoneCall className="w-6 h-6" />
                Call (786) 929-8933
              </a>
              <button onClick={() => scrollTo('contact')} className="flex items-center justify-center gap-3 bg-card hover:bg-card/80 border border-white/10 text-white px-8 py-4 rounded font-condensed text-2xl uppercase tracking-wider font-bold transition-all hover:-translate-y-1">
                Get a Free Quote
              </button>
            </div>
            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 font-condensed font-bold text-lg uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                Licensed &amp; Insured
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-2 font-condensed font-bold text-lg uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                Free Estimates
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-2 font-condensed font-bold text-lg uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                Available 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-sm flex items-center justify-center gap-2">
              <Hammer className="w-4 h-4" /> Our Expertise
            </h2>
            <h3 className="text-4xl md:text-5xl font-condensed font-bold uppercase tracking-wide">What We Do Best</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <div key={i} className="group bg-card border border-white/5 p-8 rounded hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-background border border-white/10 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-condensed font-bold uppercase tracking-wide mb-3">{service.name}</h4>
                <p className="text-muted-foreground mb-6 flex-grow">{service.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mt-auto">
                  Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-card relative border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 border border-primary/20 rounded translate-x-4 translate-y-4"></div>
              <img src="/team-photo.png" alt="Macias Multy Services fence installation project in Miami" className="w-full h-auto rounded relative z-10 hover:scale-[1.02] transition-all duration-500" />
              {showYearsBadge && (
                <div className="absolute bottom-8 -right-8 bg-primary p-6 rounded shadow-2xl z-20 hidden md:block">
                  <div className="font-condensed text-5xl font-black text-white leading-none mb-1">{YEARS_IN_BUSINESS}+</div>
                  <div className="text-white/80 font-bold uppercase tracking-wider text-sm">Years Experience</div>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> About Us
              </h2>
              <h3 className="text-4xl md:text-6xl font-condensed font-bold uppercase tracking-wide mb-6 leading-tight">We Build Fences That Last.</h3>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Macias Multy Services LLC is a trusted fence contractor serving Miami and South Florida. We specialize in residential and commercial fence installation, repair, and gate work — handling every job with precision and care.
              </p>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Whether you need a new privacy fence, a quick repair after storm damage, or a custom gate for your driveway — our team shows up on time, works clean, and delivers results you'll be proud of.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {['Licensed & Insured', 'Upfront Pricing', 'Free Estimates', 'Clean & Respectful'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <a href="tel:+17869298933" className="inline-flex items-center gap-2 bg-white text-background hover:bg-white/90 px-8 py-4 rounded font-condensed text-xl uppercase tracking-wider font-bold transition-all hover:-translate-y-1">
                Call Us Now <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('/services-bg.png')] opacity-10 object-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-condensed font-black uppercase tracking-wide text-white mb-6">Need a Fence? We've Got You.</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium">Get a free quote today. Installation, repair, or gates — we handle it all across Miami and South Florida. Available 24 hours a day.</p>
          <a href="tel:+17869298933" className="inline-flex items-center justify-center gap-3 bg-background hover:bg-background/90 text-white px-10 py-5 rounded font-condensed text-3xl uppercase tracking-wider font-black transition-all hover:scale-105 shadow-2xl">
            <PhoneCall className="w-8 h-8 text-primary" />
            (786) 929-8933
          </a>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-sm flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> Client Testimonials
            </h2>
            <h3 className="text-4xl md:text-5xl font-condensed font-bold uppercase tracking-wide">Don't Just Take Our Word For It</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-card border border-white/5 p-8 rounded hover:border-white/20 transition-all duration-300 hover:-translate-y-2">
                <div className="flex gap-1 text-yellow-500 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-lg mb-8 leading-relaxed italic text-white/90">"{review.text}"</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-condensed font-bold text-xl uppercase tracking-wide">{review.author}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{review.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-card border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-sm flex items-center justify-center gap-2">
              <PhoneCall className="w-4 h-4" /> Get In Touch
            </h2>
            <h3 className="text-4xl md:text-6xl font-condensed font-bold uppercase tracking-wide mb-4">Ready to Help, Right Now</h3>
            <p className="text-muted-foreground text-lg">Call or text us — we're available 24 hours a day, 7 days a week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            <a href="tel:+17869298933" className="group bg-primary hover:bg-primary/90 p-8 rounded flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-2 shadow-[0_0_30px_rgba(238,90,68,0.3)]">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <PhoneCall className="w-8 h-8 text-white" />
              </div>
              <div className="font-condensed text-sm font-bold uppercase tracking-widest text-white/70">Call Us</div>
              <div className="font-condensed text-3xl font-black text-white uppercase tracking-wide leading-tight">(786) 929-8933</div>
              <div className="text-white/60 text-sm font-medium">Tap to call instantly</div>
            </a>

            <a href="sms:+17869298933" className="group bg-background border border-white/10 hover:border-primary/50 p-8 rounded flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="font-condensed text-sm font-bold uppercase tracking-widest text-muted-foreground">Text Us</div>
              <div className="font-condensed text-3xl font-black text-white uppercase tracking-wide leading-tight">(786) 929-8933</div>
              <div className="text-muted-foreground text-sm font-medium">Tap to open messages</div>
            </a>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-10 max-w-3xl mx-auto pt-10 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background border border-white/10 rounded flex items-center justify-center shrink-0 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Service Area</div>
                <div className="text-white font-medium">Miami & South Florida</div>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background border border-white/10 rounded flex items-center justify-center shrink-0 text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Hours</div>
                <div className="text-white font-medium">Open 24 Hours — 7 Days a Week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Hammer className="text-white w-4 h-4" />
              </div>
              <span className="font-condensed text-2xl font-bold uppercase tracking-wider">Macias Multy Services LLC</span>
            </div>
            <div className="text-muted-foreground text-sm font-medium">
              &copy; {new Date().getFullYear()} Macias Multy Services LLC. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">License: Licensed & Insured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
