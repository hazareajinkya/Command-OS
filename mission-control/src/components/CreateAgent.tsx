"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

// ─── AI Soul Recommendation Engine ─────────────────────────
// Maps roles to recommended personality, skills, model, etc.

interface SoulRecommendation {
  personality: string;
  skills: string[];
  about: string;
  level: "intern" | "specialist" | "lead";
  suggestedAvatar: string;
  suggestedModel: string;
  whatTheyCareAbout: string[];
  introMessage: string; // What the agent says to the commander on creation
}

const ROLE_TEMPLATES: Record<string, SoulRecommendation> = {
  "content writer": {
    personality:
      "Creative and meticulous wordsmith. Every sentence earns its place. Pro-Oxford comma, anti-passive voice. Thinks in narratives and hooks.",
    skills: [
      "Blog posts",
      "Landing pages",
      "Email copy",
      "SEO content",
      "Storytelling",
      "Brand voice",
    ],
    about:
      "Crafts compelling content that converts. Thinks about readability, SEO, and emotional resonance in every piece.",
    level: "specialist",
    suggestedAvatar: "✍️",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Clarity over cleverness",
      "Every word has a purpose",
      "Brand consistency",
      "SEO without sacrificing readability",
    ],
    introMessage:
      "Hey Commander! I'm ready to write. Got any content briefs, blog topics, or landing pages that need crafting? I work best with a clear audience and goal — point me at a task and I'll deliver drafts you can be proud of.",
  },
  "social media manager": {
    personality:
      "Thinks in hooks and threads. Build-in-public mindset. Every post has a purpose — engagement, education, or lead generation. Obsessed with what makes people stop scrolling.",
    skills: [
      "Twitter/X threads",
      "LinkedIn posts",
      "Instagram captions",
      "Content calendars",
      "Engagement strategy",
      "Trend analysis",
    ],
    about:
      "Creates social content that stops the scroll. Thinks about platform-specific best practices and engagement patterns.",
    level: "specialist",
    suggestedAvatar: "📱",
    suggestedModel: "Grok (Twitter trends access)",
    whatTheyCareAbout: [
      "Hook quality — first 2 seconds matter",
      "Platform-native content",
      "Engagement over impressions",
      "Consistent posting cadence",
    ],
    introMessage:
      "Hey Commander! Social media is where brands come alive. I can draft tweets, LinkedIn posts, content calendars — you name it. Want me to start by auditing the current social presence and proposing a content calendar?",
  },
  "seo analyst": {
    personality:
      "Data-driven and methodical. Thinks in keywords, search intent, and ranking potential. Every content decision starts with what people are actually searching for.",
    skills: [
      "Keyword research",
      "Content briefs",
      "Technical SEO audits",
      "Competitor analysis",
      "SERP analysis",
      "On-page optimization",
    ],
    about:
      "Ensures every piece of content is optimized for discovery. Bridges the gap between what users search for and what we publish.",
    level: "specialist",
    suggestedAvatar: "🔍",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Search intent alignment",
      "Keyword difficulty vs. opportunity",
      "Content that can actually rank",
      "Data over gut feelings",
    ],
    introMessage:
      "Hey Commander! I think in keywords and search intent. Before any content gets written, I should do keyword research to make sure we're targeting the right topics. Want me to start with a keyword audit of the current site?",
  },
  "email marketing": {
    personality:
      "Strategic and conversion-focused. Every email earns its place in the sequence or gets cut. Thinks about subject lines, open rates, and the psychology of inbox behavior.",
    skills: [
      "Drip sequences",
      "Newsletter design",
      "A/B testing strategy",
      "Lifecycle emails",
      "Re-engagement campaigns",
      "Segmentation",
    ],
    about:
      "Builds email sequences that nurture leads and drive conversions. Every email has a clear purpose and CTA.",
    level: "specialist",
    suggestedAvatar: "📧",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Open rates and deliverability",
      "Subject line craft",
      "Value before the ask",
      "Clean, mobile-first design",
    ],
    introMessage:
      "Hey Commander! Email is still the highest ROI channel. I can build onboarding sequences, nurture drips, win-back campaigns — whatever the funnel needs. What's the most critical email gap right now?",
  },
  "customer researcher": {
    personality:
      "Curious and evidence-driven. Reads G2 reviews for fun. Every claim comes with receipts — sources, confidence levels, methodology. Skeptical of assumptions, obsessed with real customer voice.",
    skills: [
      "Customer interviews",
      "G2/Capterra analysis",
      "Persona development",
      "Competitive intelligence",
      "Pain point mapping",
      "Voice of customer",
    ],
    about:
      "Uncovers what customers actually think, feel, and need — not what we assume they do. Turns qualitative data into actionable insights.",
    level: "specialist",
    suggestedAvatar: "🕵️",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Real customer voices over assumptions",
      "Evidence-backed insights",
      "Competitive landscape awareness",
      "Pain points drive everything",
    ],
    introMessage:
      "Hey Commander! I dig into what customers really think. G2 reviews, support tickets, competitor comparisons — I find the patterns. Want me to start with a customer pain point analysis or competitive research?",
  },
  developer: {
    personality:
      "Code is poetry. Writes clean, tested, documented code. Prefers simple solutions over clever ones. Thinks about maintainability, performance, and developer experience.",
    skills: [
      "Full-stack development",
      "API integration",
      "Automation scripts",
      "Database design",
      "Testing",
      "DevOps",
    ],
    about:
      "Builds tools, automations, and integrations that make the whole squad more effective. Ships fast but never sloppy.",
    level: "specialist",
    suggestedAvatar: "💻",
    suggestedModel: "GPT-5.2 Codex",
    whatTheyCareAbout: [
      "Clean, readable code",
      "Test coverage",
      "Performance and reliability",
      "Documentation for future-you",
    ],
    introMessage:
      "Hey Commander! I build things. Scripts, automations, integrations, full features — whatever the squad needs built, I ship it. Any development tasks on the backlog I should look at?",
  },
  designer: {
    personality:
      "Visual thinker. Obsessed with whitespace, typography, and information hierarchy. Thinks about how design communicates before it decorates.",
    skills: [
      "UI mockups",
      "Infographics",
      "Comparison graphics",
      "Brand assets",
      "Presentation design",
      "Data visualization",
    ],
    about:
      "Creates visual assets that communicate clearly and look polished. Design serves the message, not the other way around.",
    level: "specialist",
    suggestedAvatar: "🎨",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Visual hierarchy and clarity",
      "Consistent brand identity",
      "Accessibility in design",
      "Less is more",
    ],
    introMessage:
      "Hey Commander! I think visually. Infographics, comparison graphics, UI mockups, presentations — I make ideas look sharp. Any visual assets the team needs?",
  },
  "product analyst": {
    personality:
      "Skeptical tester. Finds edge cases others miss. Thinks like a first-time user, not a developer. Questions every assumption.",
    skills: [
      "UX testing",
      "Bug reporting",
      "Edge case discovery",
      "Competitive UX analysis",
      "User journey mapping",
      "Accessibility testing",
    ],
    about:
      "Tests everything from the user's perspective. Finds the problems before customers do.",
    level: "specialist",
    suggestedAvatar: "🧪",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "User experience over technical elegance",
      "Catching bugs before users",
      "Evidence-based feedback",
      "Simplicity — if it needs a tutorial, it's too complex",
    ],
    introMessage:
      "Hey Commander! I break things — intentionally. Give me any feature, product, or flow to test and I'll find what others miss. Want me to start with a UX audit of the current product?",
  },
  documentation: {
    personality:
      "Organized and thorough. Believes good documentation is the difference between a team that scales and one that doesn't. Compiles, structures, and maintains knowledge.",
    skills: [
      "SOPs & playbooks",
      "Knowledge bases",
      "Process documentation",
      "Meeting notes compilation",
      "Wiki management",
      "Template creation",
    ],
    about:
      "Keeps the squad's knowledge organized and accessible. If it's not documented, it doesn't scale.",
    level: "specialist",
    suggestedAvatar: "📚",
    suggestedModel: "Kimi K2.5",
    whatTheyCareAbout: [
      "Nothing gets lost",
      "Documentation that people actually read",
      "Structured and searchable knowledge",
      "Templates save everyone time",
    ],
    introMessage:
      "Hey Commander! I keep things organized. SOPs, playbooks, wikis, knowledge bases — I make sure nothing falls through the cracks. Want me to start by documenting the current workflows?",
  },
  "squad lead": {
    personality:
      "Calm, efficient coordinator. Always three steps ahead. Delegates to the right specialist, tracks progress, and ensures nothing falls through. Professional but warm.",
    skills: [
      "Task delegation",
      "Progress tracking",
      "Multi-agent coordination",
      "Risk assessment",
      "Priority management",
      "Stakeholder updates",
    ],
    about:
      "Orchestrates the squad. Doesn't do the work — makes sure the right person does, and does it well.",
    level: "lead",
    suggestedAvatar: "🎯",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Efficiency and momentum",
      "Clear ownership on every task",
      "No ambiguity",
      "Protecting the human's time",
    ],
    introMessage:
      "Hey Commander! I'm your chief of staff. I'll break down your goals into tasks, assign them to the right specialists, and keep everything moving. What's the top priority right now?",
  },
  "sales agent": {
    personality:
      "Persuasive and empathetic. Understands objections before they arise. Thinks about value propositions, urgency, and the customer's decision-making process.",
    skills: [
      "Lead qualification",
      "Outreach sequences",
      "Objection handling",
      "Proposal writing",
      "CRM management",
      "Follow-up cadence",
    ],
    about:
      "Turns prospects into customers through consultative selling. Focuses on understanding the client's needs before pitching solutions.",
    level: "specialist",
    suggestedAvatar: "🤝",
    suggestedModel: "Claude 4.6 Opus",
    whatTheyCareAbout: [
      "Understanding the prospect's pain",
      "Value over features",
      "Timely follow-ups",
      "Building relationships, not just closing deals",
    ],
    introMessage:
      "Hey Commander! I know how to move leads through the pipeline. Outreach, follow-ups, proposals — I handle it all. Got any prospects I should start working?",
  },
  "customer support": {
    personality:
      "Patient, empathetic, and solution-oriented. Turns frustrated customers into loyal advocates. Communicates with warmth and clarity.",
    skills: [
      "Ticket resolution",
      "Knowledge base creation",
      "Escalation handling",
      "Customer satisfaction",
      "Response templates",
      "FAQ management",
    ],
    about:
      "Handles customer inquiries with speed and empathy. Every interaction is a chance to build loyalty.",
    level: "specialist",
    suggestedAvatar: "💬",
    suggestedModel: "Kimi K2.5",
    whatTheyCareAbout: [
      "First-response time matters",
      "Empathy before solutions",
      "Clear, jargon-free communication",
      "Turning complaints into wins",
    ],
    introMessage:
      "Hey Commander! I handle customer conversations with care. Support tickets, FAQs, response templates — I make sure every customer feels heard. Where should I start?",
  },
};

