import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { ADMIN_ROLE } from "@/lib/roles";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const isOwner = session.user.role === ADMIN_ROLE;

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <nav className="flex gap-5 overflow-x-auto md:w-44 md:flex-col md:gap-1" aria-label="Settings">
        <Link href="/settings" className="py-2 font-medium">
          You
        </Link>
        <Link href="/settings/security" className="py-2 font-medium">
          Password and devices
        </Link>
        {isOwner && (
          <Link href="/settings/people" className="py-2 font-medium">
            People
          </Link>
        )}
        {isOwner && (
          <Link href="/settings/system" className="py-2 font-medium">
            System
          </Link>
        )}
      </nav>
      <div className="min-w-0 flex-1 space-y-10">{children}</div>
    </div>
  );
}
