# Cinematic Schoolbook Production Contract

- Status: selected and approved
- Selected by user: 2026-08-22
- Source board: `app/assets/flight/concepts/option-2-cinematic-schoolbook.png`
- Aircraft reference: `app/assets/aircraft/dart-hero.webp`

## Visual invariants

The world uses premium cinematic storybook realism with dimensional hand-painted 3D illustration.
Materials read as warm wood, linoleum, painted metal, plaster, paper, and believable fabric rather than glossy toy plastic.
Faces are expressive and stylized without photorealistic or uncanny detail.
Lighting mixes soft natural daylight with practical school fixtures and restrained atmospheric depth.
All reactions are harmless, readable, and funny.
No generated image contains required writing, brands, logos, watermarks, threatening impact, or identifiable real people.

## Environment deliverables

- `environments/hallway-1950s.webp`: empty chase-camera corridor plate with trophy cases, cream plaster, walnut trim, burgundy tile, and globe lights.
- `environments/hallway-1980s.webp`: empty chase-camera corridor plate with teal and brick-red lockers, fluorescent lighting, AV-cart dressing, backpacks, and paper decorations.
- `environments/hallway-today.webp`: empty chase-camera corridor plate with pale oak, slate, muted blue, blank digital-sign housings, and a final-bell arch.
- `hangar/hangar-cinematic-schoolbook.webp`: empty cinematic school workshop and aircraft hangar with cream walls, walnut storage, drafting surfaces, folded-paper details, and an open runway-like center bay.
- `textures/materials-1950s.webp`: coordinated 3 by 3 seamless-material atlas.
- `textures/materials-1980s.webp`: coordinated 3 by 3 seamless-material atlas.
- `textures/materials-today.webp`: coordinated 3 by 3 seamless-material atlas.

## Modular prop deliverables

- `props/trophy-case.webp`
- `props/lockers-teal.webp`
- `props/lockers-red.webp`
- `props/av-cart.webp`
- `props/backpack.webp`
- `props/paper-decorations.webp`
- `props/digital-sign.webp`
- `props/classroom-door.webp`
- `props/bulletin-board.webp`
- `props/cleaning-cart.webp`

Each prop is an isolated three-quarter-view cutout with genuine transparency and no baked floor or shadow outside the object footprint.

## Character archetypes

### 1950s

- `50s-student-boy`: eleven-year-old boy with short brown hair, striped knit polo, cuffed denim, loafers, and a closed schoolbook.
- `50s-student-girl`: twelve-year-old girl with a dark bob and headband, cream cardigan, burgundy plaid skirt, socks, and loafers.
- `50s-teacher`: middle-aged woman teacher with glasses, pinned dark hair, charcoal skirt suit, cream blouse, sensible shoes, and a folder.

### 1980s

- `80s-student-boy`: teenage boy with curly dark hair, teal denim jacket, graphic-free T-shirt, relaxed jeans, and high-top shoes.
- `80s-student-girl`: teenage girl with voluminous curly hair and headband, rose sweatshirt, acid-wash jeans, leg warmers, and trainers.
- `80s-coach`: Black male school coach in his thirties with a red-and-cream varsity jacket, teal track trousers, trainers, and a basketball.

### Today

- `today-student-boy`: teenage boy with wavy black hair, slate hoodie, dark jeans, trainers, and a forest-green backpack.
- `today-student-girl`: Black teenage girl with two natural hair buns, navy overshirt, muted violet top, black jeans, trainers, and a backpack.
- `today-staff`: Black male staff member in his forties with close-cropped hair, muted-blue polo, khaki trousers, practical shoes, and a blank lanyard badge.

Every archetype receives three separate transparent assets named `idle`, `notice`, and `dodge`.
The character's face, body, hair, clothing, palette, and carried object stay consistent across all three assets.
`idle` is a relaxed readable silhouette.
`notice` turns the head and upper body toward the approaching plane with widening eyes.
`dodge` is a safe theatrical sidestep with raised hands and a surprised expression.

## Production and integration rules

Every distinct deliverable is generated in its own built-in ImageGen call.
Every output is inspected before it is accepted into the workspace.
The generated environment art provides distant depth and surface dressing, while code-native geometry remains collision truth.
Character cutouts use shared code-native collision capsules and deterministic reaction state changes.
The flying aircraft remains real fold geometry and is calibrated against the beauty artwork for silhouette, paper response, scale, and chase angle.
The selected art must degrade safely if an asset fails to load.

## Accepted production prompts

The accepted source masters are retained beside the compressed runtime WebP files.
All four plates were generated from the approved Cinematic Schoolbook concept board and inspected at full resolution before acceptance.

### 1950s corridor

