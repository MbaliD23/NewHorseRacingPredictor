import { useId } from "react";

type SilksRendererProps = {
  description: string | null | undefined;
  className?: string;
};

type SilksDesign = {
  body: string;
  sleeves: string;
  cap: string;
  collar: string;
  cuffs: string;
  epaulettes: string | null;
  hoop: string | null;
  sash: string | null;
  stripe: string | null;
  cross: string | null;
  armbands: string | null;
  stars: string | null;
  spots: string | null;
  diamonds: string | null;
  checks: string | null;
  quarters: [string, string] | null;
  halvedHorizontal: [string, string] | null;
  halvedVertical: [string, string] | null;
};

type ColorEntry = {
  label: string;
  hex: string;
};

const COLOR_ENTRIES: ColorEntry[] = [
  { label: "dark blue", hex: "#1e3a8a" },
  { label: "light blue", hex: "#7dd3fc" },
  { label: "royal blue", hex: "#2563eb" },
  { label: "baby pink", hex: "#f9a8d4" },
  { label: "shocking pink", hex: "#ec4899" },
  { label: "dayglo pink", hex: "#ff4fd8" },
  { label: "dayglo yellow", hex: "#facc15" },
  { label: "spectrum green", hex: "#16a34a" },
  { label: "aquamarine", hex: "#7fffd4" },
  { label: "cyclamen", hex: "#d946ef" },
  { label: "purple", hex: "#7c3aed" },
  { label: "gold", hex: "#d4af37" },
  { label: "yellow", hex: "#facc15" },
  { label: "orange", hex: "#f97316" },
  { label: "green", hex: "#16a34a" },
  { label: "grey", hex: "#9ca3af" },
  { label: "gray", hex: "#9ca3af" },
  { label: "black", hex: "#111827" },
  { label: "white", hex: "#f8fafc" },
  { label: "red", hex: "#dc2626" },
  { label: "blue", hex: "#2563eb" },
  { label: "pink", hex: "#ec4899" },
  { label: "brown", hex: "#8b5e3c" },
  { label: "silver", hex: "#cbd5e1" },
];

const DEFAULT_BODY = "#d1d5db";
const DEFAULT_STROKE = "#6b7280";

