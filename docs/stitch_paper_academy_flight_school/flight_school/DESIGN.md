---
name: Flight School
colors:
  surface: '#fdf9ef'
  surface-dim: '#dddad0'
  surface-bright: '#fdf9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e9'
  surface-container: '#f1eee4'
  surface-container-high: '#ece8de'
  surface-container-highest: '#e6e2d8'
  on-surface: '#1c1c16'
  on-surface-variant: '#44474e'
  inverse-surface: '#31312a'
  inverse-on-surface: '#f4f0e6'
  outline: '#75777e'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e80'
  primary: '#031634'
  on-primary: '#ffffff'
  primary-container: '#1a2b4a'
  on-primary-container: '#8293b7'
  inverse-primary: '#b6c6ee'
  secondary: '#b12a2a'
  on-secondary: '#ffffff'
  secondary-container: '#fe625b'
  on-secondary-container: '#650008'
  tertiary: '#001928'
  on-tertiary: '#ffffff'
  tertiary-container: '#002e47'
  on-tertiary-container: '#6e97b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6ee'
  on-primary-fixed: '#081b39'
  on-primary-fixed-variant: '#364767'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#8f0e16'
  tertiary-fixed: '#cae6ff'
  tertiary-fixed-dim: '#a2cbee'
  on-tertiary-fixed: '#001e30'
  on-tertiary-fixed-variant: '#1e4b67'
  background: '#fdf9ef'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d8'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  card-padding: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 40px
---

## Brand & Style

This design system draws inspiration from mid-century aviation manuals and international airmail correspondence. The aesthetic is a blend of **Modern Editorial** and **Vintage Technical**, prioritizing clarity and discipline while maintaining the tactile charm of physical paper and ink.

The brand personality is authoritative yet encouraging—the "Flight Instructor" who values precision and order. The interface should feel like a curated field guide or a well-organized cadet kit.

**Core Stylistic Pillars:**
- **Materiality:** Use subtle paper grain textures and ink-bleed effects on typography to evoke a printed-matter feel.
- **Graphic Accents:** Incorporate airmail chevron patterns (blue and red alternating diagonals) as structural dividers or decorative headers.
- **Flight Paths:** Use thin, dotted lines with arrowhead terminals to guide the user's eye through instructional steps, mimicking tactical flight maps.
- **Authentication:** Use "stamped" motifs—low-opacity, slightly rotated icons or badges—to indicate completion or verification.

## Colors

The palette is rooted in the "Background Cream" (#F7F3E9), which serves as the base for all surfaces to reduce eye strain and provide a vintage paper feel. 

- **Navy Ink (#1A2B4A):** Used for primary text, structural borders, and high-emphasis surfaces.
- **Airmail Red (#D64541):** A directional and alert color. Use for critical call-to-actions, warnings, or the "Red" segments of chevron borders.
- **Sky Blue (#7FA8C9):** Used for secondary accents, "Blue" segments of chevrons, and interactive states.
- **Stamped Green (#4A7C59):** Reserved for "Success" states, completion marks, and official academy seals.

## Typography

Typography follows a strict hierarchy of "Command" and "Information."

- **Headlines:** Use Archivo Narrow (substituted for Archivo Black for efficient verticality) in All-Caps. Tracking should be tightened to create a blocky, placard-like appearance.
- **Body:** Instrument Sans provides a modern, legible contrast to the rigid headlines, ensuring instructions are easy to read for all ages.
- **Data/Technical:** IBM Plex Mono is used for fold measurements, flight statistics, and technical specs.

*Note: For mobile displays, reduce `display-lg` to 32px and `display-md` to 24px.*

## Layout & Spacing

This design system uses a **Fixed Grid** philosophy on desktop (12 columns, 1200px max-width) and a **Fluid Grid** on mobile (4 columns). 

- **The 4px Baseline:** All spacing is derived from a 4px grid.
- **Visual Dividers:** Instead of simple lines, use "Perforated Edges" (alternating small squares/voids) to separate major vertical sections.
- **Structural Margins:** Containers should feel like "Placards" pinned to the paper background, often utilizing generous internal padding to maintain a clean, editorial look.

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than realistic shadows. 

- **Placard Effect:** Content blocks use a slightly lighter or starker version of the background cream, defined by a 1px Navy Ink border.
- **Zero Shadows:** Do not use soft ambient shadows. Instead, use a "Hard Shadow" (2px offset, 0 blur, Navy Ink at 20% opacity) for cards to give them a physical, layered feel.
- **Z-Index:** Interactive elements (buttons, inputs) should appear to sit "on" the page, while decorative stamps appear "inked" into the page (using `multiply` blend modes).

## Shapes

The shape language is primarily **Geometric and Disciplined**.

- **Cards:** Use an 8px corner radius for major content containers (Placards).
- **Inputs:** Use a 4px corner radius for form fields to maintain a technical feel.
- **Buttons:** Strictly rectangular or 4px radius. **Never use pill-shaped buttons**, as they conflict with the mid-century technical aesthetic.
- **Perforations:** Circles or squares used as cut-out motifs along the edges of cards.

## Components

- **Buttons:** Solid Navy Ink background with Cream text for primary actions. Bordered (Navy Ink 1px) for secondary. No gradients.
- **Inputs:** 1px Navy Ink border. On focus, the border thickens to 2px and a subtle Sky Blue wash fills the background.
- **Chips/Badges:** Designed to look like "Stickers" or "Dymo Labels." High contrast, using IBM Plex Mono.
- **Cards:** 1px Navy Ink border with a "Header Bar" that features the Airmail Chevron pattern.
- **Progress Indicators:** Dotted lines that "fill" into solid lines as the user completes tutorial steps.
- **Checkboxes:** Square, sharp corners. A "Stamped Green" checkmark appears when selected, mimicking a manual ink stamp.
- **Instruction Lists:** Use numbers set in Data Mono within a small Navy Ink circle.