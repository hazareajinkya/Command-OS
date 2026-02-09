export default function StarBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#060810]" />
      
      {/* 3D Red glow on LEFT side - darker/subtler */}
      <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_0%_50%,_rgba(120,30,30,0.25)_0%,_transparent_50%)]" />
      <div className="absolute -left-32 top-1/4 h-[700px] w-[500px] rounded-full bg-red-900/15 blur-[100px]" />
      <div className="absolute -left-20 top-1/2 h-[500px] w-[400px] rounded-full bg-red-800/10 blur-[80px]" />
      
      {/* 3D Turquoise glow on RIGHT side - darker/subtler */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_100%_50%,_rgba(30,100,100,0.2)_0%,_transparent_50%)]" />
      <div className="absolute -right-32 top-1/4 h-[700px] w-[500px] rounded-full bg-teal-900/15 blur-[100px]" />
      <div className="absolute -right-20 top-1/2 h-[500px] w-[400px] rounded-full bg-cyan-900/10 blur-[80px]" />
      
      {/* Red glow behind logo area (center top) - darker */}
      <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-red-900/20 blur-[80px]" />
      
      {/* Starfield */}
      <div className="starfield" />
      {/* Floating white spots */}
      <div className="floating-spots" />
    </div>
  );
}
