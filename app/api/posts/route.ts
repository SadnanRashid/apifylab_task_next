import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, users, likes, comments } from '@/db/schema';
import { desc, eq, or, isNull } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const publicCondition = eq(posts.isPublic, true);
    const ownerCondition = eq(posts.userId, user.id);

    const allPosts = await db.select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      isPublic: posts.isPublic,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    }).from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(or(publicCondition, ownerCondition))
      .orderBy(desc(posts.createdAt));

    // Fetch all likes with user names
    const allLikes = await db.select({
      id: likes.id,
      userId: likes.userId,
      postId: likes.postId,
      commentId: likes.commentId,
      user: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    }).from(likes)
      .leftJoin(users, eq(likes.userId, users.id));

    const allComments = await db.select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    }).from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .orderBy(comments.createdAt);

    const assembledPosts = allPosts.map(post => {
      const postLikes = allLikes.filter(l => l.postId === post.id && l.commentId === null);
      const postComments = allComments.filter(c => c.postId === post.id).map(c => {
        return {
          ...c,
          likes: allLikes.filter(l => l.commentId === c.id)
        }
      });
      return {
        ...post,
        likes: postLikes,
        comments: postComments
      }
    });

    return NextResponse.json({ posts: assembledPosts, currentUser: user }, { status: 200 });

  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { content, imageUrl, isPublic } = await request.json();
    const newPost = await db.insert(posts).values({
      userId: user.id,
      content,
      imageUrl,
      isPublic: isPublic !== undefined ? isPublic : true
    }).returning();

    return NextResponse.json({ post: newPost[0] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
