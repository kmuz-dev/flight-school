# Shared photographic paper material

The procedural fold engine uses one warm-white craft-paper surface across Tutorial, Preflight inspection, and Hangar inspection.
The canonical fold geometry remains authoritative; these maps supply only surface response.

## Production maps

| File | Dimensions | Color space | Bytes |
|---|---:|---|---:|
| `paper-craft-albedo.webp` | 1024 x 1024 | sRGB | 80,640 |
| `paper-craft-normal.webp` | 512 x 512 | Linear | 176,736 |
| `paper-craft-roughness.webp` | 512 x 512 | Linear | 530 |

The production set totals 257,906 bytes and is imported only from the lazy renderer chunk.

## Provenance

The albedo source was generated on 2026-08-16 from the approved Bulldog, Hammer, and Square Cruiser beauty artwork.
The generation request specified a seamless flatbed-style scan of warm-white uncoated folding paper with fine cellulose fibres, directional grain, faint tonal mottling, restrained micro-wrinkles, neutral illumination, and no aircraft, folds, edges, stains, fingerprints, typography, or baked shadows.
The normal and roughness maps were then derived deterministically from that approved source and compressed for production.

The retained source package is outside the repository at:

```text
/Users/kuda/.codex/generated_images/01a00110-bcb5-79b1-97e5-6a3e458e9667/
```

## Runtime contract

- Use mirrored repeat wrapping at four repeats in each direction.
- Treat only the albedo as sRGB.
- Cap anisotropy at eight.
- Use 0.88 base roughness and 0.18 normal scale.
- Preserve real sheet thickness, chamfered edges, reverse-side tint, and wrap-light translucency.
- Fall back to the deterministic procedural fibre map if any production map fails to load.
