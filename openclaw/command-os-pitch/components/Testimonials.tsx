export default function Testimonials() {
  return (
    <section
      className="relative z-10 mx-auto mt-28 max-w-5xl px-6 pb-28"
      id="roi"
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6b6b]">
          Revenue Projections
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
          Your Revenue Model
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Here&apos;s how the numbers work when you resell Command OS
        </p>
      </div>

      {/* Revenue table — Subtle, clean */}
      <div className="mt-14 glass-card rounded-2xl p-10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Metric</th>
              <th className="pb-4 text-xs uppercase tracking-wider text-slate-500 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="py-4 text-base text-slate-300">Your investment (Full Purchase)</td>
              <td className="py-4 text-right text-lg font-bold text-white">$30,000</td>
            </tr>
            <tr>
              <td className="py-4 text-base text-slate-300">You charge each client</td>
              <td className="py-4 text-right text-lg font-bold text-white">$2,000<span className="text-sm font-normal text-slate-400">/mo</span></td>
            </tr>
            <tr>
              <td className="py-4 text-base text-slate-300">Clients to break even</td>
              <td className="py-4 text-right text-lg font-bold text-[#2dd4bf]">15 clients</td>
            </tr>
            <tr>
              <td className="py-4 text-base text-slate-300">At 2 clients/week sign rate</td>
              <td className="py-4 text-right text-lg font-bold text-[#2dd4bf]">Break even in &lt; 2 months</td>
            </tr>
            <tr>
              <td className="py-5 text-base text-slate-200 font-medium">10 clients &times; $2,000/mo &times; 12 months</td>
              <td className="py-5 text-right text-xl font-bold text-white">$240,000<span className="text-sm font-normal text-slate-400">/year</span></td>
            </tr>
            <tr>
              <td className="py-4 text-base text-slate-300">Each client saves on payroll</td>
              <td className="py-4 text-right text-lg font-bold text-white">$25,000<span className="text-sm font-normal text-slate-400">/mo</span></td>
            </tr>
          </tbody>
        </table>

        {/* Subtle ROI callout */}
        <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/10 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projected Annual Revenue</p>
          <p className="mt-2 text-4xl font-black text-white">$240,000+</p>
          <p className="mt-2 text-sm text-slate-400">
            with just <span className="text-white font-medium">10 clients</span> at $2,000/month &mdash; an <span className="text-[#2dd4bf] font-medium">8x return</span> on a $30,000 investment
          </p>
        </div>
      </div>

      {/* Bottom CTA — Target Market */}
      <div className="mt-16 text-center">
        <div className="inline-block glass-card rounded-2xl p-10 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-[#ff6b6b] font-semibold">Target Market</p>
          <p className="mt-4 text-4xl font-black text-white">1M+ Home Service Professionals</p>
          <p className="mt-3 text-base text-slate-400">in the US alone &mdash; owner-operator businesses with 4&ndash;5 employees, perfect for a fractional CMO replacement.</p>
          <p className="mt-5 text-xl font-semibold text-slate-200">$842 Billion industry. <span className="text-[#2dd4bf]">Barely digitised.</span></p>
        </div>
      </div>
    </section>
  );
}
