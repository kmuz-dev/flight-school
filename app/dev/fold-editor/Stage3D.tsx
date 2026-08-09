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
import { createFoldEngine } from "@/engine";

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

  useEffect(() => {
    onHandleRef.current = onHandle;
    onProgressRef.current = onProgress;
  }, [onHandle, onProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const handle = createFoldEngine(mount, structure, { theme: "paper" });
    handleRef.current = handle;
    const off = handle.on("progress", (payload) => {
      onProgressRef.current(typeof payload === "number" ? payload : 1);
    });
    onHandleRef.current(handle);

    return () => {
      off();
      handleRef.current = null;
      onHandleRef.current(null);
      handle.dispose();
    };
  }, [structure]);

  useEffect(() => {
    handleRef.current?.gotoStep(stepIndex, { animate: true });
  }, [stepIndex]);

  return <div ref={mountRef} className="absolute inset-0" data-testid="dev-stage-3d" />;
}
