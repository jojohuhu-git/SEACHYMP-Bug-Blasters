/**
 * ArtToken.jsx — Graceful fallback bridge between SVG art and placeholder shapes.
 *
 * Usage:
 *   <ArtToken token="captain" size={48} fallback={<div className="squad-shape" ...>CA</div>} />
 *
 * If ART_COMPONENTS[token] exists, renders the SVG component with the given size.
 * Otherwise renders the fallback unchanged. This means every screen degrades
 * gracefully for any token without art, and is safe to use for Pass 2 creatures
 * before their SVGs are authored.
 */

import ART_COMPONENTS from "./ART_COMPONENTS.js";

/**
 * @param {string}       token    - art token key (from data files)
 * @param {number}       [size]   - bounding box px (passed to the SVG component)
 * @param {React.ReactNode} fallback - rendered when token has no SVG art yet
 * @param {object}       [props]  - any extra props forwarded to the SVG component
 */
export default function ArtToken({ token, size, fallback = null, ...props }) {
  const Component = ART_COMPONENTS[token];
  if (!Component) return fallback;
  return <Component size={size} {...props} />;
}
