/**
 * Single source of truth for all client-facing content.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CLIENT DETAILS REQUIRED
 * The brand name, contact channels and imagery below are placeholders.
 * Services are limited to those shown in the supplied reference material.
 * Replace / verify every field marked `CLIENT:` before launch.
 * Contact channels left empty are simply not rendered anywhere on the site.
 * Never add prices, reviews, awards or statistics that the client has not
 * supplied.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type SiteImage = {
  /** Unsplash photo id (the part after `photo-`) or a local `/path.jpg`. */
  src: string;
  alt: string;
  /** Focal point for object-position, e.g. "50% 30%". */
  focus?: string;
};

export type Service = {
  slug: string;
  name: string;
  /** Short line used on the orb label and mobile cards. */
  line: string;
  description: string;
  image: SiteImage;
  detail: SiteImage;
};

export type Channel = {
  kind: "whatsapp" | "phone" | "email" | "directions" | "instagram" | "tiktok";
  label: string;
  href: string;
  /** Human-readable value shown under the label, e.g. the handle or number. */
  value: string;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const brand = {
  // CLIENT: studio name, shown in nav, footer, metadata and structured data.
  name: "THE BOHO SALON",
  shortName: "Boho",
  descriptor: "Hair & Beauty",
  tagline: "Beauty, softly defined.",
  description:
    "A salon for manicure, pedicure, hair & makeup, lip blushing, permanent brows and facials — unhurried, considered care in a calm, intimate setting.",
  // CLIENT: production URL (used for canonical links and Open Graph).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  locale: "en",
};

/**
 * CLIENT: fill in whichever of these exist. Anything left as an empty string
 * is removed from the booking section, menu, footer and structured data.
 */
export const contact = {
  /** International format without "+" or spaces, e.g. "447700900123". */
  whatsapp: "",
  /** Display + dial format, e.g. "+44 7700 900123". */
  phone: "",
  email: "",
  /** Street address on one line. */
  address: "",
  /** Google Maps share link for "Get directions". */
  mapsUrl: "",
  instagram: "", // handle without @
  tiktok: "", // handle without @
  /** Opening hours as display rows, e.g. [["Tue – Sat", "10:00 – 19:00"]]. */
  hours: [] as [string, string][],
};

export function getChannels(): Channel[] {
  const c = contact;
  const list: Channel[] = [];
  if (c.whatsapp)
    list.push({
      kind: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(
        `Hello ${brand.name}, I'd like to book an appointment.`,
      )}`,
      value: "Message us",
    });
  if (c.phone)
    list.push({
      kind: "phone",
      label: "Call",
      href: `tel:${c.phone.replace(/[^\d+]/g, "")}`,
      value: c.phone,
    });
  if (c.email)
    list.push({ kind: "email", label: "Email", href: `mailto:${c.email}`, value: c.email });
  if (c.mapsUrl)
    list.push({
      kind: "directions",
      label: "Directions",
      href: c.mapsUrl,
      value: c.address || "Open in Maps",
    });
  if (c.instagram)
    list.push({
      kind: "instagram",
      label: "Instagram",
      href: `https://instagram.com/${c.instagram}`,
      value: `@${c.instagram}`,
    });
  if (c.tiktok)
    list.push({
      kind: "tiktok",
      label: "TikTok",
      href: `https://www.tiktok.com/@${c.tiktok}`,
      value: `@${c.tiktok}`,
    });
  return list;
}

/** The primary booking action: WhatsApp → phone → email → the visit section. */
export function getPrimaryBooking(): { href: string; external: boolean } {
  const [first] = getChannels().filter((ch) =>
    ["whatsapp", "phone", "email"].includes(ch.kind),
  );
  return first ? { href: first.href, external: first.kind === "whatsapp" } : { href: "#visit", external: false };
}

// ─── Imagery ──────────────────────────────────────────────────────────────
// CLIENT: replace with the studio's own photography when available.
// Current images: Unsplash (free licence), hot-linked from the Unsplash CDN.

