import "dotenv/config";
import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  certificates,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  questions,
  quizAttempts,
  quizzes,
  reviews,
  sections,
  users,
} from "./schema";
import { hashPassword } from "../lib/auth/password";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../lib/auth/demo";

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

const CATEGORY_DEFS = [
  { slug: "web-development", name: "Web Development", icon: "Code", sortOrder: 1 },
  { slug: "data-science", name: "Data Science", icon: "LineChart", sortOrder: 2 },
  { slug: "design", name: "Design", icon: "Palette", sortOrder: 3 },
  { slug: "business", name: "Business", icon: "Briefcase", sortOrder: 4 },
  { slug: "marketing", name: "Marketing", icon: "Megaphone", sortOrder: 5 },
  {
    slug: "personal-development",
    name: "Personal Development",
    icon: "Sparkles",
    sortOrder: 6,
  },
  { slug: "photography", name: "Photography", icon: "Camera", sortOrder: 7 },
  { slug: "music", name: "Music", icon: "Music", sortOrder: 8 },
];

const INSTRUCTORS = [
  {
    email: "instructor@lumio.app",
    name: "David Okafor",
    headline: "Senior Software Engineer",
    bio: "David has spent over a decade building products at fast-growing startups. He loves turning complex engineering ideas into lessons anyone can follow.",
  },
  {
    email: "elena@lumio.app",
    name: "Elena Rossi",
    headline: "Product Designer",
    bio: "Elena is a product designer who has shipped design systems used by millions. She teaches design as a practical, everyday craft.",
  },
  {
    email: "marcus@lumio.app",
    name: "Marcus Bell",
    headline: "Data Scientist",
    bio: "Marcus works with data every day and believes anyone can learn to think analytically with the right guidance.",
  },
  {
    email: "sofia@lumio.app",
    name: "Sofia Nguyen",
    headline: "Marketing & Growth Lead",
    bio: "Sofia has grown audiences from zero to millions. She shares the frameworks that actually move the needle.",
  },
];

type QuizDef = {
  title: string;
  passing: number;
  questions: [string, string[], number, string][];
};

type CourseDef = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  instructor: string;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  featured: boolean;
  description: string;
  sections: [string, string[]][];
  quiz: QuizDef;
  reviews: [number, string][];
};

