import React, { useState } from 'react';
import { RefreshCw, PlusCircle, MessageSquare, ShieldCheck, ClipboardList, Grid, Menu, X, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'browse' | 'post' | 'requests' | 'messages' | 'trust' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
  onOpenAuth: (prompt?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  pendingRequestsCount,
  unreadMessagesCount,
  onOpenAuth,
}) => {
  const { currentUser, studentName, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: NavTab) => {
    if (tab === 'post' && !currentUser) {
      onOpenAuth('Please sign in with your student account to post an item.');
      return;
    }
    if (tab === 'profile' && !currentUser) {
      onOpenAuth('Please sign in to view your student profile.');
      return;
    }
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handlePostClick = () => {
    if (!currentUser) {
      onOpenAuth('Please sign in or create an account to post an item.');
    } else {
      onNavigate('post');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#102a4e] text-white border-b border-blue-950/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('browse')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
              title="Go to Browse"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/90 flex items-center justify-center text-white shadow-inner group-hover:bg-blue-500 transition-colors">
                <RefreshCw className="w-5 h-5 text-emerald-300 transition-transform group-hover:rotate-180 duration-500" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none">
                  Rent & Reuse
                </span>
                <span className="text-[11px] font-medium text-blue-200/80 tracking-wide">
                  Campus Peer Sharing
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              type="button"
              onClick={() => handleNav('browse')}
              className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'browse'
                  ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4 text-blue-300" />
              Browse
            </button>

            <button
              type="button"
              onClick={() => handleNav('post')}
              className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'post'
                  ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Post Item
            </button>

            <button
              type="button"
              onClick={() => handleNav('requests')}
              className={`cursor-pointer relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-300" />
              My Requests
              {pendingRequestsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNav('messages')}
              className={`cursor-pointer relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-300" />
              Messages
              {unreadMessagesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-sky-400 text-slate-950 rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNav('trust')}
              className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'trust'
                  ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Trust & Safety
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-blue-600/40 text-white font-semibold shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4 text-emerald-300" />
                Profile
              </button>
            )}
          </nav>

          {/* Zone 3: Student authentication state & primary action */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Clickable Profile Button */}
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs text-left group ${
                    activeTab === 'profile'
                      ? 'bg-blue-800/90 border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'bg-blue-900/60 border-blue-700/60 hover:bg-blue-800/80 hover:border-blue-600'
                  }`}
                  title="View & Edit Student Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-white block leading-tight truncate max-w-[120px]">
                      {studentName}
                    </span>
                    <span className="text-[10px] text-emerald-300 block leading-none">
                      Student Profile
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign out of student account"
                  className="cursor-pointer p-2 text-blue-200 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth()}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/60 border border-blue-700/60 text-xs font-semibold text-blue-100 hover:text-white hover:bg-blue-800/80 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-300" />
                <span>Student Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePostClick}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              + Post an Item
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-blue-900/60 space-y-1 bg-[#102a4e]">
            {/* Student Auth status on mobile */}
            <div className="p-3 mb-2 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-between">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNav('profile')}
                    className="cursor-pointer flex items-center gap-2 text-left flex-1 min-w-0 mr-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {studentName}
                      </div>
                      <div className="text-[10px] text-emerald-300 truncate">
                        Tap to View Profile →
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 font-medium shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="cursor-pointer w-full py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Student Sign In / Sign Up
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNav('browse')}
              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'browse' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-300" />
                Browse Items
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('post')}
              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'post' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Post an Item
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('requests')}
              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'requests' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-300" />
                My Requests
              </span>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNav('messages')}
              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'messages' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-300" />
                Messages
              </span>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-sky-400 text-slate-950 rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNav('trust')}
              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'trust' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Trust & Safety
              </span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activeTab === 'profile' ? 'bg-blue-600/40 text-white font-semibold' : 'text-blue-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-300" />
                  Student Profile
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
