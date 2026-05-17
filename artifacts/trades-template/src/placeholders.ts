// ============================================================
//  PLACEHOLDER PHOTOS — trade-specific stock images from Unsplash.
//
//  These are used until the client provides their own real photos.
//  All images are sourced from Unsplash and free for commercial use.
//
//  HOW IT WORKS:
//    1. Set BUSINESS.tradeType in config.ts to one of the keys below.
//    2. The frontend imports `getPlaceholders(BUSINESS.tradeType)` and
//       uses .hero, .about, and .gallery as default <img src=...>.
//    3. When the client sends real photos, drop them in public/ with
//       the same filenames you'd use to override (hero.jpg, about.jpg,
//       gallery-1.jpg, etc.) and update the imports in App.tsx.
//
//  ADDING A NEW TRADE:
//    Add a new key below with 5-6 Unsplash photo URLs. Format:
//    https://images.unsplash.com/photo-<id>?w=1600&q=80&auto=format&fit=crop
//
//  SWAPPING A BROKEN URL:
//    Go to unsplash.com → search keyword → click a photo → copy its URL.
//    The format `https://images.unsplash.com/photo-<long-id>` is what you want.
//
//  UNKNOWN TRADE TYPES:
//    If BUSINESS.tradeType doesn't match a key below, the site renders
//    obvious gray "Add Photo" cards (via placehold.co) instead of random
//    unrelated stock photos. This is intentional — a generic placeholder
//    is better than a misleading one (e.g. a hair salon site that
//    accidentally shows a swimming pool).
// ============================================================

interface TradePhotos {
  hero: string;
  about: string;
  gallery: string[];
}

// Helper to build a consistent Unsplash CDN URL from a photo ID.
const u = (id: string, w: number = 1600): string =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// Helper to build a placehold.co gray "Add Photo" card at a given size.
const ph = (w: number, h: number): string =>
  `https://placehold.co/${w}x${h}/e5e7eb/6b7280?text=Add+Photo`;

// Default fallback — used when tradeType doesn't match any key below.
// Obvious gray placeholder cards, NOT random stock photos. This makes
// it impossible for an unmatched trade to ship with misleading imagery.
const DEFAULT_PHOTOS: TradePhotos = {
  hero: ph(1600, 900),
  about: ph(800, 600),
  gallery: [ph(800, 600), ph(800, 600), ph(800, 600), ph(800, 600)],
};

