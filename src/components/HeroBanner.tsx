import React from 'react';
import { PlusCircle, Search, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import heroCampusImg from '../assets/images/hero_campus_sharing_1790930486128.jpg';

interface HeroBannerProps {
  onPostClick: () => void;
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onPostClick, onExploreClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d233e] via-[#123863] to-[#1a508b] text-white shadow-xl mb-10 border border-blue-900/50">
      {/* Background Photography with WCAG AA Measured Contrast Scrim */}
      <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay">
        <img
          src={heroCampusImg}
          alt="Campus student collaboration and item sharing"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>RGUKT Campus Peer-to-Peer Economy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
          Rent what you need. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-200 to-emerald-200">
            Reuse what you have.
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
          A student-friendly platform where RGUKT students rent, borrow, and share useful items
          safely with each other. Save money on one-time exam gear, lab supplies, and weekend sports.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={onPostClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            + Post an Unused Item
          </button>

          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-colors border border-white/20"
          >
            <Search className="w-4 h-4 text-blue-200" />
            Explore Available Items
          </button>
        </div>

        {/* Quantitative Proof Adjacency */}
        <div className="mt-10 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">1,240+</div>
            <div className="text-xs text-blue-200/80 mt-0.5">Successful Campus Rentals</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 tabular-nums">₹3.8 Lakhs</div>
            <div className="text-xs text-blue-200/80 mt-0.5">Saved by Fellow Students</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-sky-300 tabular-nums">100%</div>
            <div className="text-xs text-blue-200/80 mt-0.5">Verified Student Handover</div>
          </div>
        </div>
      </div>
    </div>
  );
};
