"use client";

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const AGENTS = [
  {
    name: "JARVIS",
    role: "Executive Coordinator",
    desc: "Triages every task, delegates to the right specialist, and keeps your entire squad aligned — your strategic right hand.",
    gradient: "from-blue-500 to-cyan-400",
    avatar: "/agents/jarvis.png",
  },
  {
    name: "IRIS",
    role: "Graphic Designer",
    desc: "Creates stunning visuals, brand assets, and UI mockups on demand. No briefs lost, no deadlines missed.",
    gradient: "from-violet-500 to-blue-500",
    avatar: "/agents/iris.png",
  },
  {
    name: "LORA",
    role: "Social Media Head",
    desc: "Crafts viral content, manages campaigns, and grows your audience across every platform automatically.",
    gradient: "from-blue-500 to-indigo-500",
    avatar: "/agents/lora.png",
  },
  {
    name: "REXX",
    role: "Full-Stack Developer",
    desc: "Ships code, builds APIs, and automates infrastructure. Your tireless engineering backbone that never sleeps.",
    gradient: "from-cyan-500 to-blue-600",
    avatar: "/agents/rexx.png",
  },
  {
    name: "JIM",
    role: "Sales Lead",
    desc: "Finds prospects, nurtures leads, and closes deals around the clock. Your pipeline runs 24/7.",
    gradient: "from-blue-600 to-blue-400",
    avatar: "/agents/jim.png",
  },
];

