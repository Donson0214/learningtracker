<script setup lang="ts">
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/vue/24/outline";
import { onBeforeUnmount, onMounted, ref } from "vue";
import AuthOverlay from "../components/AuthOverlay.vue";
import { useTheme } from "@/shared/theme/useTheme";

const heroVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const heroPosterUrl =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80";
const heroImageUrl =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80";
const collageImageTop =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80";
const collageImageBottom =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80";

const authOpen = ref(false);
const authMode = ref<"login" | "register">("login");
const statsRef = ref<HTMLElement | null>(null);
const statValues = ref<number[]>([]);
let revealObserver: IntersectionObserver | null = null;
let statsObserver: IntersectionObserver | null = null;
let statsAnimated = false;
const { theme, toggleTheme } = useTheme();

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Courses", id: "courses" },
  { label: "Organizations", id: "organizations" },
  { label: "Contact", id: "contact" },
];

const highlights = [
  {
    title: "Global competition",
    description: "Benchmark progress across cohorts and learning tracks.",
    icon: GlobeAltIcon,
  },
  {
    title: "Smart analytics",
    description: "Visualize outcomes, time spent, and completion streaks.",
    icon: ChartBarIcon,
  },
  {
    title: "Best institution",
    description: "Curated learning paths built for modern teams.",
    icon: AcademicCapIcon,
  },
];

const featureCards = [
  {
    title: "Structured learning paths",
    description: "Templates, milestones, and weekly goals that keep teams aligned.",
    icon: SparklesIcon,
  },
  {
    title: "Cohort-level insights",
    description: "Track engagement by cohort and surface at-risk learners early.",
    icon: UserGroupIcon,
  },
  {
    title: "Guided accountability",
    description: "Smart reminders and nudges that help learners stay consistent.",
    icon: BoltIcon,
  },
];

const stats = [
  { label: "Active learners", value: 24000, suffix: "+" },
  { label: "Courses completed", value: 180000, suffix: "+" },
  { label: "Avg. weekly hours", value: 6, suffix: "h" },
  { label: "Partner teams", value: 130, suffix: "+" },
];

const courseCards = [
  {
    title: "Learning Strategy",
    level: "Beginner",
    lessons: 14,
    duration: "4 weeks",
  },
  {
    title: "Applied Productivity",
    level: "Intermediate",
    lessons: 18,
    duration: "6 weeks",
  },
  {
    title: "Leadership Basics",
    level: "Advanced",
    lessons: 22,
    duration: "8 weeks",
  },
];

const screenshots = [
  {
    title: "Progress overview",
    description: "Follow streaks, modules, and completion in one place.",
  },
  {
    title: "Course builder",
    description: "Design modules and lessons with clear sequencing.",
  },
  {
    title: "Team insights",
    description: "Spot engagement dips and celebrate wins quickly.",
  },
];

const testimonials = [
  {
    quote:
      "Trackademy finally gave us a clear view of learning outcomes without overwhelming the team.",
    name: "Alyssa Vega",
    role: "Learning Lead, Nova",
  },
  {
    quote:
      "We doubled completion rates after rolling out structured plans and weekly nudges.",
    name: "Jon Reese",
    role: "People Ops, Summit",
  },
  {
    quote:
      "The dashboard makes it easy to see who is excelling and who needs support.",
    name: "Camila Ortiz",
    role: "Program Manager, Lift",
  },
];

const openAuth = (mode: "login" | "register" = "login") => {
  authMode.value = mode;
  authOpen.value = true;
};

const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const animateStats = () => {
  if (statsAnimated) {
    return;
  }
  statsAnimated = true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    statValues.value = stats.map((stat) => stat.value);
    return;
  }
  const duration = 1400;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    statValues.value = stats.map((stat) =>
      Math.round(stat.value * progress)
    );
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

onMounted(() => {
  statValues.value = stats.map(() => 0);

  const revealTargets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]")
  );
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => revealObserver?.observe(el));
  }

  if (statsRef.value) {
    statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          animateStats();
          statsObserver?.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    statsObserver.observe(statsRef.value);
  }
});

onBeforeUnmount(() => {
  revealObserver?.disconnect();
  statsObserver?.disconnect();
});
</script>

