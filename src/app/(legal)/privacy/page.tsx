import type { Metadata } from "next";
import { legal } from "@/lib/legal";
import { Blank } from "@/components/legal-blank";

export const metadata: Metadata = { title: "What this stores" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-4xl">What the order book stores</h1>
      <p className="text-muted-foreground">Last updated {legal.lastUpdated}</p>

      <p>
        This is the catering order book that {legal.entity ?? <Blank field="entity" />} uses to keep track of
        catering orders. It is for the people who work there. Customers do not use it.
      </p>

      <h2>What it keeps</h2>
      <ul>
        <li>
          <strong>For each order:</strong> the customer&apos;s name and phone number, the date and time, what they
          ordered, pickup or delivery, the delivery address, the total, whether a deposit was paid, any notes
          (such as allergies), whether it is upcoming, done or cancelled, and which staff member took it.
        </li>
        <li>
          <strong>For each staff member:</strong> their name, their email address and their password. The password
          is stored scrambled, so nobody can read it back, including the owner.
        </li>
        <li>
          <strong>A record of changes:</strong> who added, changed, closed or cancelled an order, who was let in,
          who joined and who left, with the time. Order entries name the customer. Entries about people carry
          the name, or the email address of someone invited. When a staff member deletes their account, their
          earlier entries stay and show no name, and the record notes that they left. Nothing deletes this
          record automatically. It stays until someone removes it by hand.
        </li>
        <li>
          <strong>Where you are signed in:</strong> the browser and network address of each device, shown to you
          under Settings so you can sign out a lost phone.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <p>
        Everyone with an account sees every order. The owner can also see the list of people and the record of
        changes. Nobody else can sign up: the owner has to add an email address first.
      </p>

      <h2>Where it goes</h2>
      <p>
        Nowhere else. It is kept in the app&apos;s own database. The app sends no email, runs no advertising and
        no analytics, and shares nothing with other companies. The only cookie is the one that keeps you signed
        in, and the app can&apos;t work without it.
      </p>

      <h2>Your own account</h2>
      <ul>
        <li>Under Settings you can change your name and your password.</li>
        <li>
          Under Settings you can download a file with your details and the orders you took. It is at{" "}
          <code>/settings/export</code> once you are signed in.
        </li>
        <li>
          Staff can delete their own account from Settings. It goes straight away, after you type your email
          address and password. The orders you took stay in the book with your name removed. The owner account
          can&apos;t be deleted from the app.
        </li>
      </ul>

      <h2>Questions</h2>
      <p>
        Ask {legal.contactEmail ? <a href={`mailto:${legal.contactEmail}`} className="py-3.5">{legal.contactEmail}</a> : <Blank field="contactEmail" />}.
      </p>
    </>
  );
}
