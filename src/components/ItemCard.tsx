import React, { useState } from 'react';
import { Item, Category, ItemStatus } from '../types';
import { MapPin, Star, MessageSquare, ArrowRight, ShieldCheck, Check, Trash2, Edit3, Clock, AlertCircle } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  onContactOwner: (item: Item) => void;
  onRequestRent: (item: Item) => void;
  isOwnItem?: boolean;
  onDelete?: (item: Item) => void;
  onEdit?: (item: Item) => void;
}

export const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Books':
      return '📚';
    case 'Electronics':
      return '💻';
    case 'Sports':
      return '🏏';
    case 'College Supplies':
      return '🧮';
    default:
      return '📦';
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onContactOwner,
  onRequestRent,
  isOwnItem = false,
  onDelete,
  onEdit,
}) => {
  const [imageError, setImageError] = useState(false);

  // Normalize status
  const status: ItemStatus = item.status || (item.available ? 'available' : 'unavailable');
  const isAvailable = status === 'available';
  const isRequested = status === 'requested';
  const isUnavailable = status === 'unavailable';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5">
      {/* Visual Slot with Mandatory Fallback */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/60 p-4 text-center">
            <span className="text-5xl mb-2 select-none" role="img" aria-label={item.category}>
              {getCategoryIcon(item.category)}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        )}

        {/* Status badges: Green: Available, Orange: Requested, Red: Unavailable */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 flex-wrap justify-end">
          {isOwnItem && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Your Item
            </span>
          )}

          {isUnavailable ? (
            <div className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-200 animate-pulse"></span>
              <span>Unavailable</span>
            </div>
          ) : isRequested ? (
            <div className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse"></span>
              <span>Requested</span>
            </div>
          ) : (
            <div className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200"></span>
              <span>Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Anti-Slop Clean Unboxed Metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5 flex-wrap">
          <span className="text-blue-700 font-semibold">{item.category}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="truncate max-w-[120px]">{item.brand || 'Student gear'}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{item.condition}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Price & Deposit */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              ₹{item.rent}
            </span>
            <span className="text-xs text-slate-500 font-normal"> / day</span>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span>Deposit: </span>
            <span className="font-semibold text-slate-700 tabular-nums">₹{item.deposit}</span>
          </div>
        </div>

        {/* Location & Trust */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[150px]" title={item.location}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-medium text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="tabular-nums font-semibold">{item.trust}%</span>
            <span className="text-[10px] text-amber-600/90 font-normal">Trust</span>
          </div>
        </div>

        {/* Owner Name & Lent Out Details */}
        <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Lender: <strong className="font-medium text-slate-700">{item.owner}</strong></span>
          {isUnavailable && (
            <span className="text-rose-600 font-semibold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
              Currently Lent Out
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-2 grid grid-cols-2 gap-2">
          {isUnavailable ? (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="cursor-pointer w-full py-2 px-3 text-xs font-semibold rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 shadow-xs"
              title="Currently Lent Out - Click to view specifications"
            >
              <Clock className="w-3 h-3 text-rose-600" />
              <span>Currently Lent Out</span>
            </button>
          ) : isRequested ? (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="cursor-pointer w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 shadow-xs"
              title="Requested by a student - Click to view details"
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Requested</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="cursor-pointer w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <span>View & Rent</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onContactOwner(item)}
            className="cursor-pointer w-full py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <span>Message</span>
          </button>
        </div>

        {/* Management Actions ONLY for student's own posted items */}
        {isOwnItem && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="cursor-pointer flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                title="Edit your posted item"
                aria-label={`Edit ${item.title}`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="cursor-pointer flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                title="Delete your posted item"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

