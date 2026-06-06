// ============================================================
//  SAPPHIRE VOYAGE — site config (language-neutral facts only)
//  All visible copy lives in i18n.tsx (EN/ES). This file holds
//  brand facts, contact info, and theme colors.
// ============================================================

export const BUSINESS = {
  name: "Sapphire Voyage",
  shortName: "Sapphire Voyage",
  location: "San Juan, Puerto Rico",
  serviceArea: "San Juan & all of Puerto Rico",

  // TODO: replace with the real business phone number.
  phone: "(787) 555-0123",
  phoneRaw: "+17875550123",

  // Lead / booking notifications are emailed here via FormSubmit.
  email: "gudalewski123@gmail.com",

  // Social (optional — leave blank to hide).
  instagram: "",
};

// Theme — HSL triplets (no hsl() wrapper). Mirrors index.css :root so every
// page is consistent. Sapphire blue primary, champagne gold accent, midnight navy.
export const THEME = {
  primary: "219 84% 52%",
  primaryFg: "0 0% 100%",
  background: "222 47% 7%",
  foreground: "210 40% 96%",
  card: "222 40% 11%",
  cardFg: "210 40% 96%",
  accent: "41 86% 62%",
  accentFg: "222 47% 7%",
  mutedFg: "215 25% 72%",
  border: "219 28% 20%",
};
