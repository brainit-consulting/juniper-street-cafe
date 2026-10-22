"use client";

import { useActionState } from "react";
import { saveOrder, type FormState } from "@/app/(app)/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OrderFormValues = {
  id?: string;
  customerName: string;
  phone: string;
  dueDate: string;
  dueTime: string;
  items: string;
  fulfilment: string;
  deliveryAddress: string;
  total: string;
  depositPaid: boolean;
  notes: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function OrderForm({ initial, submitLabel }: { initial: OrderFormValues; submitLabel: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveOrder, {});
  const errors = state.errors ?? {};
  const v = state.values;

  // The radio buttons are the one source of truth for pickup or delivery. The address box
  // shows or hides with CSS from whichever one is checked, so a form reset cannot leave
  // the screen and the form disagreeing.
  const fulfilment = v?.fulfilment || initial.fulfilment;
  const text = (key: Exclude<keyof OrderFormValues, "depositPaid" | "id">) =>
    v ? (v[key] ?? "") : initial[key];

  return (
    <form action={action} className="group/order flex flex-col gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input id="customerName" name="customerName" defaultValue={text("customerName")} autoComplete="off" />
        <FieldError message={errors.customerName} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={text("phone")} autoComplete="off" />
        <FieldError message={errors.phone} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Date</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={text("dueDate")} />
          <FieldError message={errors.dueDate} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueTime">Time</Label>
          <Input id="dueTime" name="dueTime" type="time" defaultValue={text("dueTime")} />
          <FieldError message={errors.dueTime} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="items">What they want</Label>
        <Textarea
          id="items"
          name="items"
          rows={3}
          defaultValue={text("items")}
          placeholder="Coffee for 12, a tray of cinnamon rolls"
        />
        <FieldError message={errors.items} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Pickup or delivery</legend>
        <div className="grid grid-cols-2 gap-4">
          {(["pickup", "delivery"] as const).map((option) => (
            <label
              key={option}
              className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 has-[:checked]:border-primary has-[:checked]:bg-muted"
            >
              <input
                type="radio"
                name="fulfilment"
                value={option}
                defaultChecked={fulfilment === option}
                className="size-5 accent-primary"
              />
              <span className="font-medium capitalize">{option}</span>
            </label>
          ))}
        </div>
        <FieldError message={errors.fulfilment} />
      </fieldset>

      <div className="hidden flex-col gap-2 group-has-[input[value=delivery]:checked]/order:flex">
        <Label htmlFor="deliveryAddress">Delivery address</Label>
        <Textarea id="deliveryAddress" name="deliveryAddress" rows={2} defaultValue={text("deliveryAddress")} />
        <FieldError message={errors.deliveryAddress} />
      </div>

      <div className="grid grid-cols-2 items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="total">Total ($)</Label>
          <Input id="total" name="total" inputMode="decimal" defaultValue={text("total")} placeholder="85.00" />
          <FieldError message={errors.total} />
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="depositPaid"
            defaultChecked={v ? v.depositPaid === "on" : initial.depositPaid}
            className="size-5 accent-primary"
          />
          <span className="font-medium">Deposit paid</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={text("notes")}
          placeholder="Allergies, door code, anything to remember"
        />
      </div>

      <FieldError message={errors.form} />
      {state.signedOut && (
        <p>
          <a href="/sign-in" target="_blank" rel="noopener" className="font-medium underline underline-offset-4">
            Sign in (opens in a new tab)
          </a>
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