const COURSES: CourseDef[] = [
  {
    slug: "modern-web-development-with-react",
    title: "Modern Web Development with React",
    subtitle: "Build fast, interactive web apps with React and modern tooling.",
    category: "web-development",
    instructor: "instructor@lumio.app",
    level: "intermediate",
    price: 4900,
    featured: true,
    description:
      "React has become the standard for building modern user interfaces, and this course gives you a practical, hands-on path from the fundamentals to shipping real applications.\n\nYou will learn how components, state, and data fetching fit together, then apply them by building features you would find in a production app. By the end you will be comfortable starting your own projects with confidence.",
    sections: [
      ["Getting started", ["Why React", "Setting up your environment", "Your first component"]],
      ["Core concepts", ["Props and state", "Handling events", "Lists and keys"]],
      ["Building real apps", ["Fetching data", "Forms and validation", "Deploying your app"]],
    ],
    quiz: {
      title: "React basics quiz",
      passing: 70,
      questions: [
        ["What does JSX let you write?", ["HTML-like syntax in JavaScript", "A new database language", "CSS animations", "A build tool"], 0, "JSX lets you write HTML-like markup directly inside JavaScript."],
        ["Which hook manages local component state?", ["useEffect", "useState", "useMemo", "useRef"], 1, "useState returns a stateful value and a function to update it."],
        ["Why does React need keys in lists?", ["To style elements", "To identify which items changed", "To fetch data", "To cache requests"], 1, "Keys help React identify which items changed, were added, or removed."],
      ],
    },
    reviews: [
      [5, "Exactly what I needed to finally understand React."],
      [5, "Clear, practical, and very well paced."],
      [4, "Great course. Would love even more advanced content."],
    ],
  },
  {
    slug: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    subtitle: "Master the language that powers the web, from scratch.",
    category: "web-development",
    instructor: "instructor@lumio.app",
    level: "beginner",
    price: 0,
    featured: true,
    description:
      "JavaScript runs everywhere, and a solid grasp of the fundamentals is the best investment you can make as a developer.\n\nThis beginner-friendly course walks you through variables, functions, arrays, objects, and the core patterns you will use every single day. No prior experience required.",
    sections: [
      ["The basics", ["Variables and types", "Operators and expressions", "Working with strings"]],
      ["Logic and functions", ["Conditionals", "Loops", "Functions and scope"]],
      ["Data and structure", ["Arrays", "Objects", "Putting it together"]],
    ],
    quiz: {
      title: "JavaScript essentials quiz",
      passing: 70,
      questions: [
        ["Which keyword declares a block-scoped variable?", ["var", "let", "function", "define"], 1, "let declares a block-scoped variable, unlike the older var."],
        ["What does typeof [] return?", ["array", "object", "list", "undefined"], 1, "Arrays are objects in JavaScript, so typeof [] is 'object'."],
        ["How do you write a single-line comment?", ["# comment", "// comment", "<!-- comment -->", "** comment"], 1, "Two forward slashes start a single-line comment in JavaScript."],
      ],
    },
    reviews: [
      [5, "The best free JavaScript course I have found."],
      [5, "Finally things click. Thank you!"],
      [4, "Solid foundations, clearly explained."],
    ],
  },
  {
    slug: "typescript-in-depth",
    title: "TypeScript in Depth",
    subtitle: "Write safer, more maintainable code with static types.",
    category: "web-development",
    instructor: "instructor@lumio.app",
    level: "advanced",
    price: 5900,
    featured: false,
    description:
      "TypeScript adds a powerful type system on top of JavaScript that catches bugs before they ship and makes large codebases a pleasure to work in.\n\nThis course goes beyond the basics into generics, utility types, and the patterns that separate hobby projects from professional code.",
    sections: [
      ["Foundations", ["Why types matter", "Basic types", "Interfaces and types"]],
      ["Going deeper", ["Generics", "Utility types", "Narrowing"]],
      ["In practice", ["Typing APIs", "Working with libraries", "Migration strategies"]],
    ],
    quiz: {
      title: "TypeScript quiz",
      passing: 70,
      questions: [
        ["What is the main benefit of TypeScript?", ["Faster runtime", "Static type checking", "Smaller bundles", "Built-in styling"], 1, "TypeScript catches type errors at compile time, before code runs."],
        ["Which syntax makes a property optional?", ["name!: string", "name?: string", "name*: string", "name: string?"], 1, "A question mark after the property name marks it as optional."],
        ["Generics let you write code that is...", ["always any", "reusable across types", "runtime only", "slower"], 1, "Generics let you write reusable code that works across many types safely."],
      ],
    },
    reviews: [
      [5, "Deep and genuinely useful. My code is cleaner now."],
      [4, "Challenging in a good way."],
    ],
  },
  {
    slug: "ui-ux-design-foundations",
    title: "UI/UX Design Foundations",
    subtitle: "Design interfaces people love to use.",
    category: "design",
    instructor: "elena@lumio.app",
    level: "beginner",
    price: 3900,
    featured: true,
    description:
      "Great design is not decoration, it is how a product works. This course teaches the foundations of user interface and user experience design so you can create products that are clear, usable, and delightful.\n\nYou will learn the principles behind good layout, color, type, and flow, and how to apply them to real screens.",
    sections: [
      ["Design thinking", ["What is UX", "Understanding users", "The design process"]],
      ["Visual craft", ["Layout and spacing", "Color and contrast", "Typography basics"]],
      ["From idea to screen", ["Wireframing", "Prototyping", "Getting feedback"]],
    ],
    quiz: {
      title: "Design foundations quiz",
      passing: 70,
      questions: [
        ["UX design is mainly about...", ["Making things pretty", "How a product works for people", "Choosing fonts", "Writing code"], 1, "UX is about how a product works and feels for the people using it."],
        ["Whitespace in a layout helps to...", ["fill the screen", "improve clarity and focus", "slow loading", "hide content"], 1, "Whitespace improves clarity by giving elements room to breathe."],
        ["A wireframe is best described as...", ["a final design", "a low-fidelity structure", "a color palette", "a font file"], 1, "A wireframe is a low-fidelity sketch of structure and layout."],
      ],
    },
    reviews: [
      [5, "Opened my eyes to what good design really means."],
      [5, "Beautifully taught, like the subject itself."],
      [4, "Loved the practical exercises."],
    ],
  },
  {
    slug: "figma-for-product-teams",
    title: "Figma for Product Teams",
    subtitle: "Design, prototype, and collaborate in Figma like a pro.",
    category: "design",
    instructor: "elena@lumio.app",
    level: "intermediate",
    price: 4500,
    featured: false,
    description:
      "Figma is where modern product design happens. This course takes you from the essentials to advanced workflows used by professional design teams.\n\nYou will learn components, auto layout, and prototyping, plus how to hand off cleanly to developers.",
    sections: [
      ["Getting comfortable", ["The Figma interface", "Frames and shapes", "Text and styles"]],
      ["Scaling your work", ["Components", "Auto layout", "Variants"]],
      ["Collaboration", ["Prototyping", "Developer handoff", "Working with a team"]],
    ],
    quiz: {
      title: "Figma quiz",
      passing: 70,
      questions: [
        ["Components in Figma help you...", ["reuse consistent elements", "write code", "host files", "compress images"], 0, "Components let you reuse consistent elements across your designs."],
        ["Auto layout is used to...", ["animate screens", "arrange elements responsively", "export code", "pick colors"], 1, "Auto layout arranges elements that resize and reflow automatically."],
        ["Prototyping in Figma lets you...", ["link frames into flows", "deploy websites", "manage databases", "edit photos"], 0, "Prototyping links frames together to simulate real user flows."],
      ],
    },
    reviews: [
      [5, "My Figma skills leveled up fast."],
      [4, "Great for working on a real team."],
    ],
  },
  {
    slug: "data-analysis-with-python",
    title: "Data Analysis with Python",
    subtitle: "Turn raw data into clear, confident decisions.",
    category: "data-science",
    instructor: "marcus@lumio.app",
    level: "intermediate",
    price: 5500,
    featured: true,
    description:
      "Data is everywhere, and the ability to analyze it is one of the most valuable skills you can have. This course teaches you to explore, clean, and visualize data using Python and its most popular libraries.\n\nBy the end you will be able to take a messy dataset and produce insights you can act on.",
    sections: [
      ["Foundations", ["Why Python for data", "Working with notebooks", "Your first dataset"]],
      ["Wrangling data", ["Pandas basics", "Cleaning data", "Grouping and aggregating"]],
      ["Insight and visuals", ["Exploratory analysis", "Charts that communicate", "Telling a data story"]],
    ],
    quiz: {
      title: "Data analysis quiz",
      passing: 70,
      questions: [
        ["Which library is central to data analysis in Python?", ["pandas", "flask", "react", "django"], 0, "pandas is the go-to library for working with tabular data in Python."],
        ["A DataFrame is best described as...", ["a chart", "a table of rows and columns", "a database server", "a web page"], 1, "A DataFrame is a table-like structure of rows and columns."],
        ["Exploratory data analysis helps you...", ["deploy models", "understand your data first", "style charts", "write SQL only"], 1, "EDA helps you understand patterns and issues in your data before modeling."],
      ],
    },
    reviews: [
      [5, "I use these skills at work every week now."],
      [5, "Marcus makes data feel approachable."],
      [4, "Very practical and hands on."],
    ],
  },
  {
    slug: "digital-marketing-essentials",
    title: "Digital Marketing Essentials",
    subtitle: "Reach the right people and grow, without guesswork.",
    category: "marketing",
    instructor: "sofia@lumio.app",
    level: "beginner",
    price: 0,
    featured: true,
    description:
      "Marketing is how great products find the people who need them. This course covers the essentials of digital marketing so you can build an audience and grow with intention.\n\nYou will learn the core channels, how they fit together, and how to measure what actually works.",
    sections: [
      ["The big picture", ["What is digital marketing", "Knowing your audience", "The marketing funnel"]],
      ["Core channels", ["Content and SEO", "Social media", "Email marketing"]],
      ["Measure and grow", ["Analytics basics", "Running experiments", "Building a plan"]],
    ],
    quiz: {
      title: "Marketing quiz",
      passing: 70,
      questions: [
        ["The marketing funnel describes...", ["a type of ad", "the journey from awareness to purchase", "a social network", "an email tool"], 1, "The funnel describes the journey from awareness through to purchase."],
        ["SEO stands for...", ["Search Engine Optimization", "Social Engagement Online", "Sales Every Order", "Search Everything Often"], 0, "SEO is Search Engine Optimization, improving visibility in search results."],
        ["The best way to know what works is to...", ["guess", "measure and experiment", "copy competitors", "spend more"], 1, "Measuring results and running experiments tells you what actually works."],
      ],
    },
    reviews: [
      [5, "A fantastic free intro to marketing."],
      [4, "Clear and motivating."],
      [5, "Helped me get my first 1,000 subscribers."],
    ],
  },
  {
    slug: "productivity-and-deep-work",
    title: "Productivity and Deep Work",
    subtitle: "Do more of what matters, with focus and calm.",
    category: "personal-development",
    instructor: "sofia@lumio.app",
    level: "beginner",
    price: 2900,
    featured: false,
    description:
      "In a world full of distractions, the ability to focus is a superpower. This course gives you practical systems for managing your time, attention, and energy.\n\nYou will build habits that help you do your best work without burning out.",
    sections: [
      ["Foundations", ["The cost of distraction", "Understanding focus", "Your ideal day"]],
      ["Systems", ["Planning that works", "Managing tasks", "Beating procrastination"]],
      ["Sustaining it", ["Energy and rest", "Deep work rituals", "Making it stick"]],
    ],
    quiz: {
      title: "Focus quiz",
      passing: 70,
      questions: [
        ["Deep work refers to...", ["multitasking", "focused, distraction-free work", "checking email often", "working late"], 1, "Deep work is focused, distraction-free work on demanding tasks."],
        ["A good way to beat procrastination is to...", ["wait for motivation", "start with a tiny first step", "do everything at once", "ignore the task"], 1, "Starting with a tiny first step lowers the barrier to begin."],
        ["Rest is important because it...", ["wastes time", "restores focus and energy", "slows progress", "is optional"], 1, "Rest restores the focus and energy that deep work depends on."],
      ],
    },
    reviews: [
      [5, "Genuinely changed how I work."],
      [4, "Simple, practical, effective."],
    ],
  },
  {
    slug: "business-strategy-101",
    title: "Business Strategy 101",
    subtitle: "Think clearly about how businesses win.",
    category: "business",
    instructor: "sofia@lumio.app",
    level: "beginner",
    price: 3500,
    featured: false,
    description:
      "Strategy is about making smart choices with limited resources. This course introduces the core ideas behind how businesses create and capture value.\n\nYou will learn frameworks you can apply to your own company, team, or idea.",
    sections: [
      ["Fundamentals", ["What is strategy", "Value and customers", "Competitive advantage"]],
      ["Frameworks", ["Analyzing a market", "Positioning", "Business models"]],
      ["Applying it", ["Making trade-offs", "Executing well", "Reviewing and adapting"]],
    ],
    quiz: {
      title: "Strategy quiz",
      passing: 70,
      questions: [
        ["Strategy is fundamentally about...", ["doing everything", "making clear choices", "spending money", "hiring fast"], 1, "Strategy is about making clear choices about where to focus."],
        ["A competitive advantage is...", ["a bigger office", "something hard for rivals to copy", "a lower price only", "a logo"], 1, "A competitive advantage is something valuable that rivals struggle to copy."],
        ["Positioning is about...", ["your building", "how customers perceive you", "your payroll", "your servers"], 1, "Positioning is how you want customers to perceive you versus alternatives."],
      ],
    },
    reviews: [
      [5, "Made strategy finally make sense."],
      [4, "Great primer for founders."],
    ],
  },
  {
    slug: "photography-basics",
    title: "Photography Basics",
    subtitle: "Take photos you are proud of, with any camera.",
    category: "photography",
    instructor: "elena@lumio.app",
    level: "beginner",
    price: 0,
    featured: false,
    description:
      "You do not need expensive gear to take great photos, you need to understand light, composition, and your camera. This course covers the essentials in a friendly, practical way.\n\nWhether you shoot on a phone or a DSLR, you will start seeing and capturing better images.",
    sections: [
      ["Seeing light", ["How cameras see", "Natural light", "Exposure basics"]],
      ["Composition", ["The rule of thirds", "Framing and balance", "Leading the eye"]],
      ["Finishing", ["Simple editing", "Building a style", "Sharing your work"]],
    ],
    quiz: {
      title: "Photography quiz",
      passing: 70,
      questions: [
        ["Exposure is determined by aperture, shutter speed, and...", ["ISO", "megapixels", "zoom", "the lens cap"], 0, "Exposure is the balance of aperture, shutter speed, and ISO."],
        ["The rule of thirds helps with...", ["battery life", "composition", "file size", "focus speed"], 1, "The rule of thirds is a guide for balanced, engaging composition."],
        ["The best camera for beginners is...", ["the most expensive one", "the one you have with you", "always a DSLR", "a film camera"], 1, "The best camera is the one you have with you and know how to use."],
      ],
    },
    reviews: [
      [5, "My phone photos look so much better now."],
      [5, "Friendly and inspiring."],
    ],
  },
];

