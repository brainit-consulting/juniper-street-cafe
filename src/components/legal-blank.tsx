// The one place a hard-coded colour is right: this marker is meant to look like it doesn't belong,
// so nobody publishes a page with a blank in it. Do not move it onto the theme colours.
export function Blank({ field }: { field: string }) {
  return (
    <mark className="rounded bg-yellow-200 px-1 text-black">
      Needs your details: set <code>{field}</code> in <code>src/lib/legal.ts</code>
    </mark>
  );
}