<template>
  <div class="landing min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
    <div class="relative overflow-hidden">
      <div class="absolute inset-0">
        <video
          class="h-full w-full object-cover opacity-80"
          :src="heroVideoUrl"
          :poster="heroPosterUrl"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-950"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]"></div>
      </div>

      <div class="relative z-10">
        <div class="hidden md:flex items-center justify-between px-6 py-3 text-xs text-white/70">
          <div class="flex items-center gap-4">
            <span>+01 2345 6789</span>
            <span>hello@trackademy.com</span>
          </div>
          <div class="flex items-center gap-3 text-white/60">
            <span>Facebook</span>
            <span>Twitter</span>
            <span>LinkedIn</span>
          </div>
        </div>

        <header
          class="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl
                 bg-slate-950/40 border-b border-white/10"
        >
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-white/90 text-slate-950 flex items-center justify-center text-sm font-semibold">
              T
            </div>
            <div>
              <p class="text-sm font-semibold tracking-wide text-white">Trackademy</p>
              <p class="text-[11px] uppercase tracking-[0.2em] text-white/60">Learning OS</p>
            </div>
          </div>

          <nav class="hidden lg:flex items-center gap-6 text-sm text-white/70">
            <a
              v-for="item in navItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="hover:text-white transition"
              @click.prevent="scrollToSection(item.id)"
            >
              {{ item.label }}
            </a>
          </nav>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="hidden md:inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70
                     hover:text-white hover:border-white/40 transition"
              @click="openAuth('login')"
            >
              Log in
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-4 py-2 text-xs font-semibold
                     hover:-translate-y-0.5 transition"
              @click="openAuth('register')"
            >
              Apply Today
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>
        </header>

        <section id="home" class="section-anchor relative px-6 pb-16 pt-14 lg:pt-20">
          <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="space-y-6 text-white">
              <div
                class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]"
              >
                <SparklesIcon class="h-4 w-4" />
                modern learning
              </div>
              <h1 class="text-4xl font-semibold leading-tight md:text-5xl">
                Develop your greatest ability with Trackademy.
              </h1>
              <p class="text-sm text-white/80 md:text-base">
                Launch learning programs with structured paths, live insights, and accountability
                built into every milestone. Apply now for curated learning journeys.
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:-translate-y-0.5 transition"
                  @click="openAuth('register')"
                >
                  Apply Today
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm text-white
                         hover:bg-white/10 transition"
                  @click="openAuth('login')"
                >
                  <PlayCircleIcon class="h-5 w-5" />
                  Explore Courses
                </button>
              </div>
              <div class="flex flex-wrap gap-6 text-xs text-white/70">
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="h-4 w-4" />
                  Structured learning plans
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="h-4 w-4" />
                  Weekly progress snapshots
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="h-4 w-4" />
                  Completion-focused insights
                </div>
              </div>
            </div>

            <div class="relative">
              <div class="absolute -right-6 -top-10 hidden lg:block">
                <div class="floating-card rounded-3xl border border-white/10 bg-white/10 p-4 text-white/80 shadow-2xl">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                      <VideoCameraIcon class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-white">Live sessions</p>
                      <p class="text-xs text-white/60">Weekly mentor check-ins</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-[32px] border border-white/10 bg-white/10 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div class="overflow-hidden rounded-[28px] bg-white/10 p-3">
                  <img
                    :src="heroImageUrl"
                    alt="Learning community"
                    class="h-72 w-full rounded-[20px] object-cover"
                  />
                </div>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p class="text-xs uppercase tracking-[0.2em] text-white/60">Active paths</p>
                    <p class="text-2xl font-semibold text-white">48</p>
                  </div>
                  <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p class="text-xs uppercase tracking-[0.2em] text-white/60">Weekly hours</p>
                    <p class="text-2xl font-semibold text-white">6.4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mx-auto mt-10 grid max-w-6xl gap-6 rounded-3xl border border-white/10 bg-white/10 p-6 text-white/80 md:grid-cols-3">
            <div
              v-for="(item, index) in highlights"
              :key="item.title"
              class="flex gap-3"
              :style="{ '--reveal-delay': `${index * 120}ms` }"
              data-reveal
            >
              <div class="mt-1 h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-white">{{ item.title }}</p>
                <p class="text-xs text-white/60">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <main class="relative z-10">
      <section id="organizations" class="section-anchor px-6 py-16" data-reveal>
        <div class="mx-auto max-w-6xl">
          <div class="mb-10 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
                Organizations
              </p>
              <h2 class="text-3xl font-semibold">
                Empower every organization to learn together
              </h2>
            </div>
            <button
              type="button"
              class="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600
                     hover:text-slate-900 hover:border-slate-400 dark:border-white/20 dark:text-white/60 dark:hover:text-white"
              @click="openAuth('register')"
            >
              Get Started
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <button
              v-for="(card, index) in featureCards"
              :key="card.title"
              type="button"
              class="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition
                     hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
              :style="{ '--reveal-delay': `${index * 120}ms` }"
              data-reveal
              @click="openAuth('register')"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white
                       transition group-hover:scale-105 dark:bg-white dark:text-slate-900"
              >
                <component :is="card.icon" class="h-5 w-5" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ card.title }}
              </h3>
              <p class="mt-2 text-sm text-slate-500 dark:text-white/60">
                {{ card.description }}
              </p>
            </button>
          </div>
        </div>
      </section>

      <section ref="statsRef" class="px-6 pb-16" data-reveal>
        <div class="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-slate-900">
          <div class="grid gap-8 md:grid-cols-4">
            <div v-for="(stat, index) in stats" :key="stat.label">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-white/50">
                {{ stat.label }}
              </p>
              <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                {{ statValues[index] }}{{ stat.suffix }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" class="section-anchor px-6 py-16" data-reveal>
        <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div class="space-y-6">
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
              About Trackademy
            </p>
            <h2 class="text-3xl font-semibold">
              Leading the way for a sustainable future
            </h2>
            <p class="text-sm text-slate-500 dark:text-white/70">
              We design programs that adapt to real schedules and deliver measurable outcomes.
              Every learner gets a clear path, accountability nudges, and the support they need.
            </p>
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 transition dark:bg-white dark:text-slate-900"
                @click="openAuth('register')"
              >
                More About Us
              </button>
              <button
                type="button"
                class="rounded-full border border-slate-200 px-5 py-3 text-sm text-slate-500 hover:text-slate-900 transition
                       dark:border-white/20 dark:text-white/60 dark:hover:text-white"
                @click="openAuth('login')"
              >
                Meet the team
              </button>
            </div>
          </div>
          <div class="relative">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="overflow-hidden rounded-3xl">
                <img :src="collageImageTop" alt="Learners" class="h-full w-full object-cover" />
              </div>
              <div class="overflow-hidden rounded-3xl">
                <img :src="collageImageBottom" alt="Graduates" class="h-full w-full object-cover" />
              </div>
            </div>
            <div class="absolute -bottom-6 left-6 hidden lg:block">
              <div class="rounded-2xl bg-white px-4 py-3 shadow-xl dark:bg-slate-900">
                <p class="text-xs text-slate-500 dark:text-white/60">Ranked #1 in learner outcomes</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-white">50+ partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" class="section-anchor px-6 py-16" data-reveal>
        <div class="mx-auto max-w-6xl">
          <div class="mb-10 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
                Popular courses
              </p>
              <h2 class="text-3xl font-semibold">Popular courses preview</h2>
            </div>
            <button
              type="button"
              class="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600
                     hover:text-slate-900 hover:border-slate-400 dark:border-white/20 dark:text-white/60 dark:hover:text-white"
              @click="openAuth('register')"
            >
              Explore catalog
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <button
              v-for="(course, index) in courseCards"
              :key="course.title"
              type="button"
              class="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition
                     hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
              :style="{ '--reveal-delay': `${index * 120}ms` }"
              data-reveal
              @click="openAuth('register')"
            >
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-white/60">
                {{ course.level }}
              </p>
              <h3 class="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                {{ course.title }}
              </h3>
              <div class="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                <span>{{ course.lessons }} lessons</span>
                <span>{{ course.duration }}</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section class="px-6 py-16" data-reveal>
        <div class="mx-auto max-w-6xl">
          <div class="mb-10 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
                Product screenshots
              </p>
              <h2 class="text-3xl font-semibold">Product snapshots</h2>
            </div>
            <button
              type="button"
              class="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600
                     hover:text-slate-900 hover:border-slate-400 dark:border-white/20 dark:text-white/60 dark:hover:text-white"
              @click="openAuth('login')"
            >
              View live demo
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div
              v-for="(shot, index) in screenshots"
              :key="shot.title"
              class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
              :style="{ '--reveal-delay': `${index * 120}ms` }"
              data-reveal
            >
              <div class="h-36 rounded-2xl bg-gradient-to-br from-slate-200 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"></div>
              <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{{ shot.title }}</h3>
              <p class="mt-2 text-sm text-slate-500 dark:text-white/60">{{ shot.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6 py-16" data-reveal>
        <div class="mx-auto max-w-6xl">
          <div class="mb-10 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/60">
                Testimonials
              </p>
              <h2 class="text-3xl font-semibold">Loved by learning teams</h2>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <div
              v-for="(testimonial, index) in testimonials"
              :key="testimonial.name"
              class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
              :style="{ '--reveal-delay': `${index * 120}ms` }"
              data-reveal
            >
              <p class="text-sm text-slate-600 dark:text-white/70">
                "{{ testimonial.quote }}"
              </p>
              <div class="mt-4">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ testimonial.name }}
                </p>
                <p class="text-xs text-slate-400 dark:text-white/50">
                  {{ testimonial.role }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6 pb-20 pt-10" data-reveal>
        <div class="mx-auto max-w-6xl rounded-[36px] bg-slate-900 px-8 py-12 text-white dark:bg-white dark:text-slate-900">
          <div class="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-white/60 dark:text-slate-500">
                Final CTA
              </p>
              <h2 class="mt-3 text-3xl font-semibold">
                Ready to launch your learning journey?
              </h2>
              <p class="mt-3 text-sm text-white/70 dark:text-slate-600">
                Join Trackademy to guide every learner with clarity, momentum, and accountability.
              </p>
            </div>
            <div class="flex flex-col gap-3">
              <button
                type="button"
                class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:-translate-y-0.5 transition
                       dark:bg-slate-900 dark:text-white"
                @click="openAuth('register')"
              >
                Create your account
              </button>
              <button
                type="button"
                class="rounded-full border border-white/20 px-6 py-3 text-sm text-white/70 hover:text-white transition
                       dark:border-slate-200 dark:text-slate-600 dark:hover:text-slate-900"
                @click="openAuth('login')"
              >
                Sign in to continue
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer
      id="contact"
      class="section-anchor border-t border-slate-200 px-6 py-10 text-sm text-slate-500 dark:border-white/10 dark:text-white/60"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-base font-semibold text-slate-900 dark:text-white">Trackademy</p>
          <p class="text-xs uppercase tracking-[0.2em]">Learning tracker platform</p>
          <p class="mt-2 text-xs">
            Contact: hello@trackademy.com • +01 2345 6789
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <button type="button" class="hover:text-slate-900 dark:hover:text-white" @click="openAuth('login')">
            Privacy
          </button>
          <button type="button" class="hover:text-slate-900 dark:hover:text-white" @click="openAuth('login')">
            Terms
          </button>
          <button type="button" class="hover:text-slate-900 dark:hover:text-white" @click="openAuth('login')">
            Support
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs hover:border-slate-400 hover:text-slate-900
                   dark:border-white/20 dark:hover:border-white/40 dark:hover:text-white"
            @click="toggleTheme"
          >
            Theme: {{ theme }}
          </button>
        </div>
      </div>
    </footer>

    <AuthOverlay
      :open="authOpen"
      :mode="authMode"
      @close="authOpen = false"
      @update:mode="authMode = $event"
    />
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  overflow-x: hidden;
}

:global(html) {
  scroll-behavior: smooth;
}

.section-anchor {
  scroll-margin-top: 96px;
}

.floating-card {
  animation: float-slow 8s ease-in-out infinite;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  transition-delay: var(--reveal-delay, 0ms);
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .floating-card {
    animation: none;
  }
}
</style>
