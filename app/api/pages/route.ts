import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/client";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return NextResponse.json({ data: [] });
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("owner_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured." },
      { status: 503 }
    );
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = body.title ?? "Untitled";
  const parentId = body.parentId ?? null;
  const icon = body.icon ?? null;

  const { count } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const position = (count ?? 0) + 1;

  const { data, error } = await supabase
    .from("pages")
    .insert({
      title,
      parent_id: parentId,
      owner_id: user.id,
      position,
      icon
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // create an initial paragraph block
  await supabase.from("blocks").insert({
    page_id: data.id,
    type: "paragraph",
    owner_id: user.id,
    position: 0,
    content: { text: "" }
  });

  return NextResponse.json(data);
}
