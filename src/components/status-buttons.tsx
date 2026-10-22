"use client";

import { useState, useTransition } from "react";
import { changeStatus } from "@/app/(app)/orders/actions";
import type { OrderStatus } from "@/lib/orders";
import { Button } from "@/components/ui/button";

export function StatusButtons({ id, status }: { id: string; status: OrderStatus }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const go = (next: OrderStatus) => start(() => changeStatus(id, next));

  if (status !== "upcoming") {
    return (
      <Button variant="outline" size="lg" disabled={pending} onClick={() => go("upcoming")}>
        Put back on the upcoming list
      </Button>
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button size="lg" disabled={pending} onClick={() => go("done")}>
        Mark done
      </Button>
      <Button variant="outline" size="lg" onClick={() => setConfirming(true)}>
        Cancel order
      </Button>
    </div>
  );
}
