import React, { useState, useEffect } from 'react';
import { Item, Category, ItemCondition } from '../types';
import { getCategoryIcon } from './ItemCard';
import { PlusCircle, ShieldCheck, MapPin, Star, Sparkles, CheckCircle2, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PostItemViewProps {
  onItemPosted: (newItem: Omit<Item, 'id' | 'createdAt' | 'trust' | 'available' | 'status'>) => void;
  onCancel: () => void;
  onOpenAuth: (prompt?: string) => void;
}

const CATEGORIES: Category[] = ['College Supplies', 'Books', 'Electronics', 'Sports', 'Other'];
const CONDITIONS: ItemCondition[] = ['New', 'Good', 'Fair'];

export const PostItemView: React.FC<PostItemViewProps> = ({ onItemPosted, onCancel, onOpenAuth }) => {
  const { currentUser, studentName } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('College Supplies');
  const [brand, setBrand] = useState('');
  const [rent, setRent] = useState<string>('20');
  const [deposit, setDeposit] = useState<string>('100');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Good');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState(studentName || 'Student');
  const [agreeTerms, setAgreeTerms] = useState(true);

  useEffect(() => {
    if (studentName) {
      setOwner(studentName);
    }
  }, [studentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('Please sign in with your student account to post an item.');
      return;
    }
    if (!agreeTerms) return;

    onItemPosted({
      title: title.trim(),
      category,
      brand: brand.trim() || undefined,
      rent: Math.max(1, Number(rent) || 10),
      deposit: Math.max(0, Number(deposit) || 0),
      location: location.trim(),
      condition,
      description: description.trim(),
      owner: owner.trim() || studentName || 'Student',
      ownerId: currentUser.uid,
      ownerEmail: currentUser.email || undefined,
    });
  };

  // If user is not logged in, show protected screen prompt
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Login Required
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            To prevent spam and protect fellow students on campus, listing an item requires logging in with your campus student account.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('Sign in or register to publish your campus item.')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In or Create Student Account</span>
            </button>
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Post an Unused Item
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Have textbooks, a calculator, sports equipment, or electronics you don't use every day?
          List it for peer rental and earn extra income while helping campus friends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio FX-991EX Calculator / Kreyszig Math Book"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand / Publisher <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Casio, Pearson, SS, boAt"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rent Per Day (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="20"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Typical campus rates: ₹15–₹50/day
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Security Deposit (₹) <span className="text-slate-400 font-normal">(Refundable)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="100"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Refunded to borrower upon safe return
              </span>
            </div>
          </div>

          {/* Location & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pickup Spot <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library 2nd floor, Hostel B"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Condition <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond} Condition
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Specifics <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, what's included (cables, case, edition number), exam relevance..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
            />
          </div>

          {/* Owner Handle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Rahul S. (RGUKT)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Trust Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I confirm this item is my personal property in good working condition.
                I agree to test and inspect it with the borrower at campus pickup.
              </span>
            </label>
          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreeTerms}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Item to Campus</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Catalog Preview</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col pointer-events-none">
            {/* Visual Header */}
            <div className="h-40 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4 border border-slate-100 mb-3">
              <span className="text-5xl mb-1">{getCategoryIcon(category)}</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span className="text-blue-700 font-semibold">{category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{brand || 'Student Gear'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{condition}</span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
              {title || 'Item title preview'}
            </h3>

            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              {description || 'Detailed item description will appear here...'}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xl font-bold text-slate-900 tabular-nums">
                  ₹{rent || 0}
                </span>
                <span className="text-xs text-slate-500 font-normal"> / day</span>
              </div>
              <div className="text-xs text-slate-500">
                Deposit: <span className="font-semibold text-slate-700">₹{deposit || 0}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{location || 'Campus location'}</span>
              </div>
              <div className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>80% Initial Trust</span>
              </div>
            </div>

            <div className="mt-1 text-[11px] text-slate-400">
              Lender: <span className="font-medium text-slate-700">{owner || studentName || 'Your Name'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Lender Protection Tips:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-blue-800">
              <li>Always collect the security deposit in full before handing over the item.</li>
              <li>Coordinate meetings at safe public campus areas like the Library or Canteen.</li>
              <li>Upon safe return, refund the deposit immediately to build your campus Trust Score.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
