# Brief: Hallway Flight

- Status: approved
- Date: 2026-08-22
- Repo / area: Flight School flight experience

## Outcome and why

- What we are building: A cadet throws the paper plane they just folded, steers it through a school hallway that moves from the 1950s to the 1980s to today, startles bystanders, catches air gusts, and reaches the final bell.
- Why, and who it is for: Flight School should answer the natural question that follows a finished fold for its child-friendly general audience, while keeping the plane the cadet made as the center of the experience.

## Quality bar

- [ ] Throwaway prototype
- [ ] Internal tool
- [x] Production-critical
- Implications: The feature requires deterministic tests, accessible keyboard and touch paths, optional tilt with safe fallback, localized UI, static-export compatibility, bounded performance, and explicit WebGL failure behavior.

## Definition of done

- [ ] An earned plane can launch from Wings earned and re-enter flight from the Hangar, while an unearned direct route remains locked.
- [ ] The airborne model uses the selected plane's finished procedural fold geometry.
- [ ] Guided pointer, touch, and keyboard launches hand off to continuous keyboard, pointer, touch, or optional tilt steering.
- [ ] One authored course transitions continuously through 1950s, 1980s, and present-day school sections and ends at the bell within a 90-second run limit.
- [ ] Bystanders react to safe close passes, collisions end harmlessly, air gusts affect speed and lift, and personal bests persist per plane.
- [ ] All existing tests remain green, new flight tests pass, the static export succeeds, and the feature works across all locales and RTL.
- [ ] Three comparable visual concept boards are generated and presented for a human selection before production art fan-out.

## Scope

- In scope: One replayable hallway course, all six finished aircraft, generated concept art, code-native greybox assets, procedural audio, route integration, persistence, accessibility, localization, diagnostics, and automated verification.
- Out of scope: Multiplayer, accounts, backend services, medals, unlock currency, camera input, production character asset fan-out before concept approval, and changes to fold semantics.

## Constraints and standard

- Stack and conventions: Next.js static export, React, strict TypeScript, Three.js, Vitest, Playwright, content-as-code, localStorage, existing Flight School design tokens, and lazy WebGL loading.
- Non-negotiables: Child-safe presentation, no realistic injury, no generated instructional text, no flight imports in the fold engine, no new backend, no broken existing routes, and no loss of stored progress.
- Deadline or time budget: None stated.
- Standard: Build per the repository instructions, the `senior-dev` skill, the `game-dev` skill, and this brief.

## Design sketch

- Approach A: Embed or skin Sun Loop's existing application and replace its plane, world, and DOM UI in place.
- Approach B: Port the deterministic controller and proven runtime ideas into a walled Flight School module with a React-facing handle and the real finished fold model.
- Chosen approach: Approach B, because it preserves one product architecture, one localization system, one persistence store, one paper geometry source, and one static deployment while keeping flight deletable from V1.

## Open questions and risks

- Human feel approval remains required after the greybox toy because automated tests cannot judge whether the controller is fun.
- Production art remains gated on the user's selection among three concept boards.
- The current branch contains ongoing hyperreal-paper changes, so flight work must preserve and accommodate them rather than reverting shared renderer or UI files.