function slugParagraph(lessonTitle: string, courseTitle: string): string {
  const t = lessonTitle.toLowerCase();
  return `In this lesson we focus on ${t} as part of ${courseTitle}. You will learn the key ideas, walk through practical examples, and see how this connects to everything else in the course.\n\nTake your time with the examples and try things yourself as you go. A little practice here makes the concepts stick, and sets you up well for the lessons that follow.`;
}

async function run() {
  console.log("Clearing existing data...");
  await db.delete(certificates);
  await db.delete(quizAttempts);
  await db.delete(reviews);
  await db.delete(lessonProgress);
  await db.delete(questions);
  await db.delete(quizzes);
  await db.delete(lessons);
  await db.delete(sections);
  await db.delete(enrollments);
  await db.delete(courses);
  await db.delete(categories);
  await db.delete(users);

  console.log("Seeding categories...");
  const catRows = await db
    .insert(categories)
    .values(CATEGORY_DEFS)
    .returning({ id: categories.id, slug: categories.slug });
  const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

  console.log("Seeding users...");
  const demoHash = await hashPassword(DEMO_PASSWORD);
  const fillerHash = await hashPassword("lumio-demo-filler");

  // Demo accounts
  const demoStudent = DEMO_ACCOUNTS.find((a) => a.role === "student")!;
  const demoAdmin = DEMO_ACCOUNTS.find((a) => a.role === "admin")!;

  const instructorRows = await db
    .insert(users)
    .values(
      INSTRUCTORS.map((i) => ({
        email: i.email,
        passwordHash: i.email === "instructor@lumio.app" ? demoHash : fillerHash,
        name: i.name,
        role: "instructor" as const,
        headline: i.headline,
        bio: i.bio,
      })),
    )
    .returning({ id: users.id, email: users.email });
  const instructorByEmail = new Map(
    instructorRows.map((r) => [r.email, r.id]),
  );

  const [studentRow] = await db
    .insert(users)
    .values({
      email: demoStudent.email,
      passwordHash: demoHash,
      name: demoStudent.name,
      role: "student",
    })
    .returning({ id: users.id });

  await db.insert(users).values({
    email: demoAdmin.email,
    passwordHash: demoHash,
    name: demoAdmin.name,
    role: "admin",
  });

  // Filler students for realistic enrollment and review counts
  const FIRST = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia", "James", "Isabella", "William", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia", "Henry", "Harper", "Alex", "Evelyn", "Mateo", "Abigail", "Leo", "Emily", "Jack", "Ella", "Daniel", "Grace", "Gabriel", "Camila", "Samuel", "Aria", "Carlos", "Sofia", "Diego", "Valentina", "Andre", "Beatriz", "Hugo", "Lucia"];
  const LAST = ["Smith", "Johnson", "Garcia", "Martinez", "Silva", "Santos", "Nguyen", "Kim", "Patel", "Cohen", "Rossi", "Muller", "Costa", "Oliveira", "Pereira", "Fernandez", "Lopez", "Reyes", "Haddad", "Okoro"];
  const fillerValues = [];
  for (let i = 0; i < 60; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    fillerValues.push({
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      passwordHash: fillerHash,
      name: `${first} ${last}`,
      role: "student" as const,
    });
  }
  const fillerRows = await db
    .insert(users)
    .values(fillerValues)
    .returning({ id: users.id });
  const fillerIds = fillerRows.map((r) => r.id);

  const createdCourses: {
    slug: string;
    id: string;
    lessonIds: string[];
  }[] = [];

  let videoCounter = 0;
  for (let ci = 0; ci < COURSES.length; ci++) {
    const def = COURSES[ci];
    console.log(`Seeding course: ${def.title}`);

    const [courseRow] = await db
      .insert(courses)
      .values({
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle,
        description: def.description,
        categoryId: catBySlug.get(def.category) ?? null,
        instructorId: instructorByEmail.get(def.instructor)!,
        level: def.level,
        priceCents: def.price,
        published: true,
        featured: def.featured,
      })
      .returning({ id: courses.id });
    const courseId = courseRow.id;

    const courseLessonIds: string[] = [];
    let lessonIndex = 0;

    for (let si = 0; si < def.sections.length; si++) {
      const [sectionTitle, lessonTitles] = def.sections[si];
      const [sectionRow] = await db
        .insert(sections)
        .values({ courseId, title: sectionTitle, position: si })
        .returning({ id: sections.id });

      const lessonValues = lessonTitles.map((title, li) => {
        const isVideo = lessonIndex % 2 === 0;
        const isPreview = lessonIndex === 0;
        const videoUrl = isVideo
          ? SAMPLE_VIDEOS[videoCounter++ % SAMPLE_VIDEOS.length]
          : null;
        const durationSec = isVideo
          ? 300 + ((lessonIndex * 137) % 600)
          : 180 + ((lessonIndex * 91) % 240);
        lessonIndex++;
        return {
          sectionId: sectionRow.id,
          title,
          type: isVideo ? ("video" as const) : ("text" as const),
          videoUrl,
          content: slugParagraph(title, def.title),
          durationSec,
          position: li,
          isPreview,
        };
      });
      const lessonRows = await db
        .insert(lessons)
        .values(lessonValues)
        .returning({ id: lessons.id });
      lessonRows.forEach((l) => courseLessonIds.push(l.id));
    }

    // Quiz
    const [quizRow] = await db
      .insert(quizzes)
      .values({
        courseId,
        title: def.quiz.title,
        passingScorePct: def.quiz.passing,
        position: 0,
      })
      .returning({ id: quizzes.id });
    await db.insert(questions).values(
      def.quiz.questions.map((q, qi) => ({
        quizId: quizRow.id,
        prompt: q[0],
        options: q[1],
        correctIndex: q[2],
        explanation: q[3],
        position: qi,
      })),
    );

    // Enrollments (a deterministic subset of filler students)
    const enrollCount = 12 + ((ci * 5) % 40);
    const start = (ci * 7) % fillerIds.length;
    const enrolledStudentIds: string[] = [];
    for (let k = 0; k < enrollCount; k++) {
      enrolledStudentIds.push(fillerIds[(start + k) % fillerIds.length]);
    }
    const uniqueEnrolled = Array.from(new Set(enrolledStudentIds));
    await db.insert(enrollments).values(
      uniqueEnrolled.map((uid) => ({ userId: uid, courseId })),
    );

    // Reviews from the first few enrolled students
    await db.insert(reviews).values(
      def.reviews.map((r, ri) => ({
        courseId,
        userId: uniqueEnrolled[ri % uniqueEnrolled.length],
        rating: r[0],
        comment: r[1],
      })),
    );

    createdCourses.push({ slug: def.slug, id: courseId, lessonIds: courseLessonIds });
  }

  // Demo student journey
  console.log("Seeding demo student progress...");
  const studentId = studentRow.id;
  const enrolledSlugs = [
    "javascript-fundamentals",
    "modern-web-development-with-react",
    "ui-ux-design-foundations",
    "data-analysis-with-python",
  ];
  for (const slug of enrolledSlugs) {
    const course = createdCourses.find((c) => c.slug === slug)!;
    await db
      .insert(enrollments)
      .values({ userId: studentId, courseId: course.id })
      .onConflictDoNothing();
  }

  // Complete "JavaScript Fundamentals" fully -> issue a certificate
  const jsCourse = createdCourses.find(
    (c) => c.slug === "javascript-fundamentals",
  )!;
  await db.insert(lessonProgress).values(
    jsCourse.lessonIds.map((lid) => ({ userId: studentId, lessonId: lid })),
  );
  await db
    .update(enrollments)
    .set({ completedAt: new Date() })
    .where(
      and(
        eq(enrollments.userId, studentId),
        eq(enrollments.courseId, jsCourse.id),
      ),
    );
  await db.insert(certificates).values({
    userId: studentId,
    courseId: jsCourse.id,
    code: `LUM-${randomBytes(5).toString("hex").toUpperCase()}`,
  });

  // Partial progress on the React course (first 3 lessons)
  const reactCourse = createdCourses.find(
    (c) => c.slug === "modern-web-development-with-react",
  )!;
  await db.insert(lessonProgress).values(
    reactCourse.lessonIds
      .slice(0, 3)
      .map((lid) => ({ userId: studentId, lessonId: lid })),
  );

  console.log("Done seeding.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
