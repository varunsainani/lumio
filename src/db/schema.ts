import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---- Enums ----
export const roleEnum = pgEnum("role", ["student", "instructor", "admin"]);
export const levelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "text"]);

// ---- Users ----
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("student"),
  locale: text("locale").notNull().default("en"),
  avatarUrl: text("avatar_url"),
  headline: text("headline"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---- Categories ----
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"), // lucide icon name
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---- Courses ----
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull().default(""),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  level: levelEnum("level").notNull().default("beginner"),
  language: text("language").notNull().default("en"),
  priceCents: integer("price_cents").notNull().default(0),
  thumbnailUrl: text("thumbnail_url"),
  published: boolean("published").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---- Sections ----
export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
});

// ---- Lessons ----
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: lessonTypeEnum("type").notNull().default("video"),
  videoUrl: text("video_url"),
  content: text("content"),
  durationSec: integer("duration_sec").notNull().default(0),
  position: integer("position").notNull().default(0),
  isPreview: boolean("is_preview").notNull().default(false),
});

// ---- Enrollments ----
export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [unique().on(t.userId, t.courseId)],
);

// ---- Lesson progress ----
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.lessonId)],
);

// ---- Quizzes ----
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  passingScorePct: integer("passing_score_pct").notNull().default(70),
  position: integer("position").notNull().default(0),
});

// ---- Questions ----
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  position: integer("position").notNull().default(0),
});

// ---- Quiz attempts ----
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  scorePct: integer("score_pct").notNull(),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").$type<number[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---- Reviews ----
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.courseId, t.userId)],
);

// ---- Certificates ----
export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.courseId)],
);

// ---- Relations ----
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  reviews: many(reviews),
  certificates: many(certificates),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  sections: many(sections),
  enrollments: many(enrollments),
  reviews: many(reviews),
  quizzes: many(quizzes),
  certificates: many(certificates),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, {
    fields: [lessons.sectionId],
    references: [sections.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

// ---- Inferred types ----
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type Level = (typeof levelEnum.enumValues)[number];