// Curated trade-specific stock photos.
// Each entry has 1 hero (landscape, big), 1 about photo, and 4 gallery images.
export const TRADE_PLACEHOLDERS: Record<string, TradePhotos> = {
  softwash: {
    hero: u("1558618666-fcd25c85cd64"),
    about: u("1581578731548-c64695cc6952", 1000),
    gallery: [
      u("1572297-c25b54cea5b3", 1000),
      u("1558618666-fcd25c85cd64", 1000),
      u("1604754742629-3e5728249d73", 1000),
      u("1597047084897-51e81819a499", 1000),
    ],
  },
  roofing: {
    hero: u("1632778149955-e80f8ceca2e8"),
    about: u("1605276373954-0c4a0dac5b12", 1000),
    gallery: [
      u("1632778149959-c0ce1e2cba8b", 1000),
      u("1605276373954-0c4a0dac5b12", 1000),
      u("1568952433726-3896e3881c65", 1000),
      u("1564013434775-f71db0030976", 1000),
    ],
  },
  "lawn-care": {
    hero: u("1558904541-efa843a96f01"),
    about: u("1599629954294-14df9ec8bc03", 1000),
    gallery: [
      u("1558904541-efa843a96f01", 1000),
      u("1599629954294-14df9ec8bc03", 1000),
      u("1571171637578-41bc2dd41cd2", 1000),
      u("1592595896616-c37162298647", 1000),
    ],
  },
  fencing: {
    hero: u("1611057638725-6fbf2cdca1c4"),
    about: u("1593079831268-3381b0db4a77", 1000),
    gallery: [
      u("1611057638725-6fbf2cdca1c4", 1000),
      u("1593079831268-3381b0db4a77", 1000),
      u("1554995207-c18c203602cb", 1000),
      u("1581094271901-8022df4466f9", 1000),
    ],
  },
  "auto-detailing": {
    hero: u("1601362840469-51e4d8d58785"),
    about: u("1492144534655-ae79c964c9d7", 1000),
    gallery: [
      u("1601362840469-51e4d8d58785", 1000),
      u("1492144534655-ae79c964c9d7", 1000),
      u("1503376780353-7e6692767b70", 1000),
      u("1542362567-b07e54358753", 1000),
    ],
  },
  "junk-removal": {
    hero: u("1605600659908-0ef719419d41"),
    about: u("1532996122724-e3c354a0b15b", 1000),
    gallery: [
      u("1605600659908-0ef719419d41", 1000),
      u("1532996122724-e3c354a0b15b", 1000),
      u("1517048676732-d65bc937f952", 1000),
      u("1542621334-a254cf47733d", 1000),
    ],
  },
  hvac: {
    hero: u("1581094271901-8022df4466f9"),
    about: u("1621905251918-48416bd8575a", 1000),
    gallery: [
      u("1581094271901-8022df4466f9", 1000),
      u("1621905251918-48416bd8575a", 1000),
      u("1607400201515-c2c41c07d307", 1000),
      u("1581094543395-2c10ad6fc6a3", 1000),
    ],
  },
  plumbing: {
    hero: u("1542013936693-884638332954"),
    about: u("1607400201889-565b1ee75f8e", 1000),
    gallery: [
      u("1542013936693-884638332954", 1000),
      u("1607400201889-565b1ee75f8e", 1000),
      u("1581244277943-fe4a9c777189", 1000),
      u("1585128792020-803d29415281", 1000),
    ],
  },
  electrical: {
    hero: u("1620207418302-439b387441b0"),
    about: u("1581094288338-2314dddb7ece", 1000),
    gallery: [
      u("1620207418302-439b387441b0", 1000),
      u("1581094288338-2314dddb7ece", 1000),
      u("1565608087341-404b25492fee", 1000),
      u("1565608087341-404b25492fee", 1000),
    ],
  },
  painting: {
    hero: u("1562259949-e8e7689d7828"),
    about: u("1503387762-bf3d39b32de9", 1000),
    gallery: [
      u("1562259949-e8e7689d7828", 1000),
      u("1503387762-bf3d39b32de9", 1000),
      u("1589939705384-5185137a7f0f", 1000),
      u("1503951914875-452162b0f3f1", 1000),
    ],
  },
  "tree-services": {
    hero: u("1565073624497-7e91b5cc3843"),
    about: u("1551522435-b8a4d3a06f3e", 1000),
    gallery: [
      u("1565073624497-7e91b5cc3843", 1000),
      u("1551522435-b8a4d3a06f3e", 1000),
      u("1597248374161-426f0d6d2fc9", 1000),
      u("1502082553048-f009c37129b9", 1000),
    ],
  },
  cleaning: {
    hero: u("1581578731548-c64695cc6952"),
    about: u("1527515637462-cff94eecc1ac", 1000),
    gallery: [
      u("1581578731548-c64695cc6952", 1000),
      u("1527515637462-cff94eecc1ac", 1000),
      u("1581992652564-44c42f5ad3ad", 1000),
      u("1584820927498-cfe5211fd8bf", 1000),
    ],
  },
  // ─── New trade-specific entries (added to stop random/wrong fallback photos) ───
  salon: {
    hero: u("1560066984-138dadb4c035"),
    about: u("1522337360788-8b13dee7a37e", 1000),
    gallery: [
      u("1560066984-138dadb4c035", 1000),
      u("1604654894610-df63bc536371", 1000),
      u("1607779097040-26e80aa78e66", 1000),
      u("1599387737875-3a48f7b6dfd1", 1000),
    ],
  },
  barber: {
    hero: u("1521498542256-5aeb47ba2b36"),
    about: u("1599351431202-1e0f0137899a", 1000),
    gallery: [
      u("1521498542256-5aeb47ba2b36", 1000),
      u("1503951914875-452162b0f3f1", 1000),
      u("1622286342621-4bd786c2447c", 1000),
      u("1605497788044-5a32c7078486", 1000),
    ],
  },
  beauty: {
    hero: u("1522337360788-8b13dee7a37e"),
    about: u("1487412947147-5cebf100ffc2", 1000),
    gallery: [
      u("1522337360788-8b13dee7a37e", 1000),
      u("1487412947147-5cebf100ffc2", 1000),
      u("1607779097040-26e80aa78e66", 1000),
      u("1604654894610-df63bc536371", 1000),
    ],
  },
  fitness: {
    hero: u("1571019613454-1cb2f99b2d8b"),
    about: u("1534438327276-14e5300c3a48", 1000),
    gallery: [
      u("1571019613454-1cb2f99b2d8b", 1000),
      u("1534438327276-14e5300c3a48", 1000),
      u("1518611012118-696072aa579a", 1000),
      u("1517836357463-d25dfeac3438", 1000),
    ],
  },
  mover: {
    hero: u("1600518464441-9154a4dea21b"),
    about: u("1530124566582-a618bc2615dc", 1000),
    gallery: [
      u("1600518464441-9154a4dea21b", 1000),
      u("1530124566582-a618bc2615dc", 1000),
      u("1611189458701-23f15f86d0eb", 1000),
      u("1558997519-5cd1e5e83c20", 1000),
    ],
  },
  pet: {
    hero: u("1601758228041-f3b2795255f1"),
    about: u("1583337130417-3346a1be7dee", 1000),
    gallery: [
      u("1601758228041-f3b2795255f1", 1000),
      u("1583337130417-3346a1be7dee", 1000),
      u("1548199973-03cce0bbc87b", 1000),
      u("1587300003388-59208cc962cb", 1000),
    ],
  },
  general: {
    hero: u("1503387762-bf3d39b32de9"),
    about: u("1581094271901-8022df4466f9", 1000),
    gallery: [
      u("1503387762-bf3d39b32de9", 1000),
      u("1581094271901-8022df4466f9", 1000),
      u("1504307651254-35680f356dfd", 1000),
      u("1572025442646-866d16c84a54", 1000),
    ],
  },
  default: DEFAULT_PHOTOS,
};