function normalizeDescription(description: string | null | undefined) {
  return (description ?? "")
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findColors(text: string) {
  return COLOR_ENTRIES.filter((entry) => text.includes(entry.label));
}

function firstColor(text: string, fallback: string) {
  return findColors(text)[0]?.hex ?? fallback;
}

function parseSilksDescription(description: string | null | undefined): SilksDesign {
  const normalized = normalizeDescription(description);
  const phrases = normalized
    .split(",")
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  const baseColor = firstColor(normalized, DEFAULT_BODY);
  const design: SilksDesign = {
    body: baseColor,
    sleeves: baseColor,
    cap: baseColor,
    collar: "#e5e7eb",
    cuffs: baseColor,
    epaulettes: null,
    hoop: null,
    sash: null,
    stripe: null,
    cross: null,
    armbands: null,
    stars: null,
    spots: null,
    diamonds: null,
    checks: null,
    quarters: null,
    halvedHorizontal: null,
    halvedVertical: null,
  };

  for (const phrase of phrases) {
    const colors = findColors(phrase);
    const primary = colors[0]?.hex;
    const secondary = colors[1]?.hex;

    if (!primary) {
      continue;
    }

    if (
      !/(sleeves|cap|collar|cuffs|epaulettes|hoop|hoops|band|sash|stripe|cross|armbands|stars|spots|diamonds|checks|quartered|quarters|halved)/.test(
        phrase,
      )
    ) {
      design.body = primary;
      if (!design.epaulettes) design.epaulettes = primary;
      if (design.sleeves === baseColor) design.sleeves = primary;
      if (design.cap === baseColor) design.cap = primary;
      continue;
    }

    if (phrase.includes("halved horizontally")) {
      design.halvedHorizontal = [primary, secondary ?? design.body];
      continue;
    }

    if (phrase.includes("halved vertically")) {
      design.halvedVertical = [primary, secondary ?? design.body];
      continue;
    }

    if (phrase.includes("quartered") || phrase.includes("quarters") || phrase.includes("qtd")) {
      design.quarters = [primary, secondary ?? design.body];
    }

    if (phrase.includes("body") || phrase.includes("jacket")) {
      design.body = primary;
    }

    if (phrase.includes("sleeves")) {
      design.sleeves = primary;
    }

    if (phrase.includes("cap")) {
      design.cap = primary;
    }

    if (phrase.includes("collar")) {
      design.collar = primary;
    }

    if (phrase.includes("cuff")) {
      design.cuffs = primary;
    }

    if (phrase.includes("epaulettes")) {
      design.epaulettes = primary;
    }

    if (phrase.includes("armbands")) {
      design.armbands = phrase.includes("hoop and armbands") && secondary ? secondary : primary;
    }

    if (phrase.includes("hoop") || phrase.includes("hoops") || phrase.includes("band") || phrase.includes("braces")) {
      design.hoop = primary;
    }

    if (phrase.includes("sash")) {
      design.sash = primary;
    }

    if (phrase.includes("stripe") || phrase.includes("striped") || phrase.includes("seams") || phrase.includes("chevrons")) {
      design.stripe = primary;
    }

    if (phrase.includes("cross")) {
      design.cross = primary;
    }

    if (phrase.includes("stars") || phrase.includes("star")) {
      design.stars = primary;
    }

    if (phrase.includes("spots") || phrase.includes("spot")) {
      design.spots = primary;
    }

    if (phrase.includes("diamonds") || phrase.includes("diamond")) {
      design.diamonds = primary;
    }

    if (phrase.includes("checks") || phrase.includes("checked")) {
      design.checks = primary;
    }
  }

  if (!design.epaulettes && design.sleeves !== design.body) {
    design.epaulettes = design.sleeves;
  }

  if (design.cuffs === baseColor) {
    design.cuffs = design.sleeves;
  }

  return design;
}

function PatternOverlays({
  design,
  ids,
}: {
  design: SilksDesign;
  ids: {
    torsoClip: string;
    leftSleeveClip: string;
    rightSleeveClip: string;
    shirtClip: string;
  };
}) {
  return (
    <>
      {design.halvedHorizontal ? (
        <g clipPath={`url(#${ids.torsoClip})`}>
          <rect x="28" y="36" width="40" height="44" fill={design.halvedHorizontal[0]} />
          <rect x="28" y="80" width="40" height="64" fill={design.halvedHorizontal[1]} />
        </g>
      ) : null}

      {design.halvedVertical ? (
        <g clipPath={`url(#${ids.torsoClip})`}>
          <rect x="28" y="36" width="20" height="108" fill={design.halvedVertical[0]} />
          <rect x="48" y="36" width="20" height="108" fill={design.halvedVertical[1]} />
        </g>
      ) : null}

      {design.quarters ? (
        <g clipPath={`url(#${ids.torsoClip})`}>
          <rect x="28" y="36" width="20" height="54" fill={design.quarters[0]} />
          <rect x="48" y="36" width="20" height="54" fill={design.quarters[1]} />
          <rect x="28" y="90" width="20" height="54" fill={design.quarters[1]} />
          <rect x="48" y="90" width="20" height="54" fill={design.quarters[0]} />
        </g>
      ) : null}

      {design.hoop ? (
        <rect x="28" y="72" width="40" height="18" fill={design.hoop} clipPath={`url(#${ids.torsoClip})`} />
      ) : null}

      {design.sash ? (
        <path
          d="M30 48 L42 42 L70 128 L58 134 Z"
          fill={design.sash}
          clipPath={`url(#${ids.torsoClip})`}
        />
      ) : null}

      {design.stripe ? (
        <rect x="44" y="36" width="8" height="108" fill={design.stripe} clipPath={`url(#${ids.torsoClip})`} />
      ) : null}

      {design.cross ? (
        <g clipPath={`url(#${ids.torsoClip})`}>
          <rect x="44" y="36" width="8" height="108" fill={design.cross} />
          <rect x="28" y="72" width="40" height="14" fill={design.cross} />
        </g>
      ) : null}

      {design.armbands ? (
        <>
          <rect x="17" y="76" width="12" height="7" fill={design.armbands} clipPath={`url(#${ids.leftSleeveClip})`} />
          <rect x="67" y="76" width="12" height="7" fill={design.armbands} clipPath={`url(#${ids.rightSleeveClip})`} />
        </>
      ) : null}

      {design.stars ? (
        <g fill={design.stars} clipPath={`url(#${ids.shirtClip})`}>
          <path d="M39 58 l2.5 5.5 6 0.5 -4.5 4 1.2 5.8 -5.2-3 -5.2 3 1.2-5.8 -4.5-4 6-0.5z" />
          <path d="M58 84 l2 4.5 5 0.4 -3.8 3.3 1 4.7 -4.2-2.4 -4.2 2.4 1-4.7 -3.8-3.3 5-0.4z" />
          <path d="M45 101 l2 4.5 5 0.4 -3.8 3.3 1 4.7 -4.2-2.4 -4.2 2.4 1-4.7 -3.8-3.3 5-0.4z" />
        </g>
      ) : null}

      {design.spots ? (
        <g fill={design.spots} clipPath={`url(#${ids.shirtClip})`}>
          <circle cx="40" cy="62" r="4" />
          <circle cx="56" cy="78" r="4" />
          <circle cx="46" cy="100" r="4" />
        </g>
      ) : null}

      {design.diamonds ? (
        <g fill={design.diamonds} clipPath={`url(#${ids.shirtClip})`}>
          <path d="M48 54 L54 60 L48 66 L42 60 Z" />
          <path d="M38 76 L44 82 L38 88 L32 82 Z" />
          <path d="M58 76 L64 82 L58 88 L52 82 Z" />
        </g>
      ) : null}

      {design.checks ? (
        <g clipPath={`url(#${ids.shirtClip})`}>
          <rect x="32" y="52" width="10" height="10" fill={design.checks} />
          <rect x="52" y="52" width="10" height="10" fill={design.checks} />
          <rect x="42" y="62" width="10" height="10" fill={design.checks} />
          <rect x="32" y="72" width="10" height="10" fill={design.checks} />
          <rect x="52" y="72" width="10" height="10" fill={design.checks} />
        </g>
      ) : null}
    </>
  );
}

export function SilksRenderer({ description, className }: SilksRendererProps) {
  const design = parseSilksDescription(description);
  const id = useId().replace(/:/g, "");
  const ids = {
    torsoClip: `${id}-torso`,
    leftSleeveClip: `${id}-left-sleeve`,
    rightSleeveClip: `${id}-right-sleeve`,
    shirtClip: `${id}-shirt`,
  };

  return (
    <svg
      viewBox="0 0 96 176"
      className={className ?? "h-28 w-28"}
      role="img"
      aria-label={description ?? "Jockey colours jersey"}
    >
      <defs>
        <clipPath id={ids.torsoClip}>
          <path d="M28 40 Q36 28 48 28 Q60 28 68 40 L66 136 Q65 146 56 150 L40 150 Q31 146 30 136 Z" />
        </clipPath>
        <clipPath id={ids.leftSleeveClip}>
          <path d="M28 40 L10 54 L16 94 L30 88 Z" />
        </clipPath>
        <clipPath id={ids.rightSleeveClip}>
          <path d="M68 40 L86 54 L80 94 L66 88 Z" />
        </clipPath>
        <clipPath id={ids.shirtClip}>
          <path d="M28 40 Q36 28 48 28 Q60 28 68 40 L86 54 L80 94 L66 88 L66 136 Q65 146 56 150 L40 150 Q31 146 30 136 L30 88 L16 94 L10 54 Z" />
        </clipPath>
        <radialGradient id="shirtGlow" cx="50%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      <circle cx="48" cy="19" r="12" fill={design.cap} stroke={DEFAULT_STROKE} strokeWidth="1.5" />
      {design.stars ? (
        <path
          d="M48 11 l2.2 4.8 5.1 0.4 -3.8 3.5 1 5 -4.5-2.6 -4.5 2.6 1-5 -3.8-3.5 5.1-0.4z"
          fill={design.stars}
        />
      ) : null}

      <path d="M28 40 L10 54 L16 94 L30 88 Z" fill={design.sleeves} stroke={DEFAULT_STROKE} strokeWidth="1.5" />
      <path d="M68 40 L86 54 L80 94 L66 88 Z" fill={design.sleeves} stroke={DEFAULT_STROKE} strokeWidth="1.5" />

      <path
        d="M28 40 Q36 28 48 28 Q60 28 68 40 L66 136 Q65 146 56 150 L40 150 Q31 146 30 136 Z"
        fill={design.body}
        stroke={DEFAULT_STROKE}
        strokeWidth="1.5"
      />

      <PatternOverlays design={design} ids={ids} />

      {design.epaulettes ? (
        <>
          <path d="M30 40 Q36 32 42 34 L38 44 L30 48 Z" fill={design.epaulettes} clipPath={`url(#${ids.torsoClip})`} />
          <path d="M66 40 Q60 32 54 34 L58 44 L66 48 Z" fill={design.epaulettes} clipPath={`url(#${ids.torsoClip})`} />
        </>
      ) : null}

      <path d="M41 32 Q48 36 55 32 L52 42 Q48 45 44 42 Z" fill={design.collar} stroke={DEFAULT_STROKE} strokeWidth="1" />
      <rect x="18" y="86" width="11" height="7" rx="2" fill={design.cuffs} />
      <rect x="67" y="86" width="11" height="7" rx="2" fill={design.cuffs} />

      <path
        d="M28 40 Q36 28 48 28 Q60 28 68 40 L86 54 L80 94 L66 88 L66 136 Q65 146 56 150 L40 150 Q31 146 30 136 L30 88 L16 94 L10 54 Z"
        fill="url(#shirtGlow)"
        clipPath={`url(#${ids.shirtClip})`}
      />
    </svg>
  );
}
