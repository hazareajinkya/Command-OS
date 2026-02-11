"use client";

import { useEffect, useState } from "react";

export default function StickyPricingBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        setIsVisible(rect.top > window.innerHeight * 0.8);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0a0c14]/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400">Starting at</p>
            <p className="text-lg font-bold text-white">
              $15,000 <span className="text-xs font-normal text-slate-400">partnership</span>
            </p>
          </div>
          <a
            href="#pricing"
            className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:shadow-red-500/30"
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}
