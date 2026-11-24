import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!["OWNER", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "only OWNER or ADMIN can review" }, { status: 403 });
  }
  const { postId, decision, note } = (await req.json()) as { postId: string; decision: string; note?: string };
  if (!postId || !["APPROVED", "REJECTED"].includes(decision)) {
    return NextResponse.json({ error: "postId and decision APPROVED|REJECTED required" }, { status: 400 });
  }
  const approval = await prisma.approval.create({
    data: { postId, reviewerId: user.id, decision, note: note || null },
  });
  const post = await prisma.post.update({
    where: { id: postId },
    data: { status: decision === "APPROVED" ? "APPROVED" : "REJECTED" },
  });
  return NextResponse.json({ approval, post }, { status: 201 });
}
