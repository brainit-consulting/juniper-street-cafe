"use client";

import { useState, useTransition } from "react";
import { removeExamplesAction } from "@/app/(app)/settings/system/actions";
import { Button } from "@/components/ui/button";

export function RemoveExamplesCard({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="max-w-prose">
      <p>
        The book has {count} made-up example {count === 1 ? "order" : "orders"}. Remove them before you start
        using it for real. Only the examples go. Real orders are never touched.
      </p>
      {confirming ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="font-medium">Remove all {count} example orders? This can&apos;t be undone.</p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              size="lg"
              disabled={pending}
              onClick={() => start(async () => {
                await removeExamplesAction();
                setConfirming(false);
              })}
            >
              Yes, remove them
            </Button>
            <Button variant="outline" size="lg" onClick={() => setConfirming(false)}>
              Keep them
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="lg" className="mt-4" onClick={() => setConfirming(true)}>
          Remove the example orders
        </Button>
      )}
    </div>
  );
}
