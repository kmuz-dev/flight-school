/**
 * In-scene annotation: the dashed target-crease line, plus the screen-space
 * anchor the React shell hangs the fold-name label from.
 *
 * Division of labour: the engine draws geometry and reports a projected point;
 * React renders the styled DOM label. No text meshes, no DOM text here.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineDashedMaterial,
  Group,
  Vector2,
  Vector3,
  type Camera,
} from "three";
import type { AnnotationAnchor, Line2 } from "@/engine/core/types";
import type { StageTheme } from "./sceneModel";

/** Millimetres the crease line floats above the top paper layer. */
const CREASE_LIFT_MM = 0.8;
/** Millimetres the label anchor floats above the crease. */
const LABEL_LIFT_MM = 16;

export type CreaseTarget = {
  /** Crease in TABLE space (== world space). */
  readonly line: Line2;
  /** Highest z of the current paper stack, in millimetres. */
  readonly topZ: number;
  /** How far the drawn line should extend either side of the model centre (mm). */
  readonly span: number;
  /** Centre of the model in the table plane, so the line stays framed. */
  readonly center: Vector3;
};

export class Annotations {
  readonly root = new Group();

  private readonly geometry = new BufferGeometry();
  private readonly material: LineDashedMaterial;
  private readonly line: Line;
  private readonly anchor = new Vector3();
  private readonly projected = new Vector3();
  private hasTarget = false;
  private enabled = true;

  constructor(theme: StageTheme) {
    this.root.name = "annotations";
    this.geometry.setAttribute("position", new BufferAttribute(new Float32Array(6), 3));
    this.material = new LineDashedMaterial({
      color: new Color(theme.crease),
      dashSize: 5,
      gapSize: 5,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    this.line = new Line(this.geometry, this.material);
    this.line.name = "target-crease";
    this.line.frustumCulled = false;
    this.line.renderOrder = 10;
    this.line.visible = false;
    this.root.add(this.line);
  }

  /**
   * Point the dashed line at this step's crease. `null` clears it (flip, rotate
   * and unfold steps have no target crease to show).
   */
  setTarget(target: CreaseTarget | null): void {
    if (!target) {
      this.hasTarget = false;
      this.line.visible = false;
      return;
    }

    const { line, topZ, span, center } = target;
    const dir = new Vector2(line.b[0] - line.a[0], line.b[1] - line.a[1]);
    if (dir.lengthSq() < 1e-9) {
      this.hasTarget = false;
      this.line.visible = false;
      return;
    }
    dir.normalize();

    // Project the model centre onto the crease so the drawn segment stays
    // centred on what the user is looking at, however the crease was authored.
    const toCenter = new Vector2(center.x - line.a[0], center.y - line.a[1]);
    const along = toCenter.dot(dir);
    const mid = new Vector2(line.a[0], line.a[1]).addScaledVector(dir, along);

    const half = Math.max(span, 1) * 0.5;
    const z = topZ + CREASE_LIFT_MM;
    const positions = this.geometry.getAttribute("position") as BufferAttribute;
    positions.setXYZ(0, mid.x - dir.x * half, mid.y - dir.y * half, z);
    positions.setXYZ(1, mid.x + dir.x * half, mid.y + dir.y * half, z);
    positions.needsUpdate = true;
    this.geometry.computeBoundingSphere();
    // LineDashedMaterial needs per-vertex distances recomputed after any move.
    this.line.computeLineDistances();

    this.anchor.set(mid.x, mid.y, z + LABEL_LIFT_MM);
    this.hasTarget = true;
    this.line.visible = this.enabled;
  }

  /** The line is shown while the fold is in flight and hidden once it settles. */
  setVisible(visible: boolean): void {
    this.enabled = visible;
    this.line.visible = visible && this.hasTarget;
  }

  /** Fallback anchor when a step has no crease (flip/rotate): above the model. */
  setFallbackAnchor(center: Vector3, topZ: number): void {
    if (this.hasTarget) return;
    this.anchor.set(center.x, center.y, topZ + LABEL_LIFT_MM);
  }

  /**
   * Project the label anchor into CSS pixels relative to the canvas top-left.
   * `visible` is false when the anchor is behind the camera, outside the
   * viewport, or the annotation is switched off.
   */
  project(camera: Camera, width: number, height: number): AnnotationAnchor {
    this.projected.copy(this.anchor).project(camera);
    const inFrustum =
      this.projected.z > -1 &&
      this.projected.z < 1 &&
      Math.abs(this.projected.x) <= 1.15 &&
      Math.abs(this.projected.y) <= 1.15;
    return {
      x: (this.projected.x * 0.5 + 0.5) * width,
      y: (-this.projected.y * 0.5 + 0.5) * height,
      visible: this.enabled && inFrustum,
    };
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.line.removeFromParent();
    this.root.removeFromParent();
  }
}

/** True when the payloads differ enough to be worth waking React for. */
export function annotationChanged(
  a: AnnotationAnchor | null,
  b: AnnotationAnchor,
  epsilonPx = 0.5,
): boolean {
  if (!a) return true;
  if (a.visible !== b.visible) return true;
  if (!b.visible) return false;
  return Math.abs(a.x - b.x) > epsilonPx || Math.abs(a.y - b.y) > epsilonPx;
}
