import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "es";

// ============================================================
//  Sapphire Voyage — bilingual copy (English / Español)
//  Every visible string lives here so the EN/ES toggle is total.
// ============================================================
const DICT = {
  en: {
    nav: {
      services: "Services",
      howItWorks: "How It Works",
      fleet: "Experience",
      book: "Book a Ride",
      account: "My Account",
      login: "Sign In",
      call: "Call",
    },
    hero: {
      eyebrow: "Private Transportation · San Juan, Puerto Rico",
      headline1: "Arrive in",
      headline2: "Sapphire Comfort",
      subheading:
        "Premium private transfers across Puerto Rico — airport pickups, point-to-point rides in San Juan, and long-distance journeys to Fajardo, Arecibo, Ponce, and Rincón. Book online in seconds.",
      ctaBook: "Book Your Ride",
      ctaCall: "Call Us",
      stat1: "On-time, every time",
      stat2: "Island-wide service",
      stat3: "Bilingual chauffeur",
    },
    services: {
      eyebrow: "What We Offer",
      title: "Travel, Elevated",
      subtitle: "From a quick airport run to a full day exploring the island.",
      items: [
        {
          key: "airport",
          name: "Airport Transfers",
          desc: "Reliable pickups and drop-offs at SJU and regional airports. We track your flight so we're there when you land.",
        },
        {
          key: "point-to-point",
          name: "Point-to-Point",
          desc: "Door-to-door rides anywhere in San Juan and the metro area — dinner, hotels, business, nightlife.",
        },
        {
          key: "long-distance",
          name: "Long-Distance Trips",
          desc: "Comfortable journeys across the island to Fajardo, Arecibo, Ponce, Rincón, and beyond. One-way or round trip.",
        },
        {
          key: "event",
          name: "Private Events",
          desc: "Weddings, proms, corporate clients, influencers, and artists. Arrive in style with a dedicated chauffeur.",
        },
        {
          key: "tour",
          name: "Island Tours",
          desc: "Curated tours of Puerto Rico's beaches, rainforest, and historic landmarks — at your own pace.",
        },
      ],
    },
    how: {
      eyebrow: "How It Works",
      title: "Booking Takes a Minute",
      steps: [
        { n: "01", t: "Pick a date & time", d: "Choose from real-time available slots on our live calendar." },
        { n: "02", t: "Tell us your trip", d: "Pickup, drop-off, one-way or round trip, and number of passengers." },
        { n: "03", t: "Get confirmed", d: "We confirm your ride and send your details. Sit back and enjoy the voyage." },
      ],
    },
    destinations: {
      eyebrow: "Where We Go",
      title: "Island-Wide Destinations",
      subtitle: "Rates from $150 to $500 depending on distance — you'll get a confirmed quote before your trip.",
      list: [
        "San Juan Airport (SJU)",
        "Old San Juan",
        "Fajardo",
        "Arecibo",
        "Ponce",
        "Rincón",
        "Dorado",
        "El Yunque",
      ],
      from: "from",
    },
    about: {
      eyebrow: "The Sapphire Standard",
      title: "More Than a Ride",
      body1:
        "Sapphire Voyage is a private transportation service built for travelers who value comfort, punctuality, and a personal touch. Whether you're landing at SJU, heading to an event, or exploring the island, you'll travel with a professional, bilingual chauffeur who knows Puerto Rico.",
      body2:
        "We serve private clients, corporate guests, wedding parties, influencers, and artists — anyone who wants to arrive relaxed and on time. Every trip is private, every quote is upfront, and every detail is handled.",
      badges: ["Licensed & Insured", "Bilingual Chauffeur", "Flat, Upfront Pricing", "Flight Tracking"],
    },
    booking: {
      title: "Book Your Ride",
      subtitle: "Pick an available time, tell us about your trip, and we'll confirm.",
      stepDate: "1. Choose a date",
      stepTime: "2. Choose a time",
      stepDetails: "3. Trip details",
      noSlots: "No times available for this date. Please pick another day.",
      loadingSlots: "Loading available times…",
      selectDateFirst: "Select a date to see available times.",
      slotTaken: "Taken",
      serviceType: "Type of service",
      tripType: "Trip type",
      oneWay: "One way",
      roundTrip: "Round trip",
      pickup: "Pickup location",
      dropoff: "Drop-off location",
      passengers: "Passengers",
      returnDate: "Return date",
      returnTime: "Return time",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      notes: "Notes (flight #, luggage, special requests)",
      submit: "Request Booking",
      submitting: "Sending…",
      required: "Please fill in all required fields and pick a time slot.",
      successTitle: "Booking received!",
      successBody: "We'll confirm your ride shortly. A summary is below — add it to your calendar:",
      addToCalendar: "Add to Calendar",
      bookAnother: "Book another ride",
      loggedInAs: "Booking as",
      signInPrompt: "Have an account? Sign in to book faster and track your trips.",
    },
    account: {
      title: "My Account",
      welcome: "Welcome back",
      signInTitle: "Sign In",
      registerTitle: "Create Account",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      password: "Password",
      signIn: "Sign In",
      register: "Create Account",
      signOut: "Sign Out",
      toRegister: "New here? Create an account",
      toSignIn: "Already have an account? Sign in",
      myTrips: "My Trips",
      noTrips: "No trips yet. Book your first ride!",
      bookNow: "Book a Ride",
      working: "Please wait…",
    },
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    footer: {
      tagline: "Premium private transportation across Puerto Rico.",
      rights: "All rights reserved.",
      quickLinks: "Quick Links",
      contact: "Contact",
    },
    common: {
      backHome: "← Back to home",
    },
  },

  es: {
    nav: {
      services: "Servicios",
      howItWorks: "Cómo Funciona",
      fleet: "Experiencia",
      book: "Reservar",
      account: "Mi Cuenta",
      login: "Iniciar Sesión",
      call: "Llamar",
    },
    hero: {
      eyebrow: "Transporte Privado · San Juan, Puerto Rico",
      headline1: "Llega con",
      headline2: "Confort Sapphire",
      subheading:
        "Traslados privados premium por todo Puerto Rico — recogidas en el aeropuerto, viajes punto a punto en San Juan y trayectos de larga distancia a Fajardo, Arecibo, Ponce y Rincón. Reserva en línea en segundos.",
      ctaBook: "Reserva tu Viaje",
      ctaCall: "Llámanos",
      stat1: "Siempre puntuales",
      stat2: "Servicio en toda la isla",
      stat3: "Chofer bilingüe",
    },
    services: {
      eyebrow: "Lo Que Ofrecemos",
      title: "Viajar, a Otro Nivel",
      subtitle: "Desde una recogida rápida en el aeropuerto hasta un día completo explorando la isla.",
      items: [
        {
          key: "airport",
          name: "Traslados al Aeropuerto",
          desc: "Recogidas y entregas confiables en SJU y aeropuertos regionales. Rastreamos tu vuelo para estar allí cuando aterrices.",
        },
        {
          key: "point-to-point",
          name: "Punto a Punto",
          desc: "Viajes puerta a puerta en San Juan y el área metro — cenas, hoteles, negocios, vida nocturna.",
        },
        {
          key: "long-distance",
          name: "Viajes de Larga Distancia",
          desc: "Trayectos cómodos por toda la isla a Fajardo, Arecibo, Ponce, Rincón y más. Solo ida o ida y vuelta.",
        },
        {
          key: "event",
          name: "Eventos Privados",
          desc: "Bodas, proms, clientes corporativos, influencers y artistas. Llega con estilo y chofer dedicado.",
        },
        {
          key: "tour",
          name: "Tours por la Isla",
          desc: "Tours seleccionados por las playas, el bosque lluvioso y los lugares históricos de Puerto Rico — a tu ritmo.",
        },
      ],
    },
    how: {
      eyebrow: "Cómo Funciona",
      title: "Reservar Toma un Minuto",
      steps: [
        { n: "01", t: "Elige fecha y hora", d: "Escoge entre los horarios disponibles en tiempo real en nuestro calendario." },
        { n: "02", t: "Cuéntanos tu viaje", d: "Recogida, destino, solo ida o ida y vuelta, y número de pasajeros." },
        { n: "03", t: "Recibe tu confirmación", d: "Confirmamos tu viaje y te enviamos los detalles. Relájate y disfruta." },
      ],
    },
    destinations: {
      eyebrow: "A Dónde Vamos",
      title: "Destinos en Toda la Isla",
      subtitle: "Tarifas desde $150 hasta $500 según la distancia — recibirás una cotización confirmada antes de tu viaje.",
      list: [
        "Aeropuerto de San Juan (SJU)",
        "Viejo San Juan",
        "Fajardo",
        "Arecibo",
        "Ponce",
        "Rincón",
        "Dorado",
        "El Yunque",
      ],
      from: "desde",
    },
    about: {
      eyebrow: "El Estándar Sapphire",
      title: "Más Que un Viaje",
      body1:
        "Sapphire Voyage es un servicio de transporte privado creado para viajeros que valoran el confort, la puntualidad y el trato personal. Ya sea que aterrices en SJU, vayas a un evento o explores la isla, viajarás con un chofer profesional y bilingüe que conoce Puerto Rico.",
      body2:
        "Atendemos clientes privados, huéspedes corporativos, bodas, influencers y artistas — cualquiera que quiera llegar relajado y a tiempo. Cada viaje es privado, cada cotización es clara, y cada detalle está cubierto.",
      badges: ["Licencia y Seguro", "Chofer Bilingüe", "Precio Fijo y Claro", "Rastreo de Vuelos"],
    },
    booking: {
      title: "Reserva tu Viaje",
      subtitle: "Elige una hora disponible, cuéntanos sobre tu viaje y te confirmamos.",
      stepDate: "1. Elige una fecha",
      stepTime: "2. Elige una hora",
      stepDetails: "3. Detalles del viaje",
      noSlots: "No hay horarios disponibles para esta fecha. Por favor elige otro día.",
      loadingSlots: "Cargando horarios disponibles…",
      selectDateFirst: "Selecciona una fecha para ver los horarios disponibles.",
      slotTaken: "Ocupado",
      serviceType: "Tipo de servicio",
      tripType: "Tipo de viaje",
      oneWay: "Solo ida",
      roundTrip: "Ida y vuelta",
      pickup: "Lugar de recogida",
      dropoff: "Lugar de destino",
      passengers: "Pasajeros",
      returnDate: "Fecha de regreso",
      returnTime: "Hora de regreso",
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      notes: "Notas (# de vuelo, equipaje, peticiones especiales)",
      submit: "Solicitar Reserva",
      submitting: "Enviando…",
      required: "Por favor completa los campos requeridos y elige un horario.",
      successTitle: "¡Reserva recibida!",
      successBody: "Confirmaremos tu viaje en breve. Aquí está el resumen — agrégalo a tu calendario:",
      addToCalendar: "Agregar al Calendario",
      bookAnother: "Reservar otro viaje",
      loggedInAs: "Reservando como",
      signInPrompt: "¿Tienes cuenta? Inicia sesión para reservar más rápido y ver tus viajes.",
    },
    account: {
      title: "Mi Cuenta",
      welcome: "Bienvenido de nuevo",
      signInTitle: "Iniciar Sesión",
      registerTitle: "Crear Cuenta",
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      password: "Contraseña",
      signIn: "Iniciar Sesión",
      register: "Crear Cuenta",
      signOut: "Cerrar Sesión",
      toRegister: "¿Nuevo aquí? Crea una cuenta",
      toSignIn: "¿Ya tienes cuenta? Inicia sesión",
      myTrips: "Mis Viajes",
      noTrips: "Aún no tienes viajes. ¡Reserva tu primer viaje!",
      bookNow: "Reservar",
      working: "Por favor espera…",
    },
    status: {
      pending: "Pendiente",
      confirmed: "Confirmado",
      completed: "Completado",
      cancelled: "Cancelado",
    },
    footer: {
      tagline: "Transporte privado premium por todo Puerto Rico.",
      rights: "Todos los derechos reservados.",
      quickLinks: "Enlaces",
      contact: "Contacto",
    },
    common: {
      backHome: "← Volver al inicio",
    },
  },
} as const;

export type Dict = (typeof DICT)["en"];

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "sv_lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "es") return saved;
  // Default to Spanish for visitors whose browser is in Spanish.
  const nav = window.navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return <Ctx.Provider value={{ lang, setLang, t: DICT[lang] }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
