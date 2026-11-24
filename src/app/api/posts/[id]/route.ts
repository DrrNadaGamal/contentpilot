import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.scheduledAt === "string" || body.scheduledAt === null) {
    data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  }
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.content === "string") data.content = body.content;
  const post = await prisma.post.update({ where: { id }, data });
  return NextResponse.json({ post });
}
