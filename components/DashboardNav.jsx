"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Tracker" },
    { href: "/dashboard/habits", label: "Manage Habits" },
    { href: "/dashboard/stats", label: "Stats" },
  ];

  return (
    <nav className="flex items-center justify-between border-b border-sand pb-4 mb-6">
      <h1 className="font-serif text-xl">Habit Tracker</h1>
      <div className="flex items-center gap-4 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "text-sage font-medium" : "text-ink/60 hover:text-ink"}
          >
            {l.label}
          </Link>
        ))}
        <button onClick={handleLogout} className="text-ink/60 hover:text-rose">
          Log out
        </button>
        <ThemeSwitcher compact />
      </div>
    </nav>
  );
}
