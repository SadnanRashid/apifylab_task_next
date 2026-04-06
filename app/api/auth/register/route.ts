import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (data.user) {
      try {
        await db.insert(users).values({
          id: data.user.id,
          firstName,
          lastName,
          email,
        });
      } catch (dbError: any) {
        // Fallback: If DB insert fails, maybe handle cleanup or ignore if already exists
        console.error("Failed to insert user profile", dbError);
      }
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
