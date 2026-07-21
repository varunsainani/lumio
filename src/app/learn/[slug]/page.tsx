import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getCourseDetail, getEnrollment } from "@/lib/data/course-detail";
import { getCompletedLessonIds } from "@/lib/data/learning";
import { CoursePlayer } from "@/components/course-player";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const course = await getCourseDetail(slug);
  if (!course) notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const completed = await getCompletedLessonIds(user.id, course.id);

  const data = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    sections: course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        videoUrl: l.videoUrl,
        content: l.content,
        durationSec: l.durationSec,
      })),
    })),
    quizzes: course.quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      passingScorePct: q.passingScorePct,
      questions: q.questions.map((qq) => ({
        id: qq.id,
        prompt: qq.prompt,
        options: qq.options,
        explanation: qq.explanation,
      })),
    })),
  };

  return <CoursePlayer course={data} completedLessonIds={completed} />;
}
