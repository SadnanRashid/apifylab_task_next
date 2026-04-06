import { NextResponse } from 'next/server';
import { db } from '@/db';
import { comments } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { content, postId, parentId } = await request.json();
    const newComment = await db.insert(comments).values({
      userId: user.id,
      content,
      postId: parseInt(postId),
      parentId: parentId ? parseInt(parentId) : null
    }).returning();
    
    return NextResponse.json({ comment: newComment[0] }, { status: 200 });
  } catch (e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
