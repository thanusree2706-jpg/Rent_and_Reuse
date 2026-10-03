import React, { useState } from 'react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCategoryIcon } from './ItemCard';
import { User, Mail, ShieldCheck, Star, LogOut, Check, Edit3, MapPin, Building, Sparkles, ArrowRight, Package, ClipboardList, Trash2 } from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (tab: 'browse' | 'post' | 'requests' | 'messages' | 'trust' | 'profile') => void;
  onLogout: () => void;
  requestsCount: number;
  itemsCount: number;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  userItems?: Item[];
  onDeleteItem?: (item: Item) => void;
  onEditItem?: (item: Item) => void;
  onViewDetails?: (item: Item) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onLogout,
  requestsCount,
  itemsCount,
  onShowToast,
  userItems = [],
  onDeleteItem,
  onEditItem,
  onViewDetails,
}) => {
  const { currentUser, studentName, studentEmail, updateStudentProfile } = useAuth();

  const [displayName, setDisplayName] = useState(studentName || '');
  const [department, setDepartment] = useState(() => {
    return localStorage.getItem('rentReuse_student_dept') || 'Computer Science & Engineering (CSE)';
  });
  const [hostel, setHostel] = useState(() => {
    return localStorage.getItem('rentReuse_student_hostel') || 'Hostel Block A, Room 302';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      onShowToast('Display name cannot be empty', 'error');
      return;
    }

    try {
      setSaving(true);
      await updateStudentProfile(displayName.trim());
      localStorage.setItem('rentReuse_student_dept', department.trim());
      localStorage.setItem('rentReuse_student_hostel', hostel.trim());
      setIsEditing(false);
      onShowToast('Profile information updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error saving profile', err);
      onShowToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Student Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your verified campus student account, rental activity, and peer trust settings.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner with RGUKT Navy branding */}
        <div className="h-32 bg-gradient-to-r from-[#0d233e] via-[#123c69] to-[#1a508b] relative px-6 flex items-end">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-300 text-xs font-semibold border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RGUKT Campus Verified</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-6">
            {/* Avatar Initial */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg border-4 border-white shrink-0">
                {(studentName || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {studentName || 'RGUKT Student'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{studentEmail || currentUser?.email || 'student@rguktrkv.ac.in'}</span>
                </p>
              </div>
            </div>

            {/* Quick Action: Sign Out button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="cursor-pointer px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors flex items-center gap-1.5"
                title="Sign out of student account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Edit Form or Read-only Display */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="pt-4 border-t border-slate-100 space-y-4">
              <div className="font-semibold text-xs text-blue-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Edit Student Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Full Student Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE, ECE, Mechanical"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus Hostel / Room Coordinates
                  </label>
                  <input
                    type="text"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    placeholder="e.g. Hostel Block A, Room 302"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Protected:</strong> Your email and contact details remain protected and are never shared publicly with other students on the platform.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px]">Academic Department</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {department}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px]">Campus Hostel / Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {hostel}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <span className="text-amber-800/80 block text-[11px]">Campus Trust Score</span>
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  96% High Trust Rating
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Activity & Trust Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{requestsCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Rental Requests Tracked</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('requests')}
            className="cursor-pointer p-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="View Requests"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{itemsCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Items in Campus Catalog</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('post')}
            className="cursor-pointer p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            title="Post an Item"
          >
            <Package className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-emerald-600">Active</div>
            <div className="text-xs text-slate-500 mt-0.5">Campus Sharing Status</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="cursor-pointer p-2.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
            title="Browse Items"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Your Posted Items Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Your Posted Items ({userItems.length})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Items you have listed for rent on campus. You can delete or view your own items here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('post')}
            className="cursor-pointer px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            + Post Another Item
          </button>
        </div>

        {userItems.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {userItems.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">{item.title}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-800">₹{item.rent}/day</span>
                      <span>·</span>
                      <span>Deposit: ₹{item.deposit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onViewDetails && (
                    <button
                      type="button"
                      onClick={() => onViewDetails(item)}
                      className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  )}

                  {onEditItem && (
                    <button
                      type="button"
                      onClick={() => onEditItem(item)}
                      className="cursor-pointer px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      title="Edit this item"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>
                  )}

                  {onDeleteItem && (
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item)}
                      className="cursor-pointer px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      title="Delete this item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">You haven't posted any items yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Post an unused calculator, textbook, or gear to start sharing.</p>
            <button
              type="button"
              onClick={() => onNavigate('post')}
              className="cursor-pointer mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
            >
              Post an Item Now
            </button>
          </div>
        )}
      </div>

      {/* Quick Navigation Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900">
          Quick Campus Actions
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left transition-all group"
          >
            <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 block">
              Browse Available Items →
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Search calculators, books, lab coats, and electronics.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('post')}
            className="cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group"
          >
            <span className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700 block">
              + Post an Unused Item →
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Earn extra income by lending textbooks and supplies.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('trust')}
            className="cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 text-left transition-all group"
          >
            <span className="font-semibold text-xs text-slate-900 group-hover:text-amber-800 block">
              Trust & Safety Guidelines →
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Learn about escrow deposits, safe zones, and inspection.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
