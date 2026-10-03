import React from 'react';
import { ShieldCheck, Lock, Star, Eye, CheckCircle2, AlertTriangle, Users, MapPin, Sparkles } from 'lucide-react';

export const TrustSafetyView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Campus Integrity & Community Standards</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Trust & Safety at Rent & Reuse
        </h2>
        <p className="mt-2 text-base text-slate-600 leading-relaxed max-w-3xl">
          Rent & Reuse is built for students, by students. We combine transparent trust ratings,
          secure zero-leak communication, and campus-verified handovers to ensure safe sharing of study tools and electronics.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            1. Verifiable Campus Trust Scores
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every student begins with an 80% baseline trust score. Completing on-time returns,
            maintaining item cleanliness, and receiving 5-star ratings increases your trust level
            up to 100%. Lenders can rent with peace of mind.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            2. Zero Phone Number & Email Leaks
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never post personal contact details on bulletin boards. All negotiations, pickup timing,
            and questions occur strictly through our in-app messenger so your personal phone number,
            email, and hostel room remain private.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            3. Refundable Security Deposit Escrow
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            For higher-value gear like scientific calculators, laptops, and cricket kits, lenders set
            a transparent security deposit. Borrowers get 100% of this deposit refunded immediately
            upon safe item return.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            4. RGUKT Campus Peer Verification
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Only verified campus students can list or request items. Handover locations are restricted
            to well-lit public university zones: Central Library, Academic Department Foyers, and Student Activity Centers.
          </p>
        </div>
      </div>

      {/* Handover Inspection Checklist */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Mandatory Student Protocol
          </span>
          <h3 className="text-xl font-bold mt-1 text-white">
            4-Step Campus Handover Checklist
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow these 4 quick steps when meeting your classmate to pick up or return an item:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-emerald-400">Step 01</div>
            <h4 className="text-sm font-semibold text-white">Visual & Power Inspection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Power on electronic devices, check calculator screens for dead pixels, inspect bat grip or textbook spine together.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-emerald-400">Step 02</div>
            <h4 className="text-sm font-semibold text-white">Count Accessories</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify included items: charger cables, case cover, drafter clips, or shuttlecocks. Note any pre-existing scratches.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-emerald-400">Step 03</div>
            <h4 className="text-sm font-semibold text-white">Confirm Return Date</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agree on the exact return date and time (e.g. Friday after 5 PM outside Central Library helpdesk).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-emerald-400">Step 04</div>
            <h4 className="text-sm font-semibold text-white">Instant App Confirmation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap "Mark Completed" in the Requests tab upon return to release the security deposit and boost the peer's Trust Score.
            </p>
          </div>
        </div>
      </div>

      {/* Safe Public Meeting Spots */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Recommended Campus Meeting Zones
        </h3>
        <p className="text-xs text-slate-500">
          Always arrange handovers in open, public, monitored university areas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800">Central Library</div>
            <div className="text-slate-500 mt-0.5">Ground Floor Lobby & Helpdesk</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800">Student Activity Center</div>
            <div className="text-slate-500 mt-0.5">Main Cafeteria & Courtyard</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800">Academic Department Foyers</div>
            <div className="text-slate-500 mt-0.5">CSE, ECE & Mech Department Portals</div>
          </div>
        </div>
      </div>
    </div>
  );
};
