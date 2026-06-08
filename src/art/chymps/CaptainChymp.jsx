// Captain Chymp — illustrated raster art (brass diving helmet, classic explorer).
// Replaces the prior hand-coded SVG monkey. The transparent WebP lives in
// /public/art/chymps/ and is resolved through Vite's base path so it works under
// the GitHub Pages subpath (base: '/SEACHYMP-Bug-Blasters/').
const SRC = `${import.meta.env.BASE_URL}art/chymps/captain.webp`;

export default function CaptainChymp({ size = 64 }) {
  return (
    <img
      src={SRC}
      alt="Captain Chymp"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "inline-block" }}
      draggable={false}
    />
  );
}
