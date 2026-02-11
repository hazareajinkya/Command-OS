const fullPurchaseFeatures = [
  "Full ownership of Command OS platform",
  "Deploy as Chief of Staff for each client",
  "Replaces up to 7–8 employees per client deployment",
  "Marketing, Sales, CX & Customer Service agents",
  "Resell to unlimited clients",
  "Token costs charged to client accounts (actuals)",
  "$2,000/month maintenance per client deployment",
  "Bring your own API keys or buy tokens for clients",
];

const partnershipFeatures = [
  "50% discount — Command OS valued at $30,000",
  "50-50 Joint Venture partnership",
  "All Command OS capabilities included",
  "Deploy to unlimited clients",
  "Token costs borne by partner",
  "Partner handles marketing & sales",
  "AICE provides product, tech & support",
  "Shared upside on every client deployment",
];


export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative z-10 mx-auto mt-28 max-w-6xl px-6 pb-12"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6b6b]">
        Pricing Models
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Two ways to get started.</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-xl">
        Choose the model that fits your growth strategy. Both give you the full Command OS platform.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 max-w-5xl">
        {/* Proposition 1: Full Purchase — Credit card style */}
        <div className="relative flex h-full flex-col rounded-[20px] p-8 pt-10 overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#0f1118] via-[#0d0f17] to-[#0a0c14] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Proposition 1</p>
          <h3 className="mt-2 text-3xl font-bold text-white">Full Purchase</h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-sm text-slate-500 line-through">$40,000</span>
            <span className="text-3xl font-semibold text-white">$30,000</span>
            <span className="text-xs text-slate-400">one-time</span>
          </div>
          <p className="mt-1 text-xs text-emerald-400/80">Save $10,000 &mdash; limited-time offer</p>

          <div className="mt-5 rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Recurring per client deployment</p>
            <p className="mt-1 text-lg text-white font-bold">$2,000<span className="text-sm font-normal text-slate-400">/month maintenance</span> + token costs</p>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-slate-300 flex-1">
            {fullPurchaseFeatures.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-slate-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {/* ROI Box — Green tinted */}
            <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/[0.15] p-5">
              <p className="text-base font-bold text-emerald-400 uppercase tracking-wider">ROI Snapshot</p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-300">
                  Resell at <strong className="text-white">$2,000/month</strong> per client.
                </p>
                <p className="text-base font-semibold text-emerald-400">
                  15 clients = full cost recovery
                </p>
                <p className="text-sm text-slate-400">
                  Even 10 clients covers your investment in just <span className="text-emerald-400">1.5 months</span>.
                </p>
                <p className="mt-2 text-xs text-slate-500 border-t border-white/[0.05] pt-2">
                  At 2 clients/week sign rate &rarr; break even in under 2 months
                </p>
              </div>
            </div>

            <a
              href="#pricing"
              className="mt-6 inline-block w-full text-center rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              Get Started &rarr;
            </a>
          </div>
        </div>

        {/* Proposition 2: Partnership — Premium credit card style */}
        <div id="plan-partnership" className="relative flex h-full flex-col rounded-[20px] p-8 pt-10 border border-[#ff6b6b]/20 bg-gradient-to-br from-[#0f1319] via-[#0c1016] to-[#080c12] shadow-[0_0_0_1px_rgba(255,107,107,0.1),0_8px_30px_rgba(255,107,107,0.08),0_20px_60px_rgba(249,115,22,0.06)]">
          {/* Orange shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff6b6b]/25 to-transparent" />

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-5 py-2 text-[11px] font-bold text-black uppercase tracking-wider">
            RECOMMENDED
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Proposition 2</p>
          <h3 className="mt-2 text-3xl font-bold text-white">Partnership (50-50 JV)</h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-base text-slate-500 line-through">$30,000</span>
            <span className="text-4xl font-bold text-white">$15,000</span>
            <span className="text-sm text-slate-400">one-time</span>
          </div>
          <p className="mt-1 text-sm text-[#ff6b6b]/80">50% discount &mdash; Joint Venture model</p>

          <div className="mt-5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Business Structure</p>
            <p className="mt-1 text-lg text-white font-bold">50-50 equity <span className="text-sm font-normal text-slate-400">in the joint venture</span></p>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-slate-300 flex-1">
            {partnershipFeatures.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className={index === 0 || index === 1 ? "text-emerald-400" : "text-[#ff6b6b]"}>✓</span>
                <span className={index === 0 || index === 1 ? "text-emerald-400 font-medium" : ""}>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {/* Why Partnership — Green tinted */}
            <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/[0.15] p-5">
              <p className="text-base font-bold text-emerald-400 uppercase tracking-wider">Why Partnership?</p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-300">
                  Lower upfront cost. Shared risk. <strong className="text-white">AICE brings a $30,000 product at 50% off</strong> and provides ongoing tech &amp; support.
                </p>
                <p className="text-sm text-slate-300">
                  You handle sales &amp; marketing. <strong className="text-emerald-400">Both sides win on every client.</strong>
                </p>
              </div>
            </div>

            <a
              href="#pricing"
              className="mt-6 inline-block w-full text-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-8 py-4 text-base font-bold text-black shadow-[0_12px_30px_rgba(255,107,107,0.25)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(255,107,107,0.35)]"
            >
              Let&apos;s Partner &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