// Common informal/alternate names → canonical key in TRADE_PLACEHOLDERS.
// Keeps `BUSINESS.tradeType: "plumber"` from falling into the generic
// placeholder bucket when the curated entry is named `plumbing`.
const TRADE_ALIASES: Record<string, string> = {
  painter: "painting",
  painters: "painting",
  electrician: "electrical",
  electricians: "electrical",
  plumber: "plumbing",
  plumbers: "plumbing",
  roofer: "roofing",
  roofers: "roofing",
  landscaper: "lawn-care",
  landscapers: "lawn-care",
  landscaping: "lawn-care",
  lawn: "lawn-care",
  "auto-detail": "auto-detailing",
  detailing: "auto-detailing",
  "junk-hauling": "junk-removal",
  tree: "tree-services",
  "tree-service": "tree-services",
  arborist: "tree-services",
  cleaner: "cleaning",
  cleaners: "cleaning",
  movers: "mover",
  moving: "mover",
  gym: "fitness",
  trainer: "fitness",
  "personal-trainer": "fitness",
  hair: "salon",
  nails: "salon",
  "nail-salon": "salon",
  spa: "beauty",
  esthetics: "beauty",
  lash: "beauty",
  pets: "pet",
  groomer: "pet",
  "pet-grooming": "pet",
  "general-contractor": "general",
  contractor: "general",
  remodeling: "general",
  construction: "general",
};

/**
 * Returns the list of trade keys with a curated photo set (excluding
 * `default`). Used by tooling (e.g. sync-business-info.mjs) to warn when
 * BUSINESS.tradeType doesn't match any known entry.
 */
export function getKnownTradeKeys(): string[] {
  return Object.keys(TRADE_PLACEHOLDERS)
    .filter((k) => k !== "default")
    .concat(Object.keys(TRADE_ALIASES))
    .sort();
}

/**
 * Return placeholder photos for a given trade type, falling back to a
 * generic "Add Photo" placeholder card if the trade isn't in our curated
 * list. Honors common alternate names (e.g. "plumber" → "plumbing").
 */
export function getPlaceholders(tradeType: string): TradePhotos {
  const key = tradeType.toLowerCase().trim();
  const canonical = TRADE_ALIASES[key] || key;
  return TRADE_PLACEHOLDERS[canonical] || DEFAULT_PHOTOS;
}
