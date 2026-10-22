"use client";

import { useState, useTransition } from "react";
import { changeStatus } from "@/app/(app)/orders/actions";
import type { OrderStatus } from "@/lib/orders";
import { Button } from "@/components/ui/button";

function Problem({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 text-destructive">
      {message}
    </p>
  );
}

export function StatusButtons({ id, status }: { id: string; status: OrderStatus }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // changeStatus redirects when it works, so a result only ever comes back with a problem.
  const go = (next: OrderStatus) =>
    start(async () => {
      setError(null);
      const result = await changeStatus(id, next);
      if (result) setError(result.error);
    });

  if (status !== "upcoming") {
    return (
      <div>
        <Button variant="outline" size="lg" disabled={pending} onClick={() => go("upcoming")}>
          Put back on the upcoming list
        </Button>
        <Problem message={error} />
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium">Cancel this order? It stays in All orders, marked cancelled.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="destructive" size="lg" disabled={pending} onClick={() => go("cancelled")}>
            Yes, cancel it
          </Button>
          <Button variant="outline" size="lg" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
        <Problem message={error} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" disabled={pending} onClick={() => go("done")}>
          Mark done
        </Button>
        <Button variant="outline" size="lg" onClick={() => setConfirming(true)}>
          Cancel order
        </Button>
      </div>
      <Problem message={error} />
    </div>
  );
}