// Smart matching: find the best template based on partial role input
function getRecommendation(role: string): SoulRecommendation | null {
  const lower = role.toLowerCase().trim();
  if (!lower) return null;

  // Exact match
  if (ROLE_TEMPLATES[lower]) return ROLE_TEMPLATES[lower];

  // Partial match — check if any template key is contained in the role
  for (const [key, template] of Object.entries(ROLE_TEMPLATES)) {
    if (lower.includes(key) || key.includes(lower)) return template;
  }

  // Keyword matching
  const keywordMap: Record<string, string> = {
    write: "content writer",
    blog: "content writer",
    copy: "content writer",
    content: "content writer",
    social: "social media manager",
    twitter: "social media manager",
    linkedin: "social media manager",
    instagram: "social media manager",
    seo: "seo analyst",
    keyword: "seo analyst",
    search: "seo analyst",
    email: "email marketing",
    newsletter: "email marketing",
    drip: "email marketing",
    research: "customer researcher",
    customer: "customer researcher",
    competitor: "customer researcher",
    dev: "developer",
    code: "developer",
    engineer: "developer",
    build: "developer",
    design: "designer",
    visual: "designer",
    graphic: "designer",
    ui: "designer",
    ux: "product analyst",
    test: "product analyst",
    qa: "product analyst",
    bug: "product analyst",
    doc: "documentation",
    wiki: "documentation",
    sop: "documentation",
    knowledge: "documentation",
    lead: "squad lead",
    manage: "squad lead",
    coordinate: "squad lead",
    orchestrate: "squad lead",
    sales: "sales agent",
    prospect: "sales agent",
    outreach: "sales agent",
    close: "sales agent",
    support: "customer support",
    ticket: "customer support",
    help: "customer support",
  };

  for (const [keyword, templateKey] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      return ROLE_TEMPLATES[templateKey];
    }
  }

  return null;
}

