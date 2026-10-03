import React, { useState } from 'react';
import { Item, Category } from '../types';
import { MapPin, Star, MessageSquare, ArrowRight, ShieldCheck, Check, Trash2, Edit3 } from 'lucide-react';

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

        {/* Quiet availability marker & Own Item badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {isOwnItem && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Your Item
            </span>
          )}
          <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Available</span>
          </div>
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

        {/* Owner Name */}
        <div className="mt-1 text-[11px] text-slate-400">
          Lender: <span className="font-medium text-slate-700">{item.owner}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            className="cursor-pointer w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <span>View & Rent</span>
            <ArrowRight className="w-3 h-3" />
          </button>

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
