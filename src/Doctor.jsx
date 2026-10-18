// A more defined pixel portrait: warm brown skin, hair, face, coat, lapels and stethoscope.
const PALETTE = { k: "#251d35", h: "#34202b", h2: "#57342d", s: "#b97850", s2: "#d09165", e: "#241b2f", p: "#d98676", w: "#fff9ee", sh: "#d7d0c4", t: "#4c9a91", r: "#d95151", b: "#516f9e", f: "#32253b" };
const SPRITE = [
  "....kkkkkk....", "...khhhhhhk...", "..khhhhhhhhk..", "..khhkhhkhhk..",
  "..khhhhhhhhk..", "...kssssssk...", "...ksessesk...", "...kspsssp k...".replaceAll(" ", ""),
  "....kssssk....", "...kwwwwwwk...", "..kwwwwwwwwk..", ".kwwwwwwwwwwk.",
  ".kwwkwwwwkwwk.", ".kwwkwt twkwwk.".replaceAll(" ", ""), ".kwwwktwkwwwk.",
  ".kwwwkwkwwwwk.", "..kwwwwrwwwk..", "..kwwbbbbwwk..", "..kwwbbbbwwk..",
  "...kbbkkbbk...", "...kff..ffk...", "...kkkkkkkk...",
];

export default function Doctor() {
  return <svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pixel art doctor wearing a white lab coat">
    {SPRITE.flatMap((row, y) => [...row].map((c, x) => PALETTE[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[c]} /> : null))}
  </svg>;
}
