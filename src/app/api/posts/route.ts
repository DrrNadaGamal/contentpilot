import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json();
  const { brandId, content, contentAr, channels, scheduledAt, mediaId, submit } = body as {
    brandId: string; content: string; contentAr?: string; channels: string[];
    scheduledAt?: string; mediaId?: string | null; submit?: boolean;
  };
  if (!brandId || !content || !Array.isArray(channels) || channels.length === 0) {
    return NextResponse.json({ error: "brandId, content and at least one channel are required" }, { status: 400 });
  }
  const status = submit ? "PENDING_APPROVAL" : "DRAFT";
  const post = await prisma.post.create({
    data: {
      brandId,
      authorId: user.id,
      content,
      contentAr: contentAr || null,
      channels: channels.join(","),
      mediaId: mediaId || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
