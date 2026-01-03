# SupportBot – AI FAQ / Support Chatbot

Next.js 14 (App Router) app with Tailwind, Prisma (SQLite), NextAuth (GitHub), and OpenAI streaming chat. It answers from a fixed FAQ knowledge base and hands off to humans when unsure.

## Stack
- Next.js 14 / App Router, React, TypeScript, Tailwind
- Auth: NextAuth + PrismaAdapter (GitHub OAuth)
- DB: PostgreSQL via Prisma (Supabase recommended - see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- AI: OpenAI chat completions with streaming

## Quick start (local)
1) Install deps:
```bash
npm install
```

2) Env in `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-long-random-string
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
OPENAI_API_KEY=your_openai_key
# optional: OPENAI_MODEL=gpt-4o-mini (default)
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

**Database Setup:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed Supabase setup instructions.

3) GitHub OAuth app settings:
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

4) Database:
```bash
npx prisma migrate dev
```

5) Run:
```bash
npm run dev
```

## App flow
- Landing (`/`): marketing hero + “Sign in”.
- Auth: NextAuth GitHub login -> session stored in Prisma.
- Dashboard layout requires auth.
- Support page (`/dashboard/support`): loads latest chat (or `?new=1` to start fresh) and renders `SupportChat`.
- Chat API (`/api/chat`): verifies session, creates/reuses chat, saves user message, selects FAQ context (`src/lib/faq.ts`), streams OpenAI reply, then persists assistant message; returns headers `x-chat-id` and `x-assistant-message-id`.
- Feedback API (`/api/feedback`): upsert 👍/👎 for an assistant message the user owns.

## Data model (Prisma)
- User, Account, Session (NextAuth)
- Chat → Message (role: user/assistant/system) → optional Feedback

## FAQ knowledge base
- Static list at `src/lib/faq.ts` used as the only allowed context. Bot must defer to a human when unsure.

## Streaming UX
- Client reads streamed text from `/api/chat` and appends tokens live to the assistant bubble. Feedback buttons call `/api/feedback`.

## Deployment

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for a complete deployment guide.**

**Database Setup:** 📘 **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase setup instructions.**

Quick notes:
- Set `NEXTAUTH_URL` to your deployed domain.
- Update GitHub OAuth callback to `https://your-domain/api/auth/callback/github`.
- **Important:** Use PostgreSQL for production (Supabase recommended - free tier available).
