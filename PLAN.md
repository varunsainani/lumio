# Lumio - Build Plan

Lumio is a modern learning platform (LMS). Instructors build courses (sections,
lessons, quizzes); students enroll, learn, track progress, take auto-graded
quizzes, and earn a completion certificate. Includes an AI study assistant and
an AI quiz generator.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (own premium design system, dark mode)
- Drizzle ORM + Neon Postgres (serverless HTTP driver)
- next-intl (EN / ES / PT, cookie locale, no URL prefix)
- jose-signed httpOnly cookie sessions, bcrypt passwords
- LLM provider interface: Groq active, Gemini + Claude switchable (backend only)
- Deployed on Vercel + own Neon database

## Roles
- student, instructor, admin

## Data model
users, categories, courses, sections, lessons, enrollments, lessonProgress,
quizzes, questions, quizAttempts, reviews, certificates.

## Milestones
1. [x] Foundation: schema, DB client, drizzle config, push to Neon
2. [ ] Auth + sessions (roles, demo login per role)
3. [ ] i18n + design system (layout, header, footer, theme + locale switchers)
4. [ ] Public: landing, catalog (search/filter), course detail, auth pages
5. [ ] Student: dashboard, course player, quizzes, certificate, AI assistant
6. [ ] Instructor: course builder, quiz builder (+ AI generate), publish
7. [ ] Admin: users, course moderation, categories, stats
8. [ ] AI provider interface + endpoints
9. [ ] Trilingual demo seed
10. [ ] Deploy to Vercel + Neon, verify live
11. [ ] QA audit + screenshots

## Notes
- Paid courses use a simulated instant-enroll checkout (Stripe is a drop-in via
  the same provider pattern; no live key needed for the demo).
- Video lessons embed hosted video URLs; no paid video host required.
