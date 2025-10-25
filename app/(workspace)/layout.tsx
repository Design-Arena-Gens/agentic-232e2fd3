import { ReactNode } from "react";
import { fetchPagesTree } from "@/lib/data/pages";
import { AppShell } from "@/components/layout/app-shell";

export default async function WorkspaceLayout({
  children
}: {
  children: ReactNode;
}) {
  const pages = await fetchPagesTree();

  return <AppShell pages={pages}>{children}</AppShell>;
}
