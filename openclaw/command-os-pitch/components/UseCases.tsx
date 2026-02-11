const marketingAgent = [
  "SEO optimisation & content strategy",
  "Social media management & scheduling",
  "Email campaign automation",
  "Lead generation & nurturing",
  "Ad copy & creative generation",
];

const salesAgent = [
  "Outbound cold calls & follow-ups",
  "Lead qualification & scoring",
  "Pipeline management & CRM updates",
  "Proposal & quote generation",
  "Appointment booking & reminders",
];

const cxAgent = [
  "24/7 customer support on calls & chat",
  "Ticket triage & resolution",
  "Review management & responses",
  "Client onboarding workflows",
  "Satisfaction surveys & NPS tracking",
];

const opsAgent = [
  "Scheduling & calendar management",
  "Invoice generation & follow-ups",
  "Expense tracking & reporting",
  "Workflow automation",
  "Team coordination & task management",
];

export default function UseCases() {
  const agents = [
    { name: "Marketing Agent", icon: "📢", items: marketingAgent, color: "text-[#ff6b6b]" },
    { name: "Sales Agent", icon: "💰", items: salesAgent, color: "text-[#f97316]" },
    { name: "Customer Experience Agent", icon: "🎯", items: cxAgent, color: "text-[#2dd4bf]" },
    { name: "Operations Agent", icon: "⚙️", items: opsAgent, color: "text-[#a78bfa]" },
  ];

  return (
    <section className="relative z-10 mx-auto mt-24 max-w-6xl px-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          What Command OS Replaces
        </h2>
        <p className="mt-3 text-lg text-slate-400">
          One system. Four departments. Up to 7&ndash;8 employees &mdash; automated.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <div key={agent.name} className="glass-card rounded-2xl p-5">
            <div className="text-2xl">{agent.icon}</div>
            <h3 className={`mt-3 text-sm font-semibold uppercase tracking-wider ${agent.color}`}>
              {agent.name}
            </h3>
            <ul className="mt-4 space-y-2">
              {agent.items.map((item) => (
                <li key={item} className="flex gap-2 text-xs text-slate-300">
                  <span className={agent.color}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Employee replacement math */}
      <div className="mt-16 glass-card rounded-2xl p-8 max-w-3xl mx-auto text-center">
        <h3 className="text-xl font-semibold text-white">The Math That Matters</h3>
        <p className="mt-2 text-sm text-slate-400">For each client you deploy Command OS to</p>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Employees Replaced</p>
            <p className="mt-1 text-2xl font-bold text-white">Up to 7&ndash;8</p>
            <p className="text-xs text-slate-400">per deployment</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Avg. Salary Each</p>
            <p className="mt-1 text-2xl font-bold text-white">$5,000</p>
            <p className="text-xs text-slate-400">per month</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Savings</p>
            <p className="mt-1 text-2xl font-bold text-[#2dd4bf]">$25,000</p>
            <p className="text-xs text-slate-400">per month / per client</p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-sm text-slate-300">
            Your client saves <strong className="text-white">$25,000/month</strong> on payroll
            and pays you just <strong className="text-white">$2,000/month</strong> for Command OS.
            That&apos;s a <strong className="text-[#ff6b6b]">10x+ ROI</strong> from day one.
          </p>
        </div>
      </div>
    </section>
  );
}