export const heroImages = {
  portrait: {
    src: u("1699726242756-54a80b68405a"),
    alt: "Portrait of a woman in low, warm light with her hands resting at her collarbone",
    focus: "60% 35%",
  },
  orbs: [
    {
      src: u("1610992015762-45dca7fa3a85"),
      alt: "Close-up of hands with a soft nude manicure",
      focus: "50% 55%",
    },
    {
      src: u("1654374504608-67c4cfe65fca"),
      alt: "Close-up of naturally tinted lips",
      focus: "50% 60%",
    },
    {
      src: u("1643684391140-c5056cfd3436"),
      alt: "Glowing skin during a facial massage",
      focus: "45% 40%",
    },
  ] satisfies SiteImage[],
};

// CLIENT: verify this list — only services taken from the reference material.
export const services: Service[] = [
  {
    slug: "manicure",
    name: "Manicure",
    line: "Hands, finished",
    description:
      "Shaping, cuticle care and a considered finish — for hands that feel as refined as they look.",
    image: {
      src: u("1748163432725-454f46f68340"),
      alt: "Hands with a glossy red manicure",
      focus: "50% 40%",
    },
    detail: {
      src: u("1630843599725-32ead7671867"),
      alt: "Hand with a clean white manicure and a fine gold ring",
    },
  },
  {
    slug: "pedicure",
    name: "Pedicure",
    line: "Unhurried care",
    description:
      "Soaked, shaped and polished at an unhurried pace — care for the feet that feels like an escape.",
    image: {
      src: u("1664643411326-6c589531be3c"),
      alt: "Feet with freshly painted pink toenails against a dark background",
      focus: "45% 45%",
    },
    detail: {
      src: u("1707725238063-0c54fb6963d1"),
      alt: "Feet with red polished toenails",
    },
  },
  {
    slug: "hair-makeup",
    name: "Hair & Makeup",
    line: "Composed around you",
    description:
      "Styling and makeup composed around you — for the day itself, or the evening ahead.",
    image: {
      src: u("1709477542149-f4e0e21d590b"),
      alt: "Makeup brush applying bronze shadow along a lash line",
      focus: "50% 45%",
    },
    detail: {
      src: u("1629397685944-7073f5589754"),
      alt: "Stylist setting soft curls with a curling iron",
    },
  },
  {
    slug: "lip-blushing",
    name: "Lip Blushing",
    line: "A wash of colour",
    description:
      "A semi-permanent wash of colour that softly defines the natural shape and tone of the lips.",
    image: {
      src: u("1579752515149-489d8d711342"),
      alt: "Close-up of full lips in a deep red tone",
      focus: "50% 55%",
    },
    detail: {
      src: u("1524141740201-e30e9f1ad2ac"),
      alt: "Woman with red lips resting her chin on her hands, eyes closed",
    },
  },
  {
    slug: "permanent-brows",
    name: "Permanent Brows",
    line: "Framed, naturally",
    description:
      "Semi-permanent brow work designed to frame the face with soft, natural-looking definition.",
    image: {
      src: u("1564278692313-b2d65996fc93"),
      alt: "Close-up of a brown eye beneath a full, defined brow",
      focus: "50% 40%",
    },
    detail: {
      src: u("1519415387722-a1c3bbef716c"),
      alt: "Brow shaping with fine thread during a treatment",
    },
  },
  {
    slug: "facial",
    name: "Facial",
    line: "Skin, restored",
    description:
      "A facial ritual to cleanse, treat and refresh the skin — taken slowly, in a calm room.",
    image: {
      src: u("1761718210089-ba3bb5ccb54f"),
      alt: "A cream mask being applied during a facial treatment",
      focus: "50% 45%",
    },
    detail: {
      src: u("1761718209835-c8586b7dcac0"),
      alt: "Brush applying a treatment mask to the skin",
    },
  },
];

