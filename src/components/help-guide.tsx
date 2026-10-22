"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { HelpChapter } from "@/content/help/chapters";

/**
 * The ? in the header. Full screen on a phone, a side panel on a laptop.
 * Opens on ?help=<chapter id>, and with the ? key when nobody is typing.
 */
export function HelpGuide({ chapters }: { chapters: HelpChapter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("help");

  const [open, setOpen] = useState(requested !== null);
  const [activeId, setActiveId] = useState(
    () => chapters.find((c) => c.id === requested)?.id ?? chapters[0].id,
  );

  // A ?help= link followed while the page is already open: React's own pattern for reacting to a
  // changed value is to compare it during render, not in an effect.
  const [seenRequest, setSeenRequest] = useState(requested);
  if (requested !== seenRequest) {
    setSeenRequest(requested);
    if (requested !== null) {
      setActiveId(chapters.find((c) => c.id === requested)?.id ?? chapters[0].id);
      setOpen(true);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "?" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next && requested !== null) {
      // Drop ?help= so closing and reopening does not jump back to the linked chapter.
      const rest = new URLSearchParams(params.toString());
      rest.delete("help");
      const qs = rest.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  }

  const chapter = chapters.find((c) => c.id === activeId) ?? chapters[0];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Open the guide"
        className="font-display text-lg"
        onClick={() => setOpen(true)}
      >
        ?
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="overflow-y-auto pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl">How this works</SheetTitle>
            <SheetDescription>Short answers for the people who use the order book.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-8">
            <nav aria-label="Guide chapters">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {chapters.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-current={c.id === chapter.id ? "true" : undefined}
                      className={`min-h-11 border-b-2 py-2 text-left font-medium ${
                        c.id === chapter.id ? "border-primary" : "border-transparent text-muted-foreground"
                      }`}
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <article>
              <h3 className="text-2xl">{chapter.title}</h3>
              <p className="mt-2 text-base">{chapter.intro}</p>
              {chapter.steps && (
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-base">
                  {chapter.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
              {chapter.notes && (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-base">
                  {chapter.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
