import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email && !session?.user?.name) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Find user by email or name
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const items = await prisma.bookmark.findMany({ where: { userId: user.id }, include: { book: true }, orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.email && !session?.user?.name) {
      return new Response('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
    if (!user) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const bookId = String(body.bookId || '');
    const position = Number(body.position || 0) || 0;
    if (!bookId) return new Response('Bad Request', { status: 400 });

    // create bookmark
    const bm = await prisma.bookmark.create({ data: { userId: user.id, bookId, position } });
    return new Response(JSON.stringify(bm), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response('Server error', { status: 500 });
  }
}
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stubbed response for bookmarks
  return new Response(JSON.stringify({ bookmarks: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
