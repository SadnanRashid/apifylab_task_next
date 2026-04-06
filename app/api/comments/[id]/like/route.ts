import { NextResponse } from 'next/server';
import { db } from '@/db';
import { likes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const commentId = parseInt(params.id);

  try {
    const existing = await db.select().from(likes).where(
      and(
        eq(likes.userId, user.id), 
        eq(likes.commentId, commentId)
      )
    );

    if (existing.length > 0) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
      return NextResponse.json({ success: true, action: 'unliked' });
    } else {
      await db.insert(likes).values({
        userId: user.id,
        commentId,
      });
      return NextResponse.json({ success: true, action: 'liked' });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
