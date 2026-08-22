import { describe, expect, it } from "vitest";
import { AIR_GUSTS, HALLWAY_HAZARDS, HALLWAY_SECTIONS, collidingHazard, courseProgress, enteredGust, nearbyPerson, personConcern, sectionAt, surfaceCollision } from "@/engine/flight";

describe("authored hallway contract", () => {
  it("covers the run continuously in era order", () => {
    expect(HALLWAY_SECTIONS.map((section) => section.id)).toEqual(["1950s", "1980s", "today"]);
    expect(sectionAt(0).id).toBe("1950s");
    expect(sectionAt(-500).id).toBe("1980s");
    expect(sectionAt(-1000).id).toBe("today");
    expect(courseProgress(18)).toBe(0);
    expect(courseProgress(-1280)).toBe(1);
  });

  it("uses the same hazard data for contact and a safe close pass", () => {
    const person = HALLWAY_HAZARDS.find((hazard) => hazard.kind === "person")!;
    expect(collidingHazard(person.position)?.id).toBe(person.id);
    const close = { x: person.position.x + person.radius + 1.2, y: person.position.y, z: person.position.z };
    expect(collidingHazard(close)).toBeNull();
    expect(nearbyPerson(close, new Set())?.id).toBe(person.id);
    expect(nearbyPerson(close, new Set([person.id]))).toBeNull();
  });

  it("detects gusts and corridor surfaces deterministically", () => {
    expect(enteredGust(AIR_GUSTS[0]!.position, new Set())?.id).toBe(AIR_GUSTS[0]!.id);
    expect(enteredGust(AIR_GUSTS[0]!.position, new Set([AIR_GUSTS[0]!.id]))).toBeNull();
    expect(surfaceCollision({ x: 0, y: 4, z: 0 })).toBeNull();
    expect(surfaceCollision({ x: 14, y: 4, z: 0 })).toBe("surface");
  });

  it("gives people a wide, approach-aware field of concern", () => {
    const person = HALLWAY_HAZARDS.find((hazard) => hazard.kind === "person")!;
    expect(personConcern({ x: person.position.x + 10, y: 4, z: person.position.z + 60 }, 22, person)).toBeGreaterThan(0);
    expect(personConcern({ x: person.position.x + 12, y: 4, z: person.position.z + 60 }, 22, person)).toBe(0);
    expect(personConcern({ x: person.position.x, y: 4, z: person.position.z - 8 }, 22, person)).toBe(0);
  });
});
