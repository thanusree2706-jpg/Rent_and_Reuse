import React, { useState } from 'react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCategoryIcon } from './ItemCard';
import {
  User,
  Mail,
  ShieldCheck,
  Star,
  LogOut,
  Check,
  Edit3,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Package,
  ClipboardList,
  Trash2,
} from 'lucide-react';

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
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-gradient-to-br from-[#F3F7FF] via-[#F5F4FF] to-[#F6F2FF] min-h-[calc(100vh-14rem)] relative overflow-hidden">
      {/* Soft atmospheric ambient accents echoing Browse page blue & purple palette */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Student Profile
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your verified campus student account, rental activity, and peer trust settings.
          </p>
        </div>

        {/* Main Profile Card: Clean white card with subtle shadow, no empty banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Top Header: Avatar, Name/Email, Badges, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          {/* Avatar & Student Name/Email */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Profile Avatar Initial with soft gradient and subtle ring */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 ring-4 ring-blue-50">
              {(studentName || displayName || 'S').charAt(0).toUpperCase()}
            </div>

            {/* Student Name, Badge, and Email */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {studentName || displayName || 'RGUKT Student'}
                </h3>
                <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Student
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Campus Verified</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[230px] sm:max-w-none">
                  {studentEmail || currentUser?.email || 'student@rguktrkv.ac.in'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions: Edit Profile & Sign Out */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Student Details Section: Edit Form or Read-only Display Grid */}
        <div className="pt-6">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Edit Student Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Full Student Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Academic Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE, ECE, Mechanical"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Campus Hostel / Room Coordinates
                    </label>
                    <input
                      type="text"
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      placeholder="e.g. Hostel Block A, Room 302"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacy Protected:</strong> Your email and contact details remain protected and are never shared publicly with other students on the platform.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-medium">Academic Department</span>
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{department}</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-medium">Campus Hostel / Location</span>
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{hostel}</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                  <span className="text-amber-800/80 block text-[11px] font-medium">Campus Trust Score</span>
                  <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                    <span>96% High Trust Rating</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Student Activity & Trust Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{requestsCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Rental Requests Tracked</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('requests')}
            className="cursor-pointer p-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            title="View Requests"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{itemsCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Items in Campus Catalog</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('post')}
            className="cursor-pointer p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            title="Post an Item"
          >
            <Package className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-emerald-600">Active</div>
            <div className="text-xs text-slate-500 mt-0.5">Campus Sharing Status</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="cursor-pointer p-2.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
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
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-slate-900">{item.title}</h5>
                      {item.status === 'unavailable' || (!item.available && item.status !== 'requested') ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          Unavailable · Lent Out
                        </span>
                      ) : item.status === 'requested' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Requested
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Available
                        </span>
                      )}
                    </div>
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
  </div>
  );
};
