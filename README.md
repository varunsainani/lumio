# Lumio

A modern learning platform (LMS). Instructors build courses from sections,
lessons, and quizzes. Students browse a catalog, enroll, learn at their own
pace, take auto-graded quizzes, track progress, and earn a completion
certificate. Includes an AI study assistant and an AI quiz generator.

Full stack, multilingual (English, Spanish, Portuguese), with a one-click demo
login for each role.

## Features

**Students**
- Browse and search the course catalog by category and level
- Enroll (free or simulated paid checkout) and learn in a distraction-free player
- Video and text lessons, mark-complete, live progress tracking
- Auto-graded quizzes with instant scoring and explanations
- Completion certificate with a shareable verification code
- AI study assistant for questions about the current lesson

**Instructors**
- Course builder: sections, lessons (video or rich text), reordering
- Quiz builder with an AI question generator
- Publish and unpublish, track enrolled students and progress

**Admin**
- Manage users and roles, moderate and feature courses
- Manage categories, view platform statistics

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with a custom design system and dark mode
- Drizzle ORM + Neon Postgres (serverless HTTP driver)
- next-intl for EN / ES / PT (cookie based locale, no URL prefix)
- jose signed httpOnly cookie sessions, bcrypt password hashing
- LLM provider interface: Groq active, Google Gemini and Anthropic Claude
  switchable through a single environment variable

## Getting started

Requirements: Node 20+, a Neon (or any Postgres) database.

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and the LLM keys
npm run db:push        # create the tables
npm run db:seed        # load demo courses, quizzes, and demo users
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres pooled connection string |
| `DATABASE_URL_UNPOOLED` | Direct connection, used for migrations |
| `SESSION_SECRET` | 64 char hex secret for signing session cookies |
| `LLM_PROVIDER` | `groq`, `gemini`, or `claude` |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | Keys for the active provider |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push the Drizzle schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

Deployed on Vercel with a Neon Postgres database. Environment variables are
persisted on the Vercel project so redeploys keep the database connection.

## License

MIT
