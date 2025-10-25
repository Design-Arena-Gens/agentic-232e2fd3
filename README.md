# Notion Clone with Supabase

A modern workspace application inspired by Notion. Built with Next.js 14, Tailwind CSS, and Supabase for authentication and real-time data storage.

## Features

- Secure email/password authentication backed by Supabase.
- Hierarchical page tree with instant page creation from the sidebar.
- Rich text canvas supporting headings, todos, bullet lists, and paragraph blocks.
- Per-block editing controls with inline toolbar and autosave.
- Supabase SQL migration defining pages, blocks, and profile tables with RLS.

## Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env.local` file:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

3. Apply the Supabase migration to your project:

   ```bash
  supabase db push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000) and create pages and blocks.

## Supabase Schema Overview

- `profiles`: synced with Supabase Auth and stores user metadata.
- `pages`: hierarchical pages composed of rich content blocks.
- `blocks`: data-driven representation of editor elements.

All tables are protected by row level security (RLS) policies so users can only access their own data.

## Deployment

The app is ready to deploy on Vercel. Set the Supabase environment variables in your project settings and run:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-232e2fd3
```

The production site will be available at https://agentic-232e2fd3.vercel.app.
