import React, { useState } from 'react';
import { RentalRequest, RequestStatus } from '../types';
import { getCategoryIcon } from './ItemCard';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  AlertCircle,
  X,
  UserCheck,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface RequestsViewProps {
  requests: RentalRequest[];
  onAcceptRequest: (id: number) => void;
  onRejectRequest: (id: number) => void;
  onConfirmHandover: (id: number) => void;
  onConfirmReturn: (id: number, rating?: number, comment?: string) => void;
  onCompleteRequest?: (id: number, rating?: number, comment?: string) => void;
  onCancelRequest: (id: number) => void;
  onBrowseClick: () => void;
  onMessageOwner: (owner: string, itemTitle: string) => void;
  isLenderForRequest: (req: RentalRequest) => boolean;
  isBorrowerForRequest: (req: RentalRequest) => boolean;
  onSwitchDemoUser?: (role: 'student' | 'lender') => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onAcceptRequest,
  onRejectRequest,
  onConfirmHandover,
  onConfirmReturn,
  onCompleteRequest,
  onCancelRequest,
  onBrowseClick,
  onMessageOwner,
  isLenderForRequest,
  isBorrowerForRequest,
  onSwitchDemoUser,
}) => {
  const { currentUser, studentName } = useAuth();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Completed'>('All');
  const [roleFilter, setRoleFilter] = useState<'all' | 'lender' | 'borrower'>('all');
  const [ratingModalRequestId, setRatingModalRequestId] = useState<number | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('Item was in excellent condition and return was seamless!');

  // Match status normalizing 'Accepted' and 'Active' / 'Handed Over' to 'Approved'
  const isReqStatusMatch = (status: RequestStatus, target: 'Pending' | 'Approved' | 'Rejected' | 'Completed') => {
    if (target === 'Approved') {
      return status === 'Approved' || status === 'Accepted' || status === 'Active' || status === 'Handed Over';
    }
    return status === target;
  };

  const filteredRequests = requests.filter((r) => {
    // Status filter
    if (filter !== 'All' && !isReqStatusMatch(r.status, filter)) {
      return false;
    }

    // Role filter
    if (roleFilter === 'lender' && !isLenderForRequest(r)) {
      return false;
    }
    if (roleFilter === 'borrower' && !isBorrowerForRequest(r)) {
      return false;
    }

    return true;
  });

  const lenderRequestsCount = requests.filter(isLenderForRequest).length;
  const borrowerRequestsCount = requests.filter(isBorrowerForRequest).length;

  const handleOpenReturnModal = (id: number) => {
    setRatingModalRequestId(id);
    setStars(5);
    setFeedback('Item was returned in agreed condition. Security deposit refunded.');
  };

  const handleConfirmCompletion = () => {
    if (ratingModalRequestId !== null) {
      if (onConfirmReturn) {
        onConfirmReturn(ratingModalRequestId, stars, feedback);
      } else if (onCompleteRequest) {
        onCompleteRequest(ratingModalRequestId, stars, feedback);
      }
      setRatingModalRequestId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Quick Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Rental Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track borrower requests and lender approvals with synchronized real-time status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchDemoUser && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <span className="font-semibold text-blue-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Account:
              </span>
              <span className="font-bold text-slate-900">
                {studentName || currentUser?.displayName || 'Student'}
              </span>
              <span className="text-blue-300">·</span>
              <button
                type="button"
                onClick={() => onSwitchDemoUser('lender')}
                className="cursor-pointer font-medium text-blue-700 hover:text-blue-900 underline"
                title="Log in as Rahul Sharma (Lender)"
              >
                Lender (Rahul)
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => onSwitchDemoUser('student')}
                className="cursor-pointer font-medium text-blue-700 hover:text-blue-900 underline"
                title="Log in as Ananya Sharma (Student)"
              >
                Student (Ananya)
              </button>
            </div>
          )}

          <button
            onClick={onBrowseClick}
            className="cursor-pointer px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shadow-xs"
          >
            + Request Another Item
          </button>
        </div>
      </div>

      {/* Role filter segment (if user has both lender and borrower requests) */}
      {(lenderRequestsCount > 0 || borrowerRequestsCount > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">View Mode:</span>
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`cursor-pointer px-3 py-1 font-semibold rounded-md transition-colors ${
                roleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('lender')}
              className={`cursor-pointer px-3 py-1 font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                roleFilter === 'lender'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Incoming for My Items ({lenderRequestsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('borrower')}
              className={`cursor-pointer px-3 py-1 font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                roleFilter === 'borrower'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Borrowing ({borrowerRequestsCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit overflow-x-auto">
        {(['All', 'Pending', 'Approved', 'Rejected', 'Completed'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? requests.length
              : requests.filter((r) => isReqStatusMatch(r.status, tab)).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`cursor-pointer px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Request List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isLender = isLenderForRequest(req);
            const isBorrower = isBorrowerForRequest(req);
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved' || req.status === 'Accepted';
            const isRejected = req.status === 'Rejected';
            const isCompleted = req.status === 'Completed';

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Role Banner / Context */}
                <div
                  className={`px-5 py-2 text-xs flex items-center justify-between border-b ${
                    isLender
                      ? 'bg-blue-50/70 border-blue-100 text-blue-900'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLender ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                        <span className="font-bold text-blue-900">
                          Incoming Request (You are the Lender)
                        </span>
                        <span className="text-slate-400">·</span>
                        <span>Student Borrower: <strong className="text-slate-900">{req.borrower}</strong></span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-800">
                          Your Borrowing Request
                        </span>
                        <span className="text-slate-400">·</span>
                        <span>Item Owner / Lender: <strong className="text-slate-900">{req.owner}</strong></span>
                      </>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Requested on {req.date}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                  {/* Left Column: Item info & Status */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                      {getCategoryIcon(req.itemCategory)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {req.itemTitle}
                        </h3>

                        {/* Status Badges - Synchronized between accounts */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                            <span className="font-normal text-amber-700">
                              {isLender ? '· Action Required' : '· Awaiting Lender Approval'}
                            </span>
                          </span>
                        )}

                        {(req.status === 'Active' || req.status === 'Handed Over' || req.handedOver) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            <span>Active / Handed Over</span>
                            <span className="font-normal text-rose-700">
                              · Item Unavailable
                            </span>
                          </span>
                        )}

                        {(isApproved || req.status === 'Approved') && !req.handedOver && req.status !== 'Active' && req.status !== 'Handed Over' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved</span>
                            <span className="font-normal text-emerald-700">
                              · Ready for Handover
                            </span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 shadow-2xs">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                            <span className="font-normal text-rose-700">
                              · Not Approved by Lender
                            </span>
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Completed & Returned</span>
                          </span>
                        )}
                      </div>

                      {/* Clean Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span>Lender: <strong className="text-slate-700">{req.owner}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Borrower: <strong className="text-slate-700">{req.borrower}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {req.pickupLocation}
                        </span>
                      </div>

                      {req.note && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 italic">
                          "{req.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Pricing ledger */}
                  <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 text-right shrink-0 min-w-[170px]">
                    <div className="text-xs text-slate-500">
                      Duration: <strong className="text-slate-800">{req.days} days</strong>
                    </div>
                    <div className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
                      ₹{req.totalRent}{' '}
                      <span className="text-xs font-normal text-slate-500">rent</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Deposit: ₹{req.deposit} (refundable)
                    </div>
                  </div>

                  {/* Right Column: Actions (Lender vs Student) */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Chat button: Shared between lender and student */}
                    <button
                      type="button"
                      onClick={() => onMessageOwner(isLender ? req.borrower : req.owner, req.itemTitle)}
                      className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                      title={isLender ? `Message borrower (${req.borrower})` : `Message lender (${req.owner})`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Chat</span>
                    </button>

                    {/* LENDER-ONLY ACTIONS: Accept, Reject, Confirm Handover, Confirm Return */}
                    {isLender && isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAcceptRequest(req.id)}
                          className="cursor-pointer px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                          title="Accept this rental request as the item owner"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onConfirmHandover(req.id)}
                          className="cursor-pointer px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                          title="Confirm handover of the item to the student"
                        >
                          <span>Confirm Handover</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectRequest(req.id)}
                          className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                          title="Reject this rental request"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Owner Action: Confirm Handover when Approved and not yet handed over */}
                    {isLender && (isApproved || req.status === 'Approved') && !req.handedOver && req.status !== 'Active' && req.status !== 'Handed Over' && (
                      <button
                        type="button"
                        onClick={() => onConfirmHandover(req.id)}
                        className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 hover:shadow-md"
                        title="Click when you have handed over the item to the student borrower"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Handover</span>
                      </button>
                    )}

                    {/* Owner Action: Confirm Return when item is handed over / active */}
                    {isLender && (req.handedOver || req.status === 'Active' || req.status === 'Handed Over') && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleOpenReturnModal(req.id)}
                        className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-all shadow-xs flex items-center gap-1.5 hover:shadow-md"
                        title="Click when the borrower returns the item to you"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Return</span>
                      </button>
                    )}

                    {/* BORROWER VIEW:
                        The borrower CANNOT mark item as available or confirm return/handover.
                    */}
                    {!isLender && isPending && (
                      <button
                        type="button"
                        onClick={() => onCancelRequest(req.id)}
                        className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel your rental request"
                      >
                        Cancel Request
                      </button>
                    )}

                    {!isLender && (isApproved || req.status === 'Approved') && !req.handedOver && req.status !== 'Active' && req.status !== 'Handed Over' && (
                      <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        Approved · Meet owner for handover
                      </span>
                    )}

                    {!isLender && (req.handedOver || req.status === 'Active' || req.status === 'Handed Over') && !isCompleted && (
                      <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        Active Rental (Item with you) · Return to {req.owner} when done
                      </span>
                    )}

                    {isCompleted && (
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: req.ratingGiven || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">Return Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No {filter !== 'All' ? filter.toLowerCase() : ''} requests found
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            When you request items from peers or when students request your listed gear, they will appear here.
          </p>
          <button
            onClick={onBrowseClick}
            className="cursor-pointer mt-5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-xs"
          >
            Browse Available Items
          </button>
        </div>
      )}

      {/* Rating & Completion Modal (Owner Confirm Return) */}
      {ratingModalRequestId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Item Return & Release Deposit
            </h3>
            <p className="text-xs text-slate-500">
              As the item owner, confirm that the borrower returned the item in good condition. This marks the item as <strong>Available</strong> again in the catalog and refunds the security deposit.
            </p>

            {/* Star selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Borrower Trust & Return Condition:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    className="cursor-pointer p-1 text-2xl transition-transform hover:scale-115 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {stars} / 5 Stars
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback Comment
              </label>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRatingModalRequestId(null)}
                className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="cursor-pointer px-5 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Return & Mark Available</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
