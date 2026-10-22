export type HelpChapter = {
  id: string; // stable and url-safe: used for ?help=<id> links
  title: string;
  intro: string;
  steps?: string[];
  notes?: string[];
  audience?: string[]; // roles that see this chapter; leave out for everyone
};

// Plain text on purpose. Edit this file when the app changes, in the same change.
export const helpChapters: HelpChapter[] = [
  {
    id: "getting-started",
    title: "Getting started",
    intro:
      "This is the catering order book. It replaces the paper notebook by the till. Both of you can add and change orders, from a phone or the laptop in the back.",
    notes: [
      "Coming up is the first screen. It lists every open order, soonest first. Check it each morning and the night before a big day.",
      "Orders due today or tomorrow have a green line down the left side. Anything with a red line and the word Overdue has passed its date and was never marked done or cancelled.",
      "Real orders are never deleted. A cancelled order stays in the book, marked cancelled. Only the owner can remove the made-up example orders, under Settings, System.",
    ],
  },
  {
    id: "add-an-order",
    title: "Taking an order",
    intro: "Add the order while the customer is still on the phone, so it never lives only in your head.",
    steps: [
      "Tap Add order.",
      "Write the customer's name and phone number.",
      "Pick the date and time they need it.",
      "Write what they want in plain words, like \"coffee for 12, a tray of cinnamon rolls\".",
      "Choose Pickup or Delivery. For delivery, add the address.",
      "Enter the total, and tick Deposit paid if they paid one.",
      "Put allergies and anything else to remember in Notes, then tap Save order.",
    ],
    notes: ["The app records who took the order, so you know who to ask if something is unclear."],
  },
  {
    id: "change-an-order",
    title: "Changing an order",
    intro: "Customers change their minds. Open the order from either list and edit it.",
    steps: [
      "Tap the order in Coming up or All orders.",
      "Change anything under Details.",
      "Tap Save changes.",
    ],
    notes: ["Changing the date moves it to the right day in Coming up."],
  },
  {
    id: "done-or-cancelled",
    title: "Done or cancelled",
    intro: "Close each order once it is over, so Coming up only shows what still needs doing.",
    steps: [
      "Open the order.",
      "Tap Mark done after it has gone out, or Cancel order if the customer called it off.",
    ],
    notes: [
      "Cancelling asks you to confirm, because it takes the order off the list.",
      "Closed one by mistake? Open it from All orders and tap Put back on the upcoming list.",
    ],
  },
  {
    id: "find-an-order",
    title: "Finding an old order",
    intro: "A regular calls and says \"the same as last time.\" Look it up.",
    steps: [
      "Tap All orders.",
      "Type part of the name or the phone number and tap Search.",
      "Use Upcoming, Done or Cancelled to narrow the list.",
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    intro: "Under Settings you can change your name and password, and sign out a lost phone.",
    notes: [
      "Everyone sees every order. There are no private orders.",
      "Password and devices lists every place you are signed in. If a phone goes missing, sign it out there.",
    ],
  },
  {
    id: "add-a-person",
    title: "Adding someone new",
    intro: "Only the owner can do this. It takes a minute.",
    audience: ["owner"],
    steps: [
      "Go to Settings, then People.",
      "Type their email address and tap Let them sign up.",
      "They open the sign-up page on their own phone, use that same email address, and choose their own password.",
    ],
    notes: ["The invitation lasts 7 days. Nobody can sign up without one."],
  },
];
