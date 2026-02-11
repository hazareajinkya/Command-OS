const tabs = ["One-liner", "npm", "Hackable", "macOS"];

export default function QuickStart() {
  return (
    <section
      id="quick-start"
      className="relative z-10 mx-auto mt-24 max-w-6xl px-6"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6b6b]">
            Quick Start
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Get OpenClaw running in minutes.
          </h2>
          <p className="text-slate-300">
            Copy the one-liner or follow the guided install. No terminal wizardry
            required — we can even do it for you.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">
              macOS/Linux
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              change
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              beta
            </span>
          </div>
        </div>

        <div className="terminal flex-1 rounded-2xl p-6 text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            {tabs.map((tab, index) => (
              <span
                key={tab}
                className={`rounded-full border px-3 py-1 ${
                  index === 0
                    ? "border-[#ff6b6b] text-white"
                    : "border-white/10"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-3 font-mono text-[12px] leading-relaxed text-slate-300">
            <p>$ curl -fsSL https://install.openclaw.ai | bash</p>
            <p>$ openclaw setup --provider claude</p>
            <p>$ openclaw connect --channel whatsapp</p>
            <p>$ openclaw run --mode assistant</p>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-[11px] text-slate-400">
            Need a hand? We can set everything up on a virtual server and send
            your login details within a few hours.
          </div>
        </div>
      </div>
    </section>
  );
}
