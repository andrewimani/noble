import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

    const user = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!user) return new Response('Unauthorized', { status: 401 });

    const id = params.id;
    const existing = await prisma.bookmark.findUnique({ where: { id } });
    if (!existing) return new Response('Not Found', { status: 404 });
    if (existing.userId !== user.id) return new Response('Forbidden', { status: 403 });

    await prisma.bookmark.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return new Response('Server error', { status: 500 });
  }
}
