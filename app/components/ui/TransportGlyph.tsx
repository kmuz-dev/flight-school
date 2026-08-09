/** Transport glyphs, drawn rather than fetched so the export stays self-contained. */
export type Glyph = "prev" | "next" | "play" | "pause" | "replay";

export function TransportGlyph({ glyph }: { glyph: Glyph }) {
  const common = { fill: "currentColor", stroke: "none" } as const;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {glyph === "prev" && <polygon points="11,2 11,14 3,8" {...common} />}
      {glyph === "next" && <polygon points="5,2 5,14 13,8" {...common} />}
      {glyph === "play" && <polygon points="4,2 4,14 14,8" {...common} />}
      {glyph === "pause" && (
        <g {...common}>
          <rect x="4" y="2" width="3" height="12" />
          <rect x="9" y="2" width="3" height="12" />
        </g>
      )}
      {glyph === "replay" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M13 8a5 5 0 1 1-1.6-3.7" />
          <polyline points="13,1.5 13,5 9.5,5" />
        </g>
      )}
    </svg>
  );
}
