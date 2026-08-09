/**
 * A finished-plane render produced by the fold engine's SVG projection.
 *
 * The markup is generated at build time by `renderStateToSvg` from the same
 * fold data the 3D stage uses - it is an engine render, not an asset (SPEC:
 * "no AI image generation assets"). It carries no information the surrounding
 * text does not, so it is hidden from assistive technology.
 */
export function EngineSvg({ svg, className = "" }: { svg: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`[&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
