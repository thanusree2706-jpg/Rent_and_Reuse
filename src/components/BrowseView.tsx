import React, { useState, useMemo } from 'react';
import { Item, Category, ItemCondition } from '../types';
import { ItemCard, getCategoryIcon } from './ItemCard';
import { HeroBanner } from './HeroBanner';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter } from 'lucide-react';

interface BrowseViewProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
  onContactOwner: (item: Item) => void;
  onRequestRent: (item: Item) => void;
  onPostClick: () => void;
  isUserItem?: (item: Item) => boolean;
  onDeleteItem?: (item: Item) => void;
  onEditItem?: (item: Item) => void;
}

const CATEGORIES: Category[] = ['College Supplies', 'Books', 'Electronics', 'Sports', 'Other'];

export const BrowseView: React.FC<BrowseViewProps> = ({
  items,
  onViewDetails,
  onContactOwner,
  onRequestRent,
  onPostClick,
  isUserItem,
  onDeleteItem,
  onEditItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'trust'>('default');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [maxRent, setMaxRent] = useState<number>(100);
  const [showFilters, setShowFilters] = useState(false);

  // Safe filter and sort items
  const filteredItems = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const q = (search || '').toLowerCase().trim();

    return list.filter((item) => {
      if (!item) return false;
      const title = String(item.title || '').toLowerCase();
      const brand = String(item.brand || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      const loc = String(item.location || '').toLowerCase();
      const owner = String(item.owner || '').toLowerCase();

      const matchSearch =
        !q ||
        title.includes(q) ||
        brand.includes(q) ||
        desc.includes(q) ||
        loc.includes(q) ||
        owner.includes(q);

      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchCondition = selectedCondition === 'All' || item.condition === selectedCondition;
      const matchPrice = typeof item.rent === 'number' ? item.rent <= maxRent : true;

      return matchSearch && matchCategory && matchCondition && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.rent || 0) - (b.rent || 0);
      if (sortBy === 'price-desc') return (b.rent || 0) - (a.rent || 0);
      if (sortBy === 'trust') return (b.trust || 0) - (a.trust || 0);
      return (b.id || 0) - (a.id || 0); // Newest first
    });
  }, [items, search, selectedCategory, sortBy, selectedCondition, maxRent]);

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedCondition !== 'All' ||
    maxRent < 100 ||
    sortBy !== 'default';

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMaxRent(100);
    setSortBy('default');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner with Call to Actions */}
      <HeroBanner
        onPostClick={onPostClick}
        onExploreClick={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Catalog & Filter Section */}
      <div id="catalog-section" className="space-y-4">
        {/* Search & Main Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, Casio calculator, drafter, sports gear, hostellers..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[150px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="default">Newest First</option>
                <option value="price-asc">Lowest Rent (₹/day)</option>
                <option value="price-desc">Highest Rent</option>
                <option value="trust">Highest Trust Score</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                showFilters || maxRent < 100 || selectedCondition !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {(maxRent < 100 || selectedCondition !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs (Functional Segmented Control) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items ({Array.isArray(items) ? items.length : 0})
          </button>
          {CATEGORIES.map((category) => {
            const count = Array.isArray(items)
              ? items.filter((item) => item?.category === category).length
              : 0;
            const isSelected = selectedCategory === category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{category}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Expandable Filter Drawer */}
        {showFilters && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Max Daily Rent
                </label>
                <span className="text-xs font-bold text-blue-700 tabular-nums">
                  Up to ₹{maxRent}/day
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹10</span>
                <span>₹50</span>
                <span>₹100</span>
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Item Condition
              </label>
              <div className="flex items-center gap-2">
                {['All', 'New', 'Good', 'Fair'].map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedCondition === cond
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Controls */}
            <div className="flex items-end justify-start sm:justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <div>
            Showing <span className="font-semibold text-slate-800 tabular-nums">{filteredItems.length}</span>{' '}
            {filteredItems.length === 1 ? 'item' : 'items'} available for campus rental
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear active filters
            </button>
          )}
        </div>

        {/* Item Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewDetails}
                onContactOwner={onContactOwner}
                onRequestRent={onRequestRent}
                isOwnItem={isUserItem ? isUserItem(item) : false}
                onDelete={onDeleteItem}
                onEdit={onEditItem}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No matching campus items</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              No items matched your current search filters or category. Try searching another keyword or clear your filters.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={onPostClick}
                className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
              >
                + Post this Item Instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
