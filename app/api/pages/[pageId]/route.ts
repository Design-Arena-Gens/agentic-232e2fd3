import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/client";

type Params = {
  params: { pageId: string };
};

export async function GET(_: Request, { params }: Params) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
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
    .eq("id", params.pageId)
    .eq("owner_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const updates = {
    title: payload.title,
    icon: payload.icon,
    parent_id: payload.parentId
  };

  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", params.pageId)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("blocks").delete().eq("page_id", params.pageId).eq("owner_id", user.id);
  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", params.pageId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
