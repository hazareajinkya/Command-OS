import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pt-24 text-center md:pt-32">
      <div className="relative">
        {/* Red 3D glow behind logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(200,50,50,0.5)_0%,_rgba(150,30,30,0.3)_40%,_transparent_70%)] blur-xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(220,60,60,0.4)_0%,_transparent_60%)] blur-lg" />
        <Image src="/logo2.svg" alt="Command OS logo" width={140} height={140} priority className="relative z-10" />
      </div>

      <div className="space-y-4">
        <h1 className="gradient-text text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Command OS
        </h1>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ff6b6b]">
          Your AI Chief of Staff
        </p>
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        An AI-powered operating system that replaces up to 7&ndash;8 employees per deployment.
        Marketing. Sales. Customer Service. Customer Experience &mdash; all handled by one system.
      </p>

      {/* Key stats */}
      <div className="mt-4 grid grid-cols-3 gap-6 max-w-2xl w-full">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#ff6b6b]">Up to 7&ndash;8</p>
          <p className="mt-1 text-xs text-slate-400">Employees Replaced / Client</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#2dd4bf]">$25K+</p>
          <p className="mt-1 text-xs text-slate-400">Monthly Savings / Client</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#22c55e]">10x+</p>
          <p className="mt-1 text-xs text-slate-400">ROI for Your Clients</p>
        </div>
      </div>

      <a
        href="#pricing"
        className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-[#ff6b6b]/40 hover:bg-white/10"
      >
        <span className="badge rounded-full px-2 py-1 text-[10px] font-semibold">
          Enterprise
        </span>
        View Pricing Models
        <span className="text-[#ff6b6b]">&rarr;</span>
      </a>
    </section>
  );
}
