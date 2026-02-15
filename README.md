This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Required environment variables

Set these in your Vercel project (Project Settings → Environment Variables):

- `DATABASE_URL` – Postgres connection string (Neon or Vercel Postgres)
- `GROQ_API_KEY` – API key for Groq chat completions
- `GROQ_MODEL` – optional, defaults to `llama-3.1-8b-instant`

### Database schema

Provision a Postgres database (e.g., Neon) and apply the schema in `lib/db/schema.sql`.

### Notes about caching and runtime

- All auth and chat API routes are marked as dynamic to avoid caching issues on serverless.
- Cookies are set with `secure: true` in production for session management.

### Build & output

- Build command: `npm run build`
- Output directory: `.next` (auto-detected by Vercel)

Check out the official [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
