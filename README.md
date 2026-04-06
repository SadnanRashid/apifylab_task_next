# Buddy Script - Social Feed App

This is a simple social media app where you can post updates, share pictures, and talk with other people in a feed. 

## What I built

*   **Accounts**: You can sign up with your name and email, and log in securely.
*   **The Feed**: See everyone's posts in one place. New ones show up at the top.
*   **Making Posts**: You can write text posts and upload images. You can also pick if a post is "Public" for everyone or "Private" for just you.
*   **Likes**: You can like or unlike posts and comments. You can also see a list of who else liked them.
*   **Comments**: People can reply to posts, and you can even reply to those comments to keep a conversation going.

## My choices and decisions

*   **Simple Auth**: I kept things straightforward by only focusing on login and signup. I made sure to include First and Last names during registration so they show up correctly on the feed.
*   **Database with Drizzle**: I used Drizzle ORM because it makes it very easy to stay organized and quickly talk to the database without writing messy SQL.
*   **Handling Next.js 15**: Since I'm using the neIst version of Next.js, I had to fix some common build errors (like identifying dynamic pages) so it works smoothly during a production build.
*   **Polishing the styles**: I fixed a small bug in the provided CSS template that was stopping the styles from loading. I also made sure the auth pages have all the right classes so they look great right away.
*   **Nested Replies**: Instead of just simple comments, I built the system to handle replies. This makes the conversations much easier to follow.

## How it works (The Tech)

*   **Next.js 15**: The main engine for the Ibsite.
*   **Supabase**: Handles the user accounts, saves the images you upload, and stores all the data.
*   **Drizzle ORM**: Helps the app talk to the database easily.
*   **Postgres**: The type database system I used.

## Getting Started

1.  **Install tools**: Run `npm install` in your terminal to get all the code libraries ready. You can use Yarn as well.
2.  **Environment Variables**: Check out `.env.example`. You'll need to create a `.env` file and put in your own Supabase keys and Database URL.
3.  **Run the app**: Type `npm run dev` and open `http://localhost:3000` in your browser.

## Database Setup

If you're setting this up from scratch, make sure to:
*   Create a bucket in Supabase Storage called `post_images` and make it public.
*   Run the database migrations using Drizzle to set up the tables (users, posts, comments, likes).