Use case: stylized-concept
Asset type: production environment plate for a 3D WebGL game
Primary request: create the empty 1950s school corridor background from the selected Cinematic Schoolbook reference.
Scene/backdrop: long symmetrical school hallway, cream plaster walls, rich walnut wainscoting and classroom doors, glass trophy cases with generic cups and shields, polished burgundy-and-cream linoleum tile, warm round globe ceiling lights, subtle distant haze, continuous clear flight path down the center.
Style/medium: premium cinematic storybook realism, dimensional hand-painted 3D illustration, realistic materials with restrained painterly texture, sophisticated and warm.
Composition/framing: 16:9 wide chase-camera perspective, camera about 1.4 metres above the floor, centered vanishing point, corridor width and horizon compatible with a flying game, strong depth, empty foreground and middle flight lane, no close objects blocking the center.
Lighting/mood: warm practical lights mixed with soft daylight, inviting nostalgic school atmosphere, clear silhouettes.
Constraints: no people, no paper plane, no air gust, no UI, no readable writing, no logos or brands, blank notice-board paper only, architectural background only.
Avoid: outdoor sky, aircraft, text, numbers, watermarks, fisheye distortion, horror, dirt, abandoned school, glossy toy-plastic look.

### 1980s corridor

Use case: stylized-concept
Asset type: production environment plate for a 3D WebGL game
Primary request: create the empty 1980s school corridor background from the selected Cinematic Schoolbook reference.
Scene/backdrop: long symmetrical school hallway, alternating banks of deep teal and brick-red metal lockers, warm cream block walls, polished geometric linoleum in teal, terracotta, amber and cream, fluorescent ceiling fixtures, a distant rolling CRT AV cart, one backpack near the wall, restrained hanging paper decorations, continuous clear flight path down the center.
Style/medium: premium cinematic storybook realism, dimensional hand-painted 3D illustration, believable painted metal and linoleum with restrained painterly texture, sophisticated and nostalgic.
Composition/framing: 16:9 wide chase-camera perspective, camera about 1.4 metres above the floor, centered vanishing point, same corridor width and horizon as the 1950s plate, strong depth, empty foreground and middle flight lane.
Lighting/mood: soft practical fluorescent light with gentle warm fill, lively but not neon, inviting school atmosphere.
Constraints: no people, no paper plane, no air gust, no UI, no readable writing, no logos or brands, blank posters only, architectural background and distant dressing only.
Avoid: outdoor sky, aircraft, text, numbers, watermarks, cyberpunk neon, horror, dirt, abandoned school, glossy toy-plastic look.

### Present-day corridor

Use case: stylized-concept
Asset type: production environment plate for a 3D WebGL game
Primary request: create the empty present-day school corridor background from the selected Cinematic Schoolbook reference.
Scene/backdrop: long symmetrical contemporary school hallway, warm off-white wall panels, pale oak classroom doors and trim, muted navy and sage locker banks, polished terrazzo floor with subtle cream, charcoal and terracotta flecks, restrained digital display panels showing only abstract colored shapes, acoustic ceiling baffles, glass classroom sidelights, a distant recycling station and backpack against the wall, continuous clear flight path down the center.
Style/medium: premium cinematic storybook realism, dimensional hand-painted 3D illustration, believable contemporary materials with restrained painterly texture, sophisticated, warm and humane.
Composition/framing: 16:9 wide chase-camera perspective, camera about 1.4 metres above the floor, centered vanishing point, same corridor width and horizon as the 1950s and 1980s plates, strong depth, empty foreground and middle flight lane.
Lighting/mood: soft natural daylight mixed with warm efficient ceiling lighting, lively contemporary school atmosphere, gentle cinematic depth.
Constraints: no people, no paper plane, no air gust, no UI, no readable writing, no logos or brands, screens and posters contain abstract non-language graphics only, architectural background and distant dressing only.
Avoid: outdoor sky, aircraft, text, numbers, watermarks, sterile hospital look, corporate office, cyberpunk neon, horror, dirt, abandoned school, glossy toy-plastic look.

### Hangar