const STAT_ICONS: Record<string, React.ReactNode> = {
  bolt: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  cog: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  trend: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STATS = [
  { value: 1000, suffix: "+", label: "Tasks Completed", iconKey: "bolt" },
  { value: 50, suffix: "+", label: "Roles Automated", iconKey: "cog" },
  { value: 85, suffix: "%", label: "Faster Execution", iconKey: "trend" },
  { value: 24, suffix: "/7", label: "Always On", iconKey: "clock" },
];

const FAQS = [
  {
    q: "What exactly is Command OS?",
    a: "Command OS is an AI-powered workforce operating system. It deploys autonomous, specialized agents — each with their own personality, memory, and expertise — that coordinate through a real-time dashboard called Mission Control. Think of it as your fully staffed team, ready from day one.",
  },
  {
    q: "How do the agents coordinate with each other?",
    a: "All agents share a real-time database and communicate through Mission Control. When one agent completes work, others are instantly notified and can pick up dependent tasks. JARVIS, your Executive Coordinator, manages delegation and keeps everything aligned — like a CTO that never sleeps.",
  },
  {
    q: "How is Command OS different from ChatGPT or other AI tools?",
    a: "Command OS isn't a chatbot. Your agents work continuously, track tasks, send updates, and operate like real team members. They don't wait for prompts — they execute autonomously with persistent memory across sessions. Each agent has its own personality, skills, and domain expertise.",
  },
  {
    q: "Do I need technical experience to use agents?",
    a: "No. Deploying an agent is as simple as clicking 'Deploy.' Each agent comes pre-trained for its role with a full personality and skill set, so you can operate like a full team on day one. The Mission Control dashboard makes management intuitive.",
  },
  {
    q: "Can I customize agents and add more as I grow?",
    a: "Absolutely. Every agent's role, skills, and responsibilities are fully customizable. You can add or remove agents anytime, choose which AI model each one runs on (Claude, GPT, Gemini, Kimi, etc.), compare pricing per model, and track cost per agent in real time. Start with 3 agents and scale to 20+ as your business grows.",
  },
  {
    q: "How do I track what each agent costs?",
    a: "Mission Control includes built-in cost tracking. You see real-time spend per agent, per task, and per AI model — including token usage, dollar cost, and ROI metrics. Compare different models side-by-side to find the best balance of quality and price for each role.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We used to spend hours coordinating between design, content, and sales. Now our entire workflow — content, outreach, reporting — runs live and connected. Command OS keeps every moving part in sync.",
    name: "Sergio Walker",
    title: "Operations Director, Atlas Labs",
  },
  {
    quote:
      "I've tried most AI tools, but Command OS is the first one that actually feels alive. My Agents talk to each other, refine outcomes, and adapt faster than my human team ever could.",
    name: "Jane Jay",
    title: "Freelancer & Consultant",
  },
  {
    quote:
      "Before Command OS, I was juggling 6 different tools and trying to keep up with client demands. Now my agents handle everything from reporting to follow-ups. It's like having a full team without the overhead.",
    name: "Marcus Chen",
    title: "Startup Founder, NextGen AI",
  },
  {
    quote:
      "The autonomous coordination blew my mind. I set up a design task and within minutes, JARVIS had delegated it to IRIS, who produced mockups while LORA was already drafting the social campaign around it.",
    name: "Priya Sharma",
    title: "Creative Director, DesignLab",
  },
];

const INTEGRATIONS = [
  "Convex",
  "Claude",
  "Vercel",
  "Telegram",
  "OpenRouter",
  "GitHub",
  "Slack",
  "Discord",
  "Notion",
  "Linear",
  "Figma",
  "Zapier",
];

const MILESTONES = [
  {
    title: "Squad Deployed",
    desc: "5 autonomous agents active within minutes of setup.",
    tag: "Minute 1",
  },
  {
    title: "First Tasks Done",
    desc: "Tasks triaged, assigned, and executed automatically.",
    tag: "Hour 1",
  },
  {
    title: "Full Pipeline",
    desc: "Design to deployment — all coordinated through one dashboard.",
    tag: "Day 1",
  },
  {
    title: "Scale Unlocked",
    desc: "Add new agents as you grow. No interviews required.",
    tag: "Week 1",
  },
];

const MOTIV_LINES: { text: string; type: "soft" | "bold" | "accent" }[] = [
  { text: "You said you needed a dev team.", type: "soft" },
  { text: "You said you needed a designer.", type: "soft" },
  { text: "You said you needed a sales team.", type: "soft" },
  { text: "You said you needed time.", type: "soft" },
  { text: "No you didn\u2019t.", type: "bold" },
  { text: "You needed a Squad.", type: "accent" },
  { text: "Now you have one.", type: "bold" },
  { text: "What\u2019s your excuse?", type: "bold" },
];

const MOTIV_THRESHOLDS = [0.04, 0.14, 0.24, 0.34, 0.50, 0.58, 0.66, 0.78];

const TWEET_CARDS = [
  {
    name: "Sam Altman",
    handle: "@sama",
    avatar: "/avatars/sama.jpg",
    quote:
      "\u201CThe hardest thing for me to learn was that the market does not care about effort or struggle, only output.\u201D",
    pos: "top-[12%] right-[2%] md:right-[6%]",
    threshold: 0.06,
    float: "landing-float",
  },
  {
    name: "Brian Chesky",
    handle: "@bchesky",
    avatar: "/avatars/bchesky.jpg",
    quote:
      "\u201CThe depths of loneliness I experienced as a CEO are difficult to put into words.\u201D",
    pos: "top-[30%] left-[1%] md:left-[4%]",
    threshold: 0.20,
    float: "landing-float-reverse",
  },
  {
    name: "Elon Musk",
    handle: "@elonmusk",
    avatar: "/avatars/elonmusk.jpg",
    quote:
      "\u201CProduction takes >10,000 people & hurts like hell until the gigantic cybernetic collective runs smoothly.\u201D",
    pos: "bottom-[38%] right-[1%] md:right-[5%]",
    threshold: 0.40,
    float: "landing-float",
  },
  {
    name: "Marc Andreessen",
    handle: "@pmarca",
    avatar: "/avatars/pmarca.jpg",
    quote:
      "\u201CAll of the great founders I\u2019ve known work 80+ hours/week, especially in the first decade.\u201D",
    pos: "bottom-[22%] left-[1%] md:left-[5%]",
    threshold: 0.54,
    float: "landing-float-reverse",
  },
  {
    name: "Alexis Ohanian",
    handle: "@alexisohanian",
    avatar: "/avatars/alexisohanian.jpg",
    quote:
      "\u201CYour #1 as a founder is to prove that your idea has demand. If you can\u2019t figure out how to do that without funding, you\u2019re not ready.\u201D",
    pos: "bottom-[6%] right-[3%] md:right-[8%]",
    threshold: 0.68,
    float: "landing-float",
  },
];

/* ═══════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, visible } = useInView(0.08);

  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </section>
  );
}

function AnimatedCounter({
  end,
  suffix = "",
  inView,
}: {
  end: number;
  suffix?: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    let startTime: number;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

function MotivationalSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(
    () => new Array(MOTIV_LINES.length).fill(false),
  );
  const [tweetRevealed, setTweetRevealed] = useState<boolean[]>(
    () => new Array(TWEET_CARDS.length).fill(false),
  );

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollable = sectionRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

      setRevealed((prev) => {
        const next = [...prev];
        let changed = false;
        for (let i = 0; i < MOTIV_THRESHOLDS.length; i++) {
          if (!next[i] && progress >= MOTIV_THRESHOLDS[i]) {
            next[i] = true;
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      setTweetRevealed((prev) => {
        const next = [...prev];
        let changed = false;
        for (let i = 0; i < TWEET_CARDS.length; i++) {
          if (!next[i] && progress >= TWEET_CARDS[i].threshold) {
            next[i] = true;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "280vh" }}>
      <div className="sticky top-0 h-dvh flex items-center justify-center overflow-hidden">
        {/* Sky gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-100/80 to-white" />

        {/* Cloud-like blurs */}
        <div className="absolute top-[8%] left-[5%] w-80 h-32 bg-white/80 rounded-full blur-3xl" />
        <div className="absolute top-[5%] right-[8%] w-72 h-28 bg-white/90 rounded-full blur-3xl" />
        <div className="absolute bottom-[12%] left-[12%] w-96 h-36 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-[18%] right-[6%] w-80 h-28 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute top-[45%] left-[25%] w-64 h-24 bg-sky-50/80 rounded-full blur-3xl" />
        <div className="absolute top-[55%] right-[20%] w-56 h-20 bg-sky-50/60 rounded-full blur-3xl" />

        {/* Edge fades for seamless blending */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-[1]" />

        {/* Text lines */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          {MOTIV_LINES.map((line, i) => {
            const visible = revealed[i];
            const isSoft = line.type === "soft";
            const isAccent = line.type === "accent";

            return (
              <p
                key={i}
                className={`transition-all duration-700 ease-out ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                } ${
                  isSoft
                    ? "font-display text-xl sm:text-2xl md:text-[2.6rem] text-slate-400 font-normal italic leading-snug mb-2 md:mb-3"
                    : "font-[family-name:var(--font-geist-sans)] text-2xl sm:text-3xl md:text-[3.4rem] font-black leading-tight mb-1 md:mb-2 tracking-tight"
                } ${
                  isAccent
                    ? "text-sky-500"
                    : !isSoft
                      ? "text-slate-900"
                      : ""
                }`}
              >
                {line.text}
              </p>
            );
          })}
        </div>

        {/* Floating tweet cards */}
        {TWEET_CARDS.map((tweet, i) => {
          const visible = tweetRevealed[i];
          return (
            <div
              key={i}
              className={`absolute ${tweet.pos} ${tweet.float} max-w-[220px] xl:max-w-[240px] hidden lg:block transition-all duration-700 ease-out ${
                visible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4"
              }`}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/30 p-4 border border-slate-100/60">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={tweet.avatar}
                      alt={tweet.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">
                        {tweet.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tweet.handle}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-slate-300 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {tweet.quote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function CommandOSLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const statsSection = useInView(0.3);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="landing-page min-h-screen bg-white text-slate-900" style={{ overflowX: "clip" }}>
      {/* ═══════════════════════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-sky-100/70 glass shadow-md shadow-slate-200/30"
            : "bg-sky-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/site" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">
              Command<span className="text-blue-500">OS</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#agents"
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Agents
            </a>
            <a
              href="#features"
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all"
            >
              View Live Demo
            </a>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden text-slate-900 p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white/95 glass border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
            <a
              href="#agents"
              onClick={() => setMobileMenu(false)}
              className="text-slate-500 hover:text-slate-900 text-sm py-2"
            >
              Agents
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenu(false)}
              className="text-slate-500 hover:text-slate-900 text-sm py-2"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenu(false)}
              className="text-slate-500 hover:text-slate-900 text-sm py-2"
            >
              FAQ
            </a>
            <a
              href="/"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold text-center mt-2"
            >
              View Live Demo
            </a>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-sky-100 pt-[80px] px-3 md:px-5 pb-8">
        <div className="relative rounded-[2.5rem] overflow-hidden h-[calc(100svh-4.5rem)] min-h-[420px] max-h-[82vh]">
          {/* Video as the full hero background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(1.02) contrast(1.05)" }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-transparent pointer-events-none" />

          {/* Content overlaid on the top portion */}
          <div className="absolute inset-x-0 top-0 z-10 text-center px-6 pt-6 sm:pt-10 md:pt-14">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-5 py-2 mb-4 md:mb-5 landing-fade-in backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <span className="text-white text-sm font-medium">
                No hiring. No payroll. No limits.
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-3 md:mb-4 landing-fade-in-up"
              style={{ textShadow: "0 2px 30px rgba(0,0,0,0.25)" }}
            >
              Your Team.
              <br />
              Your Command.
            </h1>

            <p
              className="text-sm md:text-base text-white/90 max-w-md mx-auto mb-5 md:mb-6 leading-relaxed landing-fade-in-up landing-delay-2"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.2)" }}
            >
              Build your AI squad. Full control from day one.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto landing-fade-in-up landing-delay-3">
              <input
                type="email"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:flex-1 bg-white/20 border border-white/30 rounded-full px-5 py-2.5 text-white placeholder-white/60 text-sm focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
              />
              <button className="w-full sm:w-auto bg-white text-blue-600 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-all shadow-lg shadow-black/10 cursor-pointer whitespace-nowrap">
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Rotating brand names — infinite flow */}
          <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden py-4 bg-gradient-to-t from-black/15 to-transparent">
            <div className="flex landing-marquee whitespace-nowrap will-change-transform">
              {[
                ...Array(4).fill([
                  "Convex",
                  "Claude",
                  "Vercel",
                  "Telegram",
                  "OpenRouter",
                  "GitHub",
                  "Slack",
                  "Notion",
                ]).flat(),
              ].map((name, i) => (
                <span
                  key={i}
                  className="text-slate-400/90 text-sm font-medium tracking-wide mx-6 md:mx-8 shrink-0"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          AGENTS / FEATURES
          ═══════════════════════════════════════════════════════ */}
      <Section id="agents" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Your Squad
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 leading-tight">
              Your New Team.
              <br />
              <span className="text-slate-400">Fully Customizable.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Define your own roles, skills, and responsibilities. Add or remove
              agents anytime. These are just examples — build the squad{" "}
              <span className="text-slate-900 font-semibold">you</span> need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60 transition-all duration-500 cursor-default"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.08] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  <div className={`absolute bottom-3 left-5 w-2 h-8 rounded-full bg-gradient-to-b ${agent.gradient} opacity-80`} />
                </div>

                <div className="px-7 pb-7 pt-2">
                  <div className="flex items-center gap-2.5 mb-3">
                    <h3 className="font-bold text-slate-900 text-xl">
                      {agent.name}
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                      {agent.role}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {agent.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FULL CONTROL
          ═══════════════════════════════════════════════════════ */}
      <Section id="customize" className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Full Control
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 leading-tight">
              Your workforce, your rules.
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Every aspect of your AI squad is configurable. Customize roles,
              track spending, compare AI models, and scale on your terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Custom Roles & Skills",
                desc: "Define what each agent specializes in — marketing, support, development, finance, or any role your business needs.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
              },
              {
                title: "Add & Remove Agents",
                desc: "Scale your team up or down instantly. Deploy a new specialist in minutes. No interviews, no offboarding paperwork.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                title: "Cost Tracking Per Agent",
                desc: "See exactly what each agent costs in real time. Track token usage, model spend, and ROI per task and per agent.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                title: "Compare AI Models & Pricing",
                desc: "Choose between Claude, GPT, Gemini, Kimi, and more. Compare pricing and performance to find the best fit for each role.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
              },
              {
                title: "Custom Responsibilities",
                desc: "Set specific tasks, domains, and boundaries for each agent. Full autonomy with precise guardrails you define.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" /></svg>,
              },
              {
                title: "Usage Analytics",
                desc: "Monitor performance, completion rates, cost breakdowns, and output quality across your entire squad from one dashboard.",
                svg: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 text-blue-600">
                  {feature.svg}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          MOTIVATIONAL — scroll-driven reveal
          ═══════════════════════════════════════════════════════ */}
      <MotivationalSection />

      {/* ═══════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 bg-white">
        <div
          className="max-w-7xl mx-auto px-6"
          ref={statsSection.ref}
        >
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Stats
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Backed by momentum.
              <br />
              <span className="text-slate-400">Built for operators.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200/50 text-white">
                  {STAT_ICONS[stat.iconKey]}
                </div>
                <p className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    inView={statsSection.visible}
                  />
                </p>
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          INTELLIGENCE / AUTOMATION
          ═══════════════════════════════════════════════════════ */}
      <Section id="features" className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                Real-Time Coordination
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Autonomous agents.
                <br />
                Synchronized execution.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-4">
                Your agents don&apos;t wait for commands — they think, act, and
                coordinate in real time. Every task, message, and update flows
                through Mission Control, keeping your entire squad aligned.
              </p>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                When one agent completes work, the rest adapt instantly —
                creating a continuous, self-improving workflow that never stalls.
              </p>

              <a
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 mb-8"
              >
                View Live Demo
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>

              <div className="flex flex-wrap gap-3">
                {["Synchronized", "Continuous", "Adaptive", "Connected"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600 font-medium"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-blue-900 px-5 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="text-white/40 text-xs ml-3 font-mono">
                    Mission Control
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Expert Floors — Agent Activity</span>
                    <span className="text-blue-500">$0.42 today</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">
                        JARVIS
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Triaged 5 new leads &rarr; JIM
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">I</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">IRIS</p>
                      <p className="text-[11px] text-slate-500">
                        Created before/after gallery for hardwood install
                      </p>
                    </div>
                    <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                      Done
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">LORA</p>
                      <p className="text-[11px] text-slate-500">
                        Posted flooring promo on Instagram &amp; Facebook
                      </p>
                    </div>
                    <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                      Done
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">REXX</p>
                      <p className="text-[11px] text-slate-500">
                        Built online estimate form for website
                      </p>
                    </div>
                    <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                      Working
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">JIM</p>
                      <p className="text-[11px] text-slate-500">
                        Qualified 3 leads, booked 2 estimates
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-cyan-100 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          INTEGRATIONS
          ═══════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Integrated Tools
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 leading-tight">
              Your workflow stays the same.
              <br />
              <span className="text-slate-400">Your team evolves.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed">
              Command OS agents work across your entire stack — inside every app
              and workspace you use. They read context, execute tasks, sync
              data, and follow through automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {["Delegation", "Monitoring", "Reporting", "Automation"].map(
              (tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 border border-blue-100 rounded-full px-5 py-2.5 text-sm text-blue-700 font-semibold"
                >
                  {tag}
                </span>
              ),
            )}
          </div>

          <div className="relative overflow-hidden py-6">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="flex landing-marquee">
              {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex-shrink-0 mx-3 px-8 py-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  <span className="text-slate-700 text-sm font-semibold whitespace-nowrap">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          GROWTH
          ═══════════════════════════════════════════════════════ */}
      <Section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600" />
        <div className="absolute inset-0 hero-grid opacity-20" />

        <div
          className="absolute bottom-0 left-0 right-0 h-[60%] opacity-20"
          style={{
            background:
              "linear-gradient(to top right, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              With Command OS
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Scale faster. Ship more.
              <br />
              <span className="text-blue-300">Sleep better.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map((m, i) => (
              <div
                key={m.title}
                className="group"
                style={{ marginTop: `${(3 - i) * 24}px` }}
              >
                <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.1] hover:bg-white/[0.12] hover:border-blue-400/30 transition-all duration-500">
                  <span className="inline-block text-xs text-blue-300 bg-blue-400/10 px-3 py-1 rounded-full font-semibold mb-3">
                    {m.tag}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {m.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Testimonials
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Loved by operators.
              <br />
              <span className="text-slate-400">Trusted by builders.</span>
            </h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[340px] md:w-[400px] snap-center bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
              >
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-slate-400 text-xs">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <Section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-600" />
        <div className="absolute inset-0 hero-grid opacity-10" />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] landing-glow"
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.1] border border-white/[0.15] rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
            <span className="text-white/80 text-sm font-medium">
              No hiring. No payroll. No limits.
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
            Stop Hiring.
            <br />
            Start Commanding.
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Deploy your AI squad and operate like a full team without hiring
            one.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full text-base font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/30 hover:shadow-2xl"
          >
            View Live Demo
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY
          ═══════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Community
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Stay in the loop
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">
                X / Twitter
              </h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Stay updated on new features and discover how others are using
                Command OS.
              </p>
              <a
                href="#"
                className="inline-block border border-slate-200 rounded-full px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Follow us
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md shadow-blue-200/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">
                Telegram
              </h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Tips, tutorials, and direct access to the Command OS community.
              </p>
              <a
                href="#"
                className="inline-block border border-slate-200 rounded-full px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Join Channel
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <Section id="faq" className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                FAQ
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
                Still have questions?
                <br />
                <span className="text-slate-400">Good operators do.</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Your Agents coordinate tasks, manage execution, and automate
                reporting. This section covers how they work, what they handle,
                and what to expect.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer hover:bg-blue-50/30 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-sm md:text-base pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        openFaq === i
                          ? "bg-blue-600 text-white rotate-45"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-slate-500 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <Section className="relative py-28 md:py-36 overflow-hidden bg-white">
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 rounded-t-[60px]"
          style={{
            background:
              "linear-gradient(to top, rgba(219,234,254,0.6), transparent)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-5">
            You don&apos;t need a team
            <br />
            to reach the top.
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            You&apos;ve seen how your Command OS squad plans, thinks, and acts
            together — now it&apos;s your turn to lead.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-300/30 hover:shadow-2xl"
          >
            See It in Action
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="bg-blue-950 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                  Command<span className="text-blue-400">OS</span>
                </span>
              </div>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">
                Let your agents coordinate, communicate, and execute tasks from
                strategy to delivery so you can stay focused on what matters.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/[0.06] border border-white/[0.1] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/[0.06] border border-white/[0.1] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">
                Pages
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="/site"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="/"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Dashboard
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">
                Information
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="#"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-white/40 text-sm hover:text-white transition-colors"
                >
                  Terms of use
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-8 text-center">
            <p className="text-white/25 text-sm">
              &copy; 2026 Command OS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