export const ritual: { word: string; line: string; image: SiteImage }[] = [
  {
    word: "Arrive",
    line: "Leave the day at the door.",
    image: {
      src: u("1787651344170-c2f81514934d"),
      alt: "A quiet treatment room with a leather chair and a white foot basin",
      focus: "40% 60%",
    },
  },
  {
    word: "Unwind",
    line: "Time slows to your pace.",
    image: {
      src: u("1706795033728-9232ef548a16"),
      alt: "A client resting with eyes closed during a facial massage",
      focus: "50% 50%",
    },
  },
  {
    word: "Refine",
    line: "Every detail, by hand.",
    image: {
      src: u("1632345031435-8727f6897d53"),
      alt: "A nail technician carefully working on a client's manicure",
      focus: "55% 50%",
    },
  },
  {
    word: "Reveal",
    line: "Step out as yourself — only more so.",
    image: {
      src: u("1673945049132-17ff2d9f60c8"),
      alt: "A woman with luminous skin touching her face, eyes closed",
      focus: "50% 35%",
    },
  },
];

export const story = {
  image: {
    src: u("1527203561188-dae1bc1a417f"),
    alt: "Profile of a woman with a sleek braided ponytail against a warm amber backdrop",
    focus: "45% 40%",
  } satisfies SiteImage,
  detail: {
    src: u("1675773051474-55c4b7d2cf53"),
    alt: "Soft-focus close-up of glowing skin and lips",
    focus: "50% 50%",
  } satisfies SiteImage,
};

export const gallery: (SiteImage & { title: string; ratio: "portrait" | "tall" | "square" | "wide" })[] = [
  {
    src: u("1637851362556-46d07c374023"),
    alt: "Portrait with glowing skin and a red manicure framing the face",
    title: "Luminous",
    ratio: "tall",
    focus: "50% 30%",
  },
  {
    src: u("1632765866070-3fadf25d3d5b"),
    alt: "Woman with glossy lips and hands raised to her face",
    title: "Gloss",
    ratio: "portrait",
    focus: "50% 35%",
  },
  {
    src: u("1515138692129-197a2c608cfd"),
    alt: "Profile lit by a single warm light against black",
    title: "Silhouette",
    ratio: "square",
    focus: "50% 40%",
  },
  {
    src: u("1663691219171-93494f63b5c9"),
    alt: "Sleek dark hair and softly defined makeup",
    title: "Polished",
    ratio: "portrait",
    focus: "50% 30%",
  },
  {
    src: u("1552793084-49132af00ff1"),
    alt: "Editorial portrait with sculpted skin against deep burgundy",
    title: "Sculpted",
    ratio: "wide",
    focus: "50% 40%",
  },
  {
    src: u("1619694770795-e21c58464159"),
    alt: "Portrait with braids and natural warm makeup",
    title: "Natural",
    ratio: "tall",
    focus: "50% 30%",
  },
  {
    src: u("1624819581070-7868475f038c"),
    alt: "Symmetrical beauty portrait with defined brows and a berry lip",
    title: "Defined",
    ratio: "portrait",
    focus: "50% 35%",
  },
  {
    src: u("1675726205553-4e348f24da2c"),
    alt: "Portrait in a dark shawl with softly lit skin",
    title: "Hush",
    ratio: "square",
    focus: "50% 35%",
  },
  {
    src: u("1782476042229-53f0312ecd1c"),
    alt: "Black and white portrait with eyes closed and hand at the chin",
    title: "Stillness",
    ratio: "portrait",
    focus: "50% 40%",
  },
];

export const booking = {
  image: {
    src: u("1600144559281-53d1dee79a99"),
    alt: "Soft-focus portrait in golden light with a hand passing across the face",
    focus: "50% 50%",
  } satisfies SiteImage,
};

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Ritual", href: "#ritual" },
  { label: "Story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "Visit", href: "#visit" },
];
