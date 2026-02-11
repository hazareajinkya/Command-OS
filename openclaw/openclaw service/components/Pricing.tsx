const basicPlan = [
  "Pre-built customised AI agents",
  "Mission Control dashboard",
  "Telegram integration",
  "Personal onboarding",
  "Basic support",
  "10 skills pre-installed",
];

const proPlan = [
  "Customised unlimited AI agents",
  "Customisable Mission Control dashboard",
  "Telegram integration",
  "Personal onboarding",
  "Priority support — dedicated success manager",
  "100+ skills customisable",
  "Step-by-step onboarding with ClawBot",
];


export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative z-10 mx-auto mt-28 max-w-6xl px-6 pb-24"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6b6b]">
        Get Access
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Pick your lane.</h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 max-w-4xl">
        {/* Basic Plan */}
        <div className="glass-card flex h-full flex-col rounded-2xl p-6">
          <h3 className="text-2xl font-semibold text-white">Basic</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-white">$199</span>
            <span className="text-xs text-slate-400">one-time setup</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white">+ $99</span>
            <span className="text-xs text-slate-400">/month service fee</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {basicPlan.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#ff6b6b]">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#pricing"
            className="mt-8 inline-block rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white text-center"
          >
            Get Started →
          </a>
        </div>

        {/* Pro Plan */}
        <div id="plan-119" className="glass-card glow-card relative flex h-full flex-col rounded-2xl p-6">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold badge">
            MOST POPULAR
          </div>
          <h3 className="text-2xl font-semibold text-white">Pro</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-white">$499</span>
            <span className="text-xs text-slate-400">one-time setup</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white">+ $99</span>
            <span className="text-xs text-slate-400">/month service fee</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {proPlan.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#ff6b6b]">✓</span>
                <span className={index === 4 ? "text-[#2dd4bf]" : ""}>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="https://buy.stripe.com/cNiaEZgYqf8Rg27bcbc3m07"
            className="mt-8 inline-block text-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-6 py-3 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(255,107,107,0.35)] transition hover:translate-y-[-1px]"
          >
            Get Started →
          </a>
        </div>

      </div>
    </section>
  );
}
