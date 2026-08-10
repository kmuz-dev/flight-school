"use client";

/**
 * The live 3D stage, mounted straight onto the real engine seam.
 *
 * This is deliberately the same `createFoldEngine` the tutorial uses, with no
 * wrapper of its own: if the editor's 3D disagrees with the product's 3D, the
 * tool is lying. React owns the container and the lifecycle; the engine owns
 * everything inside it.
 */
import { useEffect, useRef } from "react";
import type { FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { loadFoldEngine } from "@/engine";

export type Stage3DProps = {
  readonly structure: PlaneStructure;
  /** 0-based step index. */
  readonly stepIndex: number;
  readonly onHandle: (handle: FoldEngineHandle | null) => void;
  readonly onProgress: (t: number) => void;
};

export function Stage3D({ structure, stepIndex, onHandle, onProgress }: Stage3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<FoldEngineHandle | null>(null);
  const onHandleRef = useRef(onHandle);
  const onProgressRef = useRef(onProgress);
  // The renderer arrives after the step effect below has already run once, so
  // the step to open on has to be readable at that later moment.
  const stepIndexRef = useRef(stepIndex);

  useEffect(() => {
    onHandleRef.current = onHandle;
    onProgressRef.current = onProgress;
    stepIndexRef.current = stepIndex;
  }, [onHandle, onProgress, stepIndex]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let off: (() => void) | null = null;
    let stopped = false;

    void loadFoldEngine().then((create) => {
      if (stopped) return;
      const handle = create(mount, structure, { theme: "paper" });
      handleRef.current = handle;
      off = handle.on("progress", (payload) => {
        onProgressRef.current(typeof payload === "number" ? payload : 1);
      });
      onHandleRef.current(handle);
      handle.gotoStep(stepIndexRef.current, { animate: false });
    });

    return () => {
      stopped = true;
      off?.();
      const handle = handleRef.current;
      handleRef.current = null;
      onHandleRef.current(null);
      handle?.dispose();
    };
  }, [structure]);

  useEffect(() => {
    handleRef.current?.gotoStep(stepIndex, { animate: true });
  }, [stepIndex]);

  return <div ref={mountRef} className="absolute inset-0" data-testid="dev-stage-3d" />;
}
