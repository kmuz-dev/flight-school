import { BrandMark } from "@/components/ui/BrandMark";
import { FOCUS_RING } from "@/components/ui/focus";

export default function NotFound() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <main className="mx-auto flex min-h-screen max-w-[52ch] flex-col items-center justify-center gap-lg px-lg py-2xl text-center">
      <BrandMark className="h-40 w-44" label="Flight School" sizes="176px" priority />
      <div>
        <p className="font-mono text-micro font-bold tracking-[0.16em] text-red-ink uppercase">
          Flight path unavailable
        </p>
        <h1 className="mt-sm font-display text-display font-bold tracking-tight uppercase">
          This plane flew off course
        </h1>
      </div>
      <a
        href={`${basePath}/en/`}
        className={`rounded-input bg-red-ink px-lg py-sm font-semibold text-on-red ${FOCUS_RING}`}
      >
        Return to Flight School
      </a>
    </main>
  );
}
