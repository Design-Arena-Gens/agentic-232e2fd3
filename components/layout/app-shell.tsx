import Link from "next/link";
import { ReactNode } from "react";
import { WorkspacePage } from "@/lib/types";
import { Sidebar } from "@/components/navigation/sidebar";
import { UserNav } from "@/components/navigation/user-nav";

type AppShellProps = {
  pages: WorkspacePage[];
  children: ReactNode;
};

export function AppShell({ pages, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar pages={pages} />
      <div className="flex flex-1 flex-col">
        <header className="glass sticky top-0 z-10 flex h-14 items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold text-slate-200">
            Notion Clone
          </Link>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
