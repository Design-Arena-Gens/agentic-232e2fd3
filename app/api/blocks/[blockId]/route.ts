import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/client";

type Params = {
  params: { blockId: string };
};

export async function PUT(request: Request, { params }: Params) {
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
  const { id, page_id, type, content, position } = payload;

  if (!page_id) {
    return NextResponse.json({ error: "Missing page_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("blocks")
    .upsert(
      {
        id: id ?? params.blockId,
        page_id,
        type,
        content,
        owner_id: user.id,
        position
      },
      { onConflict: "id" }
    )
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

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", params.blockId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
