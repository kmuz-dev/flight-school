"use client";

/**
 * The client seam for the tutorial route: the screen itself is unchanged, this
 * only gives its completion beat somewhere to go (the wings certificate).
 */
import { useRouter } from "next/navigation";
import { TutorialScreen, type TutorialScreenProps } from "@/components/tutorial/TutorialScreen";

export type FoldRouteProps = Omit<TutorialScreenProps, "onComplete"> & {
  completionHref: string;
};

export function FoldRoute({ completionHref, ...screen }: FoldRouteProps) {
  const router = useRouter();
  return <TutorialScreen {...screen} onComplete={() => router.push(completionHref)} />;
}
