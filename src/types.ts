export type Category = 'Books' | 'Electronics' | 'Sports' | 'College Supplies' | 'Other';
export type ItemCondition = 'New' | 'Good' | 'Fair';
export type ItemStatus = 'available' | 'requested' | 'unavailable';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Accepted' | 'Completed' | 'Cancelled';

export interface Item {
  id: number;
  title: string;
  category: Category;
  brand?: string;
  rent: number; // in ₹ per day
  deposit: number; // in ₹ refundable
  location: string; // e.g. "College Library", "CSE Block"
  condition: ItemCondition;
  description: string;
  owner: string;
  ownerId?: string;
  ownerEmail?: string;
  trust: number; // 0 - 100
  reviewsCount?: number;
  imageUrl?: string;
  available: boolean;
  status: ItemStatus; // 'available' | 'requested' | 'unavailable'
  borrowedBy?: string; // borrower ID or borrower email/uid
  borrowedByName?: string; // student display name
  borrowedAt?: string;
  currentRequestId?: number;
  createdAt: string;
}

export interface RentalRequest {
  id: number;
  itemId: number;
  itemTitle: string;
  itemCategory: Category;
  rentPerDay: number;
  deposit: number;
  owner: string;
  ownerId?: string;
  ownerEmail?: string;
  borrower: string;
  borrowerId?: string;
  borrowerEmail?: string;
  startDate: string;
  days: number;
  totalRent: number;
  status: RequestStatus;
  date: string;
  pickupLocation: string;
  note?: string;
  ratingGiven?: number;
  reviewComment?: string;
  handedOver?: boolean;
  returned?: boolean;
}

export interface ChatMessage {
  id: number;
  threadId: string;
  itemId: number;
  itemTitle: string;
  sender: string;
  recipient: string;
  senderEmail?: string;
  recipientEmail?: string;
  message: string;
  timestamp: string;
  isOwnerReply?: boolean;
}