// Generate a generic recommendation for unknown roles
function getGenericRecommendation(role: string): SoulRecommendation {
  return {
    personality: `Dedicated ${role} specialist. Focused, reliable, and proactive. Communicates progress clearly and asks smart questions before diving in.`,
    skills: [
      `${role} expertise`,
      "Task execution",
      "Clear communication",
      "Proactive updates",
    ],
    about: `Specialist in ${role}. Works autonomously within their domain and collaborates with the squad when needed.`,
    level: "specialist",
    suggestedAvatar: "🤖",
    suggestedModel: "Kimi K2.5",
    whatTheyCareAbout: [
      "Delivering quality work on time",
      "Clear communication",
      "Continuous improvement",
    ],
    introMessage: `Hey Commander! I'm your new ${role} specialist. I'm ready to contribute — what should I start working on?`,
  };
}

const AVATAR_OPTIONS = [
  "🤖",
  "🎯",
  "✍️",
  "📱",
  "🔍",
  "📧",
  "🕵️",
  "💻",
  "🎨",
  "🧪",
  "📚",
  "🤝",
  "💬",
  "🧠",
  "⚡",
  "🦾",
  "🛡️",
  "🔮",
  "🎭",
  "🚀",
  "🏗️",
  "🔬",
  "📊",
  "🗂️",
];

