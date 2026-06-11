/**
 * OrganismImage.jsx — illustrated creature portrait for HTML surfaces.
 *
 * Renders the transparent WebP at /public/art/organisms/<artToken>.webp (the same
 * sprites the canvas uses), resolved through Vite's base path so it works under
 * the GitHub Pages subpath. If the organism has no artToken or the image fails to
 * load, it falls back to the original monogram square so nothing renders blank.
 *
 * Drop it in wherever an organism icon was previously a monogram (InfoCard,
 * Encyclopedia, the Level 2/3 capture cards).
 */

import { useState } from "react";
import { monogramOf } from "../data/organisms.js";

export default function OrganismImage({ org, size = 56, className }) {
  const [errored, setErrored] = useState(false);
  const color = (org && org.color) || "#38b2e8";
  const src = org && org.artToken
    ? `${import.meta.env.BASE_URL}art/organisms/${org.artToken}.webp`
    : null;

  if (!src || errored) {
    return (
      <span
        className={className}
        style={{ color, fontWeight: 700, fontSize: Math.round(size * 0.42), lineHeight: 1 }}
      >
        {monogramOf(org)}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={(org && org.name) || ""}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