Use case: stylized-concept
Asset type: production background plate for the Flight School Hangar selection screen
Primary request: transform the empty aircraft display bay composition into the selected Cinematic Schoolbook world, keeping it spacious enough for a large 3D paper airplane to be overlaid in the center-right.
Scene/backdrop: a grand school aeronautics workshop and paper-aircraft hangar inside a converted 1950s gymnasium, cream plaster walls, walnut roof trusses, tall multipane windows, polished burgundy-and-cream school floor, low wooden workbenches along the far sides, neat shelves holding folded paper prototypes, corkboards with blank cream sheets and abstract diagrams, brass task lamps, subtle navy and red accents, a wide central display floor and an open arched doorway at the far end leading into a softly lit school corridor.
Style/medium: premium cinematic storybook realism, dimensional hand-painted 3D illustration, realistic warm natural materials with restrained painterly texture, the exact visual language of the selected Cinematic Schoolbook concept.
Composition/framing: wide 16:10 room plate modeled after the supplied empty hangar composition, low eye level, strong centered architectural depth, abundant negative space across the center and center-right for a large flying paper-aircraft overlay, keep foreground floor clean, useful darker edges and warm light behind the future aircraft.
Lighting/mood: golden window light and warm practical lamps, aspirational school workshop, calm museum-like presentation, cinematic depth and subtle dust motes.
Constraints: completely empty of people, no paper airplane in the image, no aircraft, no UI, no readable writing, no logos or brands, no prominent objects across the central display area.
Avoid: industrial steel aircraft hangar, outdoor sky as the main background, text, numbers, watermarks, aviation brands, cluttered center, toy-plastic look, photoreal stock-photo aesthetic, horror, abandoned room.

### Modular prop prompt contract

Every prop used the approved concept board and the matching era plate as visual references.
Each request specified one complete three-quarter-view object, premium cinematic storybook realism, full-object framing, genuine transparent alpha, and no people, plane, writing, brand, logo, watermark, floor, or room.
The object specifications were the same as the deliverable list above: walnut trophy case, matched teal and brick-red locker banks, CRT AV cart, forest-green backpack, hanging folded-paper decorations, abstract digital display, pale-oak classroom door, walnut cork board, and present-day cleaning cart.
The red locker bank was generated as a one-for-one color variant of the accepted teal locker bank so its proportions, hardware, camera angle, and wear remain identical.

### Character prompt contract

Each idle prompt used the identity specification recorded under Character archetypes above.
It requested one complete fictional full-body character, a relaxed readable stance, premium cinematic storybook realism, natural stylized proportions, era-appropriate lighting, and an empty removable background.
Each notice prompt referenced that archetype's accepted idle image and preserved identity, face, hair, clothes, carried object, proportions, rendering, and lighting one-for-one.
Notice changed only the pose to a planted turn toward an unseen harmless paper plane, with widened eyes, lifted eyebrows, a slightly open mouth, and the carried object drawn closer.
Each dodge prompt referenced the same accepted idle image and preserved the same identity contract.
Dodge changed only the pose to a safe theatrical sidestep with bent knees, a raised open hand, a secured carried object, and an amused surprised expression.
No character prompt showed a collision, fall, injury, distress, visible plane, environment, writing, symbol, logo, or watermark.
The generated checker-style removal field was converted to genuine alpha by `scripts/strip-sprite-background.mjs`, which flood-fills only boundary-connected neutral pixels and preserves interior cream clothing, paper, eyes, and shoes.

## High-fidelity iteration

The three accepted corridor plates received a second built-in ImageGen pass as non-destructive `-hd` siblings.
Each edit preserved the original centered chase-camera perspective, clear flight lane, architectural geometry, palette, and major object placement.
The edit request increased physically believable practical lighting, contact shadows, reflective floor response, material definition, and depth separation while prohibiting people, planes, writing, brands, blur, painterly smearing, and new central clutter.
The HD source masters are encoded by `scripts/encode-flight-environments.mjs` at high visual quality with smart chroma subsampling.
The runtime now preserves each plate's source aspect ratio instead of stretching it to the corridor opening.
The modular material atlases are deterministically extracted by `scripts/extract-flight-materials.mjs` into nine 1024-pixel repeating wall, floor, and trim textures.
The 27 transparent character masters are encoded by `scripts/encode-flight-characters.mjs` at high RGB quality and maximum alpha quality so face, clothing, and silhouette edges survive approach-camera scaling.
Those surfaces remain visual only and do not change collision truth.

## Integration status

- The Hangar uses the approved school aeronautics workshop plate.
- The flight runtime uses all three high-fidelity era plates as aspect-correct fading depth backdrops, with tiled era-specific material maps on the code-native walls, floor, ceiling, and wainscot.
- All nine people use 30-percent-larger identity-locked idle, notice, and dodge cutouts with anisotropic mipmapped sampling and interruptible crossfades.
- Character pose textures prewarm in distance stages before each encounter, avoiding first-use upload hitches without placing the entire 27-pose cast on the GPU at launch.
- People notice an approaching plane across most of the corridor and up to a speed-aware 78-world-unit lead distance before the close-pass dodge.
- All five collision hazards use authored obstacle art with code-native fallback geometry.
- Additional lockers, doors, boards, trophy cases, and digital displays are non-colliding visual dressing.
- The real finished fold geometry remains the aircraft, with a larger calibrated silhouette and a height-aware floor shadow.
- The flight HUD and modal surfaces use the cream, navy, red, and monospaced Cinematic Schoolbook instrument language.
