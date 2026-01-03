# Deployment Guide

This guide covers deploying the AI-FAQ project as a personal project. The app uses Next.js 14, Prisma, NextAuth, and OpenAI.

## ⚠️ Important: Database Migration Required

**SQLite is not suitable for production deployments** (especially on serverless platforms). You'll need to migrate to **PostgreSQL** before deploying.

## Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest option for Next.js projects with a generous free tier.

### Prerequisites
1. GitHub account
2. Vercel account (free tier available)
3. PostgreSQL database (see database options below)
4. GitHub OAuth app
5. OpenAI API key

### Step 1: Migrate to PostgreSQL

1. **Update Prisma schema** (`prisma/schema.prisma`):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Install PostgreSQL adapter** (if needed):
```bash
npm install @prisma/adapter-postgresql
```

3. **Update your database connection** if you're using a custom adapter.

### Step 2: Set Up PostgreSQL Database

**Free PostgreSQL options:**
- **Vercel Postgres** (easiest, integrates with Vercel)
- **Neon** (serverless Postgres, free tier)
- **Supabase** (free tier available) - **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup**
- **Railway** (free tier with $5 credit)

Get your `DATABASE_URL` connection string from your chosen provider.

**Example connection string formats:**
- **Neon:** `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`
- **Supabase:** `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?sslmode=require`
- **Vercel Postgres:** `postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb?sslmode=require`
- **Railway:** `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?sslmode=require`

**Note:** Your local URL (`postgresql://postgres:postgres@localhost:5432/ai_faq`) won't work in production. You need to create a cloud database and use the connection string provided by your chosen provider. Most providers require `?sslmode=require` at the end for secure connections.

#### Quick Supabase Setup

If you're using Supabase (recommended for free tier):

