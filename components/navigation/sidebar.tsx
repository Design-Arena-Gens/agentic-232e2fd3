"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, FilePlus, Loader2 } from "lucide-react";
import clsx from "clsx";
import { WorkspacePage } from "@/lib/types";

type SidebarProps = {
  pages: WorkspacePage[];
};

type TreeNode = WorkspacePage & {
  depth: number;
  isExpanded: boolean;
};

export function Sidebar({ pages }: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const flattened = useMemo(() => {
    const result: TreeNode[] = [];
    const visit = (node: WorkspacePage, depth: number) => {
      result.push({
        ...node,
        depth,
        isExpanded: expanded.has(node.id)
      });
      if (expanded.has(node.id) || depth === 0) {
        node.children?.forEach((child) => visit(child, depth + 1));
      }
    };
    pages.forEach((page) => visit(page, 0));
    return result;
  }, [pages, expanded]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreatePage = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: "Untitled" })
      });

      if (!res.ok) {
        throw new Error("Failed to create page");
      }
      const page = await res.json();
      router.push(`/pages/${page.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="glass relative flex w-72 shrink-0 flex-col border-r border-slate-900/50">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-slate-200">Workspace</span>
        <button
          className="rounded-md border border-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition hover:border-brand hover:text-white"
          onClick={handleCreatePage}
          disabled={creating}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-1">
              <FilePlus className="h-4 w-4" />
              New
            </div>
          )}
        </button>
      </div>
      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {flattened.map((node) => {
          const isActive = pathname === `/pages/${node.id}` || (pathname === "/" && node.depth === 0);

          return (
            <div key={node.id}>
              <div
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-300 transition hover:bg-slate-900"
                style={{ paddingLeft: 12 + node.depth * 14 }}
              >
                {node.children && node.children.length > 0 ? (
                  <button
                    className="rounded-md p-1 transition hover:bg-slate-900/60"
                    onClick={() => toggle(node.id)}
                  >
                    {node.isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                ) : (
                  <span className="h-4 w-4" />
                )}
                <Link
                  className={clsx(
                    "flex-1 truncate rounded px-1 py-0.5",
                    isActive ? "bg-slate-800 text-white" : "text-slate-300"
                  )}
                  href={`/pages/${node.id}`}
                >
                  {node.icon ? `${node.icon} ` : ""}
                  {node.title || "Untitled"}
                </Link>
              </div>
            </div>
          );
        })}
        {flattened.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Create your first page to get started.
          </div>
        )}
      </div>
    </aside>
  );
}
