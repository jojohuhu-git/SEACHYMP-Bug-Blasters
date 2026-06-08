/**
 * TitleMascot.jsx — Hero Chymp for the Title screen.
 * Uses the illustrated Captain Chymp art (transparent WebP from /public),
 * resolved through Vite's base path so it works under the Pages subpath.
 */

const SRC = `${import.meta.env.BASE_URL}art/chymps/captain.webp`;

export default function TitleMascot({ size = 96 }) {
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