1. **Create account** at [supabase.com](https://supabase.com)
2. **Create new project** → Set a database password (save it!)
3. **Get connection string:**
   - Go to Settings → Database → Connection string → URI tab
   - Copy the string and replace `[YOUR-PASSWORD]` with your actual password
   - Add `?sslmode=require` at the end
4. **For production**, use Connection Pooling (port 6543) for better performance

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete step-by-step instructions.

### Step 3: Run Database Migrations

```bash
# Update DATABASE_URL in .env.local first
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Step 4: Deploy to Vercel

1. **Push your code to GitHub** (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Import project to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** in Vercel dashboard:
   - `NEXTAUTH_URL` → `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET` → Generate a random string (use `openssl rand -base64 32`)
   - `GITHUB_ID` → Your GitHub OAuth Client ID
   - `GITHUB_SECRET` → Your GitHub OAuth Client Secret
   - `OPENAI_API_KEY` → Your OpenAI API key
   - `DATABASE_URL` → Your PostgreSQL connection string
   - `OPENAI_MODEL` → (optional) Default: `gpt-4o-mini`

4. **Update GitHub OAuth App:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Update "Authorization callback URL" to: `https://your-app.vercel.app/api/auth/callback/github`
   - Update "Homepage URL" to: `https://your-app.vercel.app`

5. **Deploy:**
   - Vercel will automatically deploy on every push to your main branch
   - Or click "Deploy" in the dashboard

### Step 5: Run Post-Deployment Migration

After first deployment, you may need to run migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or use Vercel's built-in migration support
# Add to package.json:
"postinstall": "prisma generate && prisma migrate deploy"
```

---

## Option 2: Railway (Full-Stack Platform)

Railway is great for deploying full-stack apps with databases in one place.

### Steps:

1. **Sign up** at [railway.app](https://railway.app)

2. **Create a new project** and select "Deploy from GitHub repo"

3. **Add PostgreSQL service:**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL` automatically

4. **Configure your Next.js service:**
   - Railway auto-detects Next.js
   - Add environment variables:
     - `NEXTAUTH_URL` → `https://your-app.railway.app`
     - `NEXTAUTH_SECRET` → Generate random string
     - `GITHUB_ID` → Your GitHub OAuth Client ID
     - `GITHUB_SECRET` → Your GitHub OAuth Client Secret
     - `OPENAI_API_KEY` → Your OpenAI API key
     - `DATABASE_URL` → Use Railway's PostgreSQL service variable

5. **Update build command** (if needed):
   - Railway should auto-detect, but you can set:
   - Build: `npm run build`
   - Start: `npm start`

6. **Run migrations:**
   - Add to `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate",
     "migrate": "prisma migrate deploy"
   }
   ```
   - Or run manually via Railway CLI

7. **Update GitHub OAuth callback URL** to your Railway domain

---

## Option 3: Render

Render offers free tier hosting with PostgreSQL.

### Steps:

1. **Sign up** at [render.com](https://render.com)

2. **Create PostgreSQL database:**
   - New → PostgreSQL
   - Copy the `Internal Database URL`

3. **Create Web Service:**
   - New → Web Service
   - Connect your GitHub repo
   - Settings:
     - **Build Command:** `npm install && npx prisma generate && npm run build`
     - **Start Command:** `npm start`
     - **Environment:** Node

4. **Add Environment Variables:**
   - `NEXTAUTH_URL` → `https://your-app.onrender.com`
   - `NEXTAUTH_SECRET` → Random string
   - `GITHUB_ID` → Your GitHub OAuth Client ID
   - `GITHUB_SECRET` → Your GitHub OAuth Client Secret
   - `OPENAI_API_KEY` → Your OpenAI API key
   - `DATABASE_URL` → Your Render PostgreSQL URL

5. **Run migrations:**
   - Use Render's shell or add to build command

6. **Update GitHub OAuth callback URL**

---

## Option 4: Fly.io (More Control)

Fly.io gives you more control and works well for personal projects.

### Steps:

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Create Fly app:**
```bash
fly launch
```

3. **Set up PostgreSQL:**
```bash
fly postgres create
fly postgres attach <postgres-app-name> -a <your-app-name>
```

4. **Configure secrets:**
```bash
fly secrets set NEXTAUTH_URL=https://your-app.fly.dev
fly secrets set NEXTAUTH_SECRET=<random-string>
fly secrets set GITHUB_ID=<your-github-id>
fly secrets set GITHUB_SECRET=<your-github-secret>
fly secrets set OPENAI_API_KEY=<your-openai-key>
```

5. **Deploy:**
```bash
fly deploy
```

---

## Environment Variables Checklist

Make sure you have all these set in your deployment platform:

- ✅ `NEXTAUTH_URL` - Your production URL
- ✅ `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- ✅ `GITHUB_ID` - GitHub OAuth Client ID
- ✅ `GITHUB_SECRET` - GitHub OAuth Client Secret
- ✅ `OPENAI_API_KEY` - Your OpenAI API key
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ⚙️ `OPENAI_MODEL` - (optional) Default: `gpt-4o-mini`

## Post-Deployment Checklist

- [ ] Database migrated from SQLite to PostgreSQL
- [ ] Prisma migrations run successfully
- [ ] All environment variables configured
- [ ] GitHub OAuth callback URL updated
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Verify database connections

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` uses SSL (`?sslmode=require`)
- Check database is accessible from your deployment platform
- Verify migrations ran successfully

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your production domain exactly
- Check GitHub OAuth callback URL is correct
- Ensure `NEXTAUTH_SECRET` is set

### Build Failures
- Check Node.js version (Next.js 14 requires Node 18+)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally first

## Cost Estimates (Personal Use)

- **Vercel:** Free tier (generous limits)
- **Railway:** $5/month credit (usually enough for personal projects)
- **Render:** Free tier (with limitations)
- **Fly.io:** Pay-as-you-go (very affordable for low traffic)
- **PostgreSQL:** Free tiers available on Neon, Supabase, or included with Railway

## Recommended Setup for Personal Projects

**Best combination:**
- **Hosting:** Vercel (free, easy, optimized for Next.js)
- **Database:** Neon or Vercel Postgres (free tier, serverless)
- **Total cost:** $0/month for low-medium traffic

---

## Quick Start Commands

```bash
# 1. Update Prisma schema for PostgreSQL
# Edit prisma/schema.prisma: change provider to "postgresql"

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env.local with all required vars

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate deploy

# 6. Test locally
npm run dev

# 7. Build for production
npm run build
npm start
```



