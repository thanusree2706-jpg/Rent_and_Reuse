import React, { useState } from 'react';
import { Item } from '../types';
import { getCategoryIcon } from './ItemCard';
import { X, MapPin, Star, ShieldCheck, Calendar, Info, Clock, CheckCircle2, MessageSquare, LogIn, Trash2, Edit3 } from 'lucide-react';

interface ItemModalProps {
  item: Item | null;
  onClose: () => void;
  onSubmitRequest: (params: {
    itemId: number;
    days: number;
    startDate: string;
    totalRent: number;
    note: string;
  }) => void;
  onContactOwner: (item: Item) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: (prompt: string) => void;
  isOwnItem?: boolean;
  onDelete?: (item: Item) => void;
  onEdit?: (item: Item) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  onClose,
  onSubmitRequest,
  onContactOwner,
  isLoggedIn = true,
  onRequireLogin,
  isOwnItem = false,
  onDelete,
  onEdit,
}) => {
  if (!item) return null;

  const [days, setDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('');
  const [imageError, setImageError] = useState(false);

  const totalRent = item.rent * days;
  const totalUpfront = totalRent + item.deposit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onRequireLogin?.('Please sign in with your student account to request this rental.');
      return;
    }

    onSubmitRequest({
      itemId: item.id,
      days,
      startDate,
      totalRent,
      note,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getCategoryIcon(item.category)}</span>
            <div>
              <span className="text-xs font-semibold text-blue-700 tracking-wide">
                {item.category}
              </span>
              <span className="text-slate-300 mx-1.5">·</span>
              <span className="text-xs text-slate-500 font-medium">{item.brand || 'Campus Gear'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Image / Fallback Container */}
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/3 flex items-center justify-center relative">
              {item.imageUrl && !imageError ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  onError={() => setImageError(true)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-6xl mb-2">{getCategoryIcon(item.category)}</span>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              )}
              <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[11px] px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                Condition: {item.condition}
              </div>
            </div>

            {/* Basic Info & Owner */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {item.title}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pickup Area:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {item.location}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Security Deposit:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ₹{item.deposit}{' '}
                    <span className="text-[11px] font-normal text-emerald-600">(100% Refundable)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lender:</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">{item.owner}</span>
                    <div className="flex items-center justify-end gap-1 text-amber-700 font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{item.trust}% Trust Score</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onContactOwner(item);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask {item.owner} a question first
                </button>
              </div>
            </div>
          </div>

          {/* Rental Duration & Pricing Calculator */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Configure Rental Duration
              </h3>
              <span className="text-xs text-slate-500">
                ₹{item.rent}/day base rate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration Stepper */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  How many days do you need it?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 7, 14].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        days === d
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">days</span>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Requested Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pickup coordinate: {item.location}
                </span>
              </div>
            </div>

            {/* Note to Lender */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Note for {item.owner} (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Preparing for Friday engineering lab exam, can meet at library..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Transparent Calculation Ledger */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Rental fee ({days} days × ₹{item.rent})</span>
                <span className="font-semibold text-slate-900 tabular-nums">₹{totalRent}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Refundable security deposit</span>
                <span className="font-semibold text-slate-900 tabular-nums">₹{item.deposit}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900">Total Upfront Amount</span>
                  <span className="block text-[11px] text-emerald-600 font-medium">
                    (₹{item.deposit} deposit refunded on safe return)
                  </span>
                </div>
                <span className="text-xl font-extrabold text-blue-900 tabular-nums">
                  ₹{totalUpfront}
                </span>
              </div>
            </div>

            {/* Login Warning if unauthenticated */}
            {!isLoggedIn && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Student login required to submit rental requests.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRequireLogin?.('Please sign in to submit a rental request.')}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300 rounded transition-colors"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Trust & Safety Campus Promise */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Campus Peer Protection:</span> Both parties must inspect
                item condition together at pickup. Deposit is held securely until item is returned in agreed condition.
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {isOwnItem ? (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-xs transition-colors flex items-center gap-1.5"
                      title="Edit your posted item"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                      title="Delete your posted item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Request to Rent for ₹{totalRent}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
