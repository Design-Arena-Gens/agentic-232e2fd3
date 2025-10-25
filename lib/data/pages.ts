import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server-client";
import { WorkspacePage, PageBlock } from "@/lib/types";

export async function fetchPagesTree(): Promise<WorkspacePage[]> {
  const supabase = createServerClient(cookies());
  if (!supabase) {
    return [];
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("owner_id", user.id)
    .order("position", { ascending: true });

  if (error || !data) {
    console.error(error);
    return [];
  }

  const pageMap = new Map<string, WorkspacePage>();
  data.forEach((page) => {
    pageMap.set(page.id, {
      ...page,
      children: []
    });
  });

  const roots: WorkspacePage[] = [];
  for (const page of pageMap.values()) {
    if (page.parent_id && pageMap.has(page.parent_id)) {
      pageMap.get(page.parent_id)!.children!.push(page);
    } else {
      roots.push(page);
    }
  }

  const sortTree = (nodes: WorkspacePage[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortTree(node.children);
      }
    });
  };

  sortTree(roots);
  return roots;
}

export async function fetchPage(pageId: string) {
  const supabase = createServerClient(cookies());
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as WorkspacePage;
}

export async function fetchBlocks(pageId: string): Promise<PageBlock[]> {
  const supabase = createServerClient(cookies());
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("position", { ascending: true });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data as PageBlock[];
}
