import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "cp_session";

export async function currentUser() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("unauthenticated");
  return user;
}