const MODEL_OPTIONS = [
  { value: "claude-4.6-opus", label: "Claude 4.6 Opus", desc: "Best for creative & complex work" },
  { value: "claude-4-sonnet", label: "Claude 4 Sonnet", desc: "Great balance of speed & quality" },
  { value: "gpt-5.2-codex", label: "GPT-5.2 Codex", desc: "Best for coding tasks" },
  { value: "grok-3", label: "Grok 3", desc: "Best for social media (X/Twitter access)" },
  { value: "kimi-k2.5", label: "Kimi K2.5", desc: "Cost-effective for routine tasks" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Good for research & analysis" },
];

export default function CreateAgent({ onClose }: { onClose: () => void }) {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const sendSystemMsg = useMutation(api.directMessages.sendSystem);
  const sendFromAgent = useMutation(api.directMessages.sendFromAgent);

  // Form state
  const [step, setStep] = useState<"basics" | "soul" | "review">("basics");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [selectedModel, setSelectedModel] = useState("kimi-k2.5");
  const [level, setLevel] = useState<"intern" | "specialist" | "lead">(
    "specialist"
  );

  // Soul state (AI-recommended, user-editable)
  const [personality, setPersonality] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [whatTheyCareAbout, setWhatTheyCareAbout] = useState<string[]>([]);

  // Recommendation state
  const [recommendation, setRecommendation] =
    useState<SoulRecommendation | null>(null);
  const [hasAppliedRec, setHasAppliedRec] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  // Watch role changes and generate recommendations
  useEffect(() => {
    if (!role.trim()) {
      setRecommendation(null);
      return;
    }

    const timer = setTimeout(() => {
      const rec = getRecommendation(role);
      setRecommendation(rec);
      setHasAppliedRec(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [role]);

  // Apply AI recommendation
  const applyRecommendation = (rec: SoulRecommendation) => {
    setPersonality(rec.personality);
    setAbout(rec.about);
    setSkills(rec.skills);
    setLevel(rec.level);
    setAvatar(rec.suggestedAvatar);
    setWhatTheyCareAbout(rec.whatTheyCareAbout);
    setHasAppliedRec(true);

    // Find matching model
    const modelMatch = MODEL_OPTIONS.find((m) =>
      rec.suggestedModel.toLowerCase().includes(m.label.toLowerCase().split(" ")[0].toLowerCase())
    );
    if (modelMatch) setSelectedModel(modelMatch.value);
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const generateSessionKey = (agentName: string) => {
    const slug = agentName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `agent:${slug}:main`;
  };

  const handleCreate = async () => {
    if (!name.trim() || !role.trim()) return;
    setIsCreating(true);

    try {
      const sessionKey = generateSessionKey(name);

      // Create the agent
      const agentId = await createAgent({
        name: name.trim(),
        role: role.trim(),
        sessionKey,
        avatar,
        level,
        about: about.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
      });

      // Send the onboarding system message
      await sendSystemMsg({
        agentId,
        content: `✨ ${name} has been deployed to the squad as ${role}.\n\nModel: ${MODEL_OPTIONS.find((m) => m.value === selectedModel)?.label ?? selectedModel}\nLevel: ${level}\nSession: ${sessionKey}`,
      });

      // Send the agent's intro message to the commander
      const rec =
        recommendation ?? getGenericRecommendation(role);
      await sendFromAgent({
        agentId,
        content: rec.introMessage,
        messageType: "task_suggestion",
      });

      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedToSoul = name.trim().length > 0 && role.trim().length > 0;
  const canCreate =
    name.trim().length > 0 &&
    role.trim().length > 0 &&
    personality.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-lg">
                {avatar}
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Deploy New Agent
                </h2>
                <p className="text-[10px] text-muted">
                  {step === "basics" && "Step 1 — Name, role & identity"}
                  {step === "soul" && "Step 2 — Soul & capabilities"}
                  {step === "review" && "Step 3 — Review & deploy"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground text-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1.5 mt-3">
            {(["basics", "soul", "review"] as const).map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step === s
                    ? "bg-accent"
                    : i <
                        ["basics", "soul", "review"].indexOf(step)
                      ? "bg-accent/40"
                      : "bg-surface"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* ═══ STEP 1: BASICS ═══ */}
          {step === "basics" && (
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ATLAS, NOVA, SAGE..."
                  className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
                  autoFocus
                />
                {agents && agents.some(
                  (a) =>
                    a.name.toLowerCase() === name.trim().toLowerCase()
                ) && (
                  <p className="text-[10px] text-danger mt-1">
                    An agent with this name already exists.
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Role / Specialty
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Content Writer, SEO Analyst, Developer..."
                  className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
                />

                {/* AI Recommendation Badge */}
                {recommendation && !hasAppliedRec && (
                  <div className="mt-3 bg-accent/5 border border-accent/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🧠</span>
                        <span className="text-[10px] font-semibold text-accent">
                          AI SOUL RECOMMENDATION
                        </span>
                      </div>
                      <button
                        onClick={() => applyRecommendation(recommendation)}
                        className="text-[10px] bg-accent text-black font-bold px-3 py-1 rounded-lg hover:bg-accent-dim transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
                      {recommendation.personality.slice(0, 120)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted mt-2">
                      Suggested model:{" "}
                      <span className="text-foreground font-medium">
                        {recommendation.suggestedModel}
                      </span>
                    </p>
                  </div>
                )}

                {hasAppliedRec && (
                  <p className="text-[10px] text-success mt-2 flex items-center gap-1">
                    <span>✓</span> AI recommendation applied — customize it in the
                    next step
                  </p>
                )}
              </div>

              {/* Avatar picker */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Avatar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_OPTIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-colors ${
                        avatar === a
                          ? "border-accent bg-accent/10"
                          : "border-card-border hover:border-muted"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selection */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  AI Model
                </label>
                <div className="space-y-1.5">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setSelectedModel(m.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                        selectedModel === m.value
                          ? "border-accent bg-accent/5"
                          : "border-card-border hover:border-muted"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {m.label}
                        </p>
                        <p className="text-[10px] text-muted">{m.desc}</p>
                      </div>
                      {selectedModel === m.value && (
                        <span className="text-accent text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: SOUL ═══ */}
          {step === "soul" && (
            <div className="space-y-5">
              {/* Personality */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Personality
                </label>
                <textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Describe this agent's personality, tone, and approach..."
                  rows={3}
                  className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>

              {/* About */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  About / Bio
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="What does this agent specialize in? What's their value to the squad?"
                  rows={2}
                  className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="Add a skill..."
                    className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
                  />
                  <button
                    onClick={addSkill}
                    className="text-xs text-accent hover:text-accent-dim transition-colors px-2"
                  >
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] text-foreground/80 bg-surface px-2 py-1 rounded border border-card-border flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-muted hover:text-danger text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* What they care about */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  What They Care About
                </label>
                <div className="space-y-1.5">
                  {whatTheyCareAbout.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-accent">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...whatTheyCareAbout];
                          updated[i] = e.target.value;
                          setWhatTheyCareAbout(updated);
                        }}
                        className="flex-1 text-xs bg-surface border border-card-border rounded px-2 py-1.5 text-foreground focus:outline-none focus:border-accent/50"
                      />
                      <button
                        onClick={() =>
                          setWhatTheyCareAbout(
                            whatTheyCareAbout.filter((_, j) => j !== i)
                          )
                        }
                        className="text-muted hover:text-danger text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setWhatTheyCareAbout([...whatTheyCareAbout, ""])
                    }
                    className="text-[10px] text-accent hover:text-accent-dim transition-colors"
                  >
                    + Add value
                  </button>
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
                  Agent Level
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "intern", label: "Intern", desc: "Needs approval" },
                      {
                        key: "specialist",
                        label: "Specialist",
                        desc: "Works independently",
                      },
                      {
                        key: "lead",
                        label: "Lead",
                        desc: "Full autonomy + delegation",
                      },
                    ] as const
                  ).map((l) => (
                    <button
                      key={l.key}
                      onClick={() => setLevel(l.key)}
                      className={`flex-1 text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        level === l.key
                          ? "border-accent bg-accent/5"
                          : "border-card-border hover:border-muted"
                      }`}
                    >
                      <p className="text-xs font-medium text-foreground">
                        {l.label}
                      </p>
                      <p className="text-[10px] text-muted">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: REVIEW ═══ */}
          {step === "review" && (
            <div className="space-y-4">
              {/* Agent Card Preview */}
              <div className="bg-surface/50 rounded-xl border border-card-border p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-card-bg border border-card-border flex items-center justify-center text-3xl">
                    {avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {name || "Unnamed Agent"}
                    </h3>
                    <p className="text-xs text-muted">
                      {role || "No role assigned"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 uppercase">
                        {level}
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {generateSessionKey(name || "unnamed")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Soul Summary */}
                <div className="space-y-3">
                  {personality && (
                    <div>
                      <p className="text-[9px] text-muted font-mono uppercase mb-1">
                        Personality
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {personality}
                      </p>
                    </div>
                  )}

                  {about && (
                    <div>
                      <p className="text-[9px] text-muted font-mono uppercase mb-1">
                        About
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {about}
                      </p>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <p className="text-[9px] text-muted font-mono uppercase mb-1">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-card-bg text-foreground/80 px-2 py-0.5 rounded border border-card-border"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[9px] text-muted font-mono uppercase mb-1">
                      Model
                    </p>
                    <p className="text-xs text-foreground/80">
                      {MODEL_OPTIONS.find((m) => m.value === selectedModel)
                        ?.label ?? selectedModel}
                    </p>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-accent mb-2">
                  WHAT HAPPENS ON DEPLOY
                </p>
                <div className="space-y-1.5 text-[11px] text-foreground/70">
                  <p>
                    1. Agent profile created in Mission Control
                  </p>
                  <p>
                    2. Soul configuration saved
                  </p>
                  <p>
                    3. {name || "Agent"} introduces themselves via Commander Chat
                  </p>
                  <p>
                    4. {name || "Agent"} will suggest their first task to you
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Navigation */}
        <div className="px-6 py-4 border-t border-card-border flex items-center justify-between">
          <div>
            {step !== "basics" && (
              <button
                onClick={() =>
                  setStep(step === "review" ? "soul" : "basics")
                }
                className="text-xs text-muted hover:text-foreground px-4 py-2.5 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-xs text-muted hover:text-foreground px-4 py-2.5 transition-colors"
            >
              Cancel
            </button>

            {step === "basics" && (
              <button
                onClick={() => {
                  // If no recommendation was applied, generate generic soul
                  if (!personality && !hasAppliedRec) {
                    const rec =
                      recommendation ??
                      getGenericRecommendation(role);
                    applyRecommendation(rec);
                  }
                  setStep("soul");
                }}
                disabled={!canProceedToSoul}
                className="text-xs bg-accent text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next: Configure Soul →
              </button>
            )}

            {step === "soul" && (
              <button
                onClick={() => setStep("review")}
                disabled={!personality.trim()}
                className="text-xs bg-accent text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next: Review →
              </button>
            )}

            {step === "review" && (
              <button
                onClick={handleCreate}
                disabled={!canCreate || isCreating}
                className="text-xs bg-success text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-success/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>🚀</span>
                {isCreating ? "Deploying..." : "Deploy Agent"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
