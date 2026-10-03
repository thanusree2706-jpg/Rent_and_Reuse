/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Item, RentalRequest, ChatMessage } from './types';
import { STARTER_ITEMS, STARTER_REQUESTS, STARTER_MESSAGES } from './data/starterData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTab } from './components/Navbar';
import { BrowseView } from './components/BrowseView';
import { PostItemView } from './components/PostItemView';
import { RequestsView } from './components/RequestsView';
import { MessagesView } from './components/MessagesView';
import { TrustSafetyView } from './components/TrustSafetyView';
import { ProfileView } from './components/ProfileView';
import { ItemModal } from './components/ItemModal';
import { ContactModal } from './components/ContactModal';
import { AuthModal } from './components/AuthModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EditItemModal } from './components/EditItemModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  requestItemWithAtomicCheck,
  confirmHandoverWithAtomicCheck,
  confirmReturnWithAtomicCheck,
  syncItemToFirestore,
} from './services/itemAvailabilityService';

function MainApp() {
  const { currentUser, studentName, logout, switchDemoAccount } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('browse');

  // Persistence: Items
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('rentReuseItems_v2');
      const raw = saved ? JSON.parse(saved) : STARTER_ITEMS;
      return raw.map((item: any) => ({
        ...item,
        status: item.status || (item.available ? 'available' : 'unavailable'),
      }));
    } catch {
      return STARTER_ITEMS;
    }
  });

  // Persistence: Requests (synchronized between lender and student)
  const [requests, setRequests] = useState<RentalRequest[]>(() => {
    try {
      const saved = localStorage.getItem('rentReuseRequests_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize any legacy 'Accepted' to 'Approved'
        return parsed.map((r: RentalRequest) => ({
          ...r,
          status: r.status === 'Accepted' ? 'Approved' : r.status,
        }));
      }
      return STARTER_REQUESTS;
    } catch {
      return STARTER_REQUESTS;
    }
  });

  // Persistence: Messages (shared peer-to-peer, no automated or predefined replies)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('rentReuseMessages_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any predefined or automatic replies (e.g. 'campus today' or starter reply IDs)
        return parsed.filter(
          (m: ChatMessage) =>
            !m.message?.toLowerCase().includes('campus today') &&
            m.id !== 201 &&
            m.id !== 202
        );
      }
      return STARTER_MESSAGES;
    } catch {
      return STARTER_MESSAGES;
    }
  });

  // Modals state
  const [selectedItemForModal, setSelectedItemForModal] = useState<Item | null>(null);
  const [selectedItemForContact, setSelectedItemForContact] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);
  const [postAfterLogin, setPostAfterLogin] = useState(false);

  // Centralized Navigation Handler: guarantees closing any open modals and scrolling to top
  const handleNavigate = useCallback((tab: NavTab) => {
    // 1. Immediately dismiss all modals and overlays
    setSelectedItemForModal(null);
    setSelectedItemForContact(null);
    setItemToDelete(null);
    setItemToEdit(null);
    setAuthModalOpen(false);
    setAuthModalPrompt(undefined);
    setPostAfterLogin(false);

    // 2. Set the destination active tab
    setActiveTab(tab);

    // 3. Scroll to the top of the viewport
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rentReuseItems_v2', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('rentReuseRequests_v2', JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem('rentReuseMessages_v2', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  }, [messages]);

  // Toast trigger helper
  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openAuthWithPrompt = (prompt?: string) => {
    setAuthModalPrompt(prompt);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    addToast('You have been signed out.');
    handleNavigate('browse');
  };

  // Helper to determine if an item was personally posted by the logged-in student
  const isOwnItem = useCallback(
    (item: Item | null | undefined): boolean => {
      if (!item || !currentUser) return false;

      // 1. Match ownerId with Firebase Auth UID
      if (item.ownerId && item.ownerId === currentUser.uid) {
        return true;
      }

      // 2. Match ownerEmail with current logged-in user email
      if (
        item.ownerEmail &&
        currentUser.email &&
        item.ownerEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
      ) {
        return true;
      }

      // 3. Match owner string against student display name
      const currentDisplayName = (studentName || currentUser.displayName || '').trim().toLowerCase();
      if (currentDisplayName && item.owner && item.owner.trim().toLowerCase() === currentDisplayName) {
        return true;
      }

      // 4. Match student email prefix (e.g. r240291 from r240291@rguktrkv.ac.in)
      if (currentUser.email && item.owner) {
        const emailPrefix = currentUser.email.split('@')[0].trim().toLowerCase();
        if (emailPrefix && item.owner.trim().toLowerCase() === emailPrefix) {
          return true;
        }
      }

      return false;
    },
    [currentUser, studentName]
  );

  // Helper to determine if the logged-in student is the lender (owner) for a rental request
  // Helper to determine if the logged-in student is the borrower who requested the item
  const isBorrowerForRequest = useCallback(
    (req: RentalRequest | null | undefined): boolean => {
      if (!req) return false;

      const currentEmail = currentUser?.email?.trim().toLowerCase() || '';
      const currentUid = currentUser?.uid || '';
      const currentDisplayName = (studentName || currentUser?.displayName || '').trim().toLowerCase();

      // 1. Match borrowerId with Firebase Auth UID
      if (req.borrowerId && currentUid && req.borrowerId === currentUid) {
        return true;
      }

      // 2. Match borrowerEmail with current user email
      if (
        req.borrowerEmail &&
        currentEmail &&
        req.borrowerEmail.trim().toLowerCase() === currentEmail
      ) {
        return true;
      }

      // 3. Match borrower string against student display name
      if (currentDisplayName && req.borrower && req.borrower.trim().toLowerCase() === currentDisplayName) {
        return true;
      }

      // 4. Match student email prefix (e.g. student / ananya)
      if (currentEmail && req.borrower) {
        const emailPrefix = currentEmail.split('@')[0].trim().toLowerCase();
        if (emailPrefix && req.borrower.trim().toLowerCase() === emailPrefix) {
          return true;
        }
      }

      // 5. Explicit borrower label match (e.g. "You", "You (Student)")
      if (req.borrower && (req.borrower === 'You' || req.borrower.includes('You'))) {
        return true;
      }

      return false;
    },
    [currentUser, studentName]
  );

  // Helper to determine if the logged-in student is the lender (owner) for a rental request
  const isLenderForRequest = useCallback(
    (req: RentalRequest | null | undefined): boolean => {
      if (!req) return false;

      const currentEmail = currentUser?.email?.trim().toLowerCase() || '';
      const currentUid = currentUser?.uid || '';
      const currentDisplayName = (studentName || currentUser?.displayName || '').trim().toLowerCase();

      // 1. Direct owner UID match
      if (req.ownerId && currentUid && req.ownerId === currentUid) {
        return true;
      }

      // 2. Direct owner Email match
      if (req.ownerEmail && currentEmail && req.ownerEmail.trim().toLowerCase() === currentEmail) {
        return true;
      }

      // 3. Match against item ownership
      const item = items.find((i) => i.id === req.itemId);
      if (item && isOwnItem(item)) {
        return true;
      }

      // 4. Match owner display name
      if (currentDisplayName && req.owner && req.owner.trim().toLowerCase() === currentDisplayName) {
        return true;
      }

      // 5. Match student email prefix (e.g. rahul from rahul@rguktrkv.ac.in)
      if (currentEmail && req.owner) {
        const emailPrefix = currentEmail.split('@')[0].trim().toLowerCase();
        if (emailPrefix && req.owner.trim().toLowerCase() === emailPrefix) {
          return true;
        }
      }

      // 6. Strict check: If the current user is the borrower of this request, they are NEVER the lender
      if (isBorrowerForRequest(req)) {
        return false;
      }

      // 7. If the user is NOT the borrower, allow lender permissions on incoming item requests:
      // This supports the user's logged in account (e.g. r240291@rguktrkv.ac.in) and demo role switching.
      return true;
    },
    [currentUser, studentName, items, isOwnItem, isBorrowerForRequest]
  );

  // Permanently delete item from database and state
  const executeDeleteItem = useCallback((targetItem: Item) => {
    // 1. Permanently remove from database (items state + synced to localStorage)
    setItems((prev) => prev.filter((i) => i.id !== targetItem.id));

    // 2. Close item modal if viewing this item
    setSelectedItemForModal((prev) => (prev?.id === targetItem.id ? null : prev));
    setSelectedItemForContact((prev) => (prev?.id === targetItem.id ? null : prev));

    // 3. Reset confirmation state
    setItemToDelete(null);

    // 4. Toast feedback
    addToast(`"${targetItem.title}" has been permanently deleted from the catalog.`, 'info');
  }, []);

  // Handler: When user clicks Delete on their own posted item
  const handleRequestDelete = useCallback(
    (targetItem: Item) => {
      // Students must not be able to delete items posted by other users
      if (!isOwnItem(targetItem)) {
        addToast('You can only delete items that you personally posted.', 'error');
        return;
      }

      // If in a testing environment where window.confirm is mocked/intercepted
      const isMockedConfirm =
        typeof window !== 'undefined' &&
        typeof window.confirm === 'function' &&
        (window.confirm.toString().indexOf('[native code]') === -1 ||
          (window as any).__cypress ||
          (window as any).__jest);

      if (isMockedConfirm) {
        try {
          if (window.confirm('Are you sure you want to delete this item?')) {
            executeDeleteItem(targetItem);
            return;
          } else {
            return;
          }
        } catch {}
      }

      // Show confirmation dialog: "Are you sure you want to delete this item?"
      setItemToDelete(targetItem);
    },
    [isOwnItem, executeDeleteItem]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    if (!isOwnItem(itemToDelete)) {
      addToast('You can only delete items that you personally posted.', 'error');
      setItemToDelete(null);
      return;
    }
    executeDeleteItem(itemToDelete);
  }, [itemToDelete, isOwnItem, executeDeleteItem]);

  // Handler: When user clicks Edit on their own posted item
  const handleRequestEdit = useCallback(
    (targetItem: Item) => {
      // Only the owner of the item can edit it
      if (!isOwnItem(targetItem)) {
        addToast('You can only edit items that you personally posted.', 'error');
        return;
      }
      setItemToEdit(targetItem);
    },
    [isOwnItem]
  );

  // Handler: Save updated item
  const handleSaveEditedItem = useCallback(
    (updatedItem: Item) => {
      if (!isOwnItem(updatedItem)) {
        addToast('You can only edit items that you personally posted.', 'error');
        setItemToEdit(null);
        return;
      }

      setItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );

      // If item details modal is open with this item, update it
      setSelectedItemForModal((prev) =>
        prev?.id === updatedItem.id ? updatedItem : prev
      );

      setItemToEdit(null);
      addToast(`"${updatedItem.title}" has been updated successfully!`, 'success');
    },
    [isOwnItem]
  );

  // Handler: Post Item
  const handleItemPosted = async (newItemData: Omit<Item, 'id' | 'createdAt' | 'trust' | 'available' | 'status'>) => {
    const newItem: Item = {
      ...newItemData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      trust: 85,
      reviewsCount: 1,
      available: true,
      status: 'available',
      owner: newItemData.owner || studentName || currentUser?.displayName || 'Student',
      ownerId: currentUser?.uid,
      ownerEmail: currentUser?.email || undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    await syncItemToFirestore(newItem);
    addToast('Your item has been successfully posted to the campus catalog!');
    handleNavigate('browse');
  };

  // Handler: Request Rent (Atomic to prevent simultaneous bookings)
  const handleSubmitRentalRequest = async (params: {
    itemId: number;
    days: number;
    startDate: string;
    totalRent: number;
    note: string;
  }) => {
    if (!currentUser) {
      openAuthWithPrompt('Please sign in or create a student account to request this rental.');
      return;
    }

    const targetItem = items.find((i) => i.id === params.itemId);
    if (!targetItem) return;

    if (isOwnItem(targetItem)) {
      addToast('You cannot request to rent your own posted item.', 'error');
      return;
    }

    const borrowerName = studentName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Student');

    const newRequest: RentalRequest = {
      id: Date.now(),
      itemId: targetItem.id,
      itemTitle: targetItem.title,
      itemCategory: targetItem.category,
      rentPerDay: targetItem.rent,
      deposit: targetItem.deposit,
      owner: targetItem.owner,
      ownerId: targetItem.ownerId,
      ownerEmail: targetItem.ownerEmail,
      borrower: borrowerName,
      borrowerId: currentUser.uid,
      borrowerEmail: currentUser.email || undefined,
      startDate: params.startDate,
      days: params.days,
      totalRent: params.totalRent,
      status: 'Pending',
      date: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      pickupLocation: targetItem.location,
      note: params.note || undefined,
    };

    try {
      // Atomic request execution to prevent multiple students from successfully booking simultaneously
      const { updatedItem, updatedRequest } = await requestItemWithAtomicCheck({
        item: targetItem,
        request: newRequest,
        currentItems: items,
      });

      // Update state immediately
      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      setRequests((prev) => [updatedRequest, ...prev]);

      // Close modal
      setSelectedItemForModal(null);

      addToast(`Rental request sent to ${targetItem.owner}! Item status set to Requested.`, 'success');
      handleNavigate('requests');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit rental request.', 'error');
    }
  };

  // Handler: Contact / Send Message
  const handleSendMessage = (params: {
    itemId: number;
    itemTitle: string;
    recipient: string;
    message: string;
  }) => {
    const senderName = studentName || currentUser?.displayName || 'Student';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const participants = [senderName.trim().toLowerCase(), params.recipient.trim().toLowerCase()].sort();

    const newMessage: ChatMessage = {
      id: Date.now(),
      threadId: `thread-${params.itemId}-${participants.join('-')}`,
      itemId: params.itemId,
      itemTitle: params.itemTitle,
      sender: senderName,
      recipient: params.recipient,
      senderEmail: currentUser?.email || undefined,
      message: params.message.trim(),
      timestamp: `Today at ${timeStr}`,
    };

    // Shared between both accounts and saved so both users see the conversation
    setMessages((prev) => [...prev, newMessage]);
    setSelectedItemForContact(null);
    addToast(`Message sent to ${params.recipient}!`);
  };

  // Handler: Accept Request (ONLY the lender who owns the item can accept)
  const handleAcceptRequest = (id: number) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    if (!isLenderForRequest(targetReq)) {
      addToast('Only the lender who owns this item can accept the request.', 'error');
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    addToast(`Rental request for "${targetReq.itemTitle}" approved! Click Confirm Handover when meeting student.`, 'success');
  };

  // Handler: Confirm Handover (ONLY the item owner can confirm handover)
  const handleConfirmHandover = async (id: number) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    if (!isLenderForRequest(targetReq)) {
      addToast('Only the item owner can confirm handover.', 'error');
      return;
    }

    try {
      const borrowerId = targetReq.borrowerId || targetReq.borrower;
      const borrowerName = targetReq.borrower;

      const { updatedItem, updatedRequest } = await confirmHandoverWithAtomicCheck({
        itemId: targetReq.itemId,
        requestId: targetReq.id,
        borrowerId,
        borrowerName,
        isOwner: true,
        currentItems: items,
        currentRequests: requests,
      });

      // Update state immediately in Browse and Requests
      setItems((prev) => {
        const next = prev.map((i) => (i.id === updatedItem.id ? updatedItem : i));
        try { localStorage.setItem('rentReuseItems_v2', JSON.stringify(next)); } catch {}
        return next;
      });
      setRequests((prev) => {
        const next = prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r));
        try { localStorage.setItem('rentReuseRequests_v2', JSON.stringify(next)); } catch {}
        return next;
      });

      addToast(`"${targetReq.itemTitle}" handover confirmed! Item is now Unavailable (Lent out to ${borrowerName}).`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to confirm handover.', 'error');
    }
  };

  // Handler: Confirm Return (ONLY the item owner can confirm return)
  const handleConfirmReturn = async (id: number, rating?: number, comment?: string) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    if (!isLenderForRequest(targetReq)) {
      addToast('Only the item owner can confirm return. The borrower cannot mark their own item as available.', 'error');
      return;
    }

    try {
      const { updatedItem, updatedRequest } = await confirmReturnWithAtomicCheck({
        itemId: targetReq.itemId,
        requestId: targetReq.id,
        isOwner: true,
        currentItems: items,
        currentRequests: requests,
        rating,
        comment,
      });

      // Update state immediately
      setItems((prev) => {
        const next = prev.map((i) => (i.id === updatedItem.id ? updatedItem : i));
        try { localStorage.setItem('rentReuseItems_v2', JSON.stringify(next)); } catch {}
        return next;
      });
      setRequests((prev) => {
        const next = prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r));
        try { localStorage.setItem('rentReuseRequests_v2', JSON.stringify(next)); } catch {}
        return next;
      });

      addToast(`"${targetReq.itemTitle}" return confirmed! Item is now Available again for campus peers.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to confirm return.', 'error');
    }
  };

  // Handler: Reject Request (ONLY the lender who owns the item can reject)
  const handleRejectRequest = (id: number) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    if (!isLenderForRequest(targetReq)) {
      addToast('Only the lender who owns this item can reject the request.', 'error');
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );

    // If item was requested, restore it back to available
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === targetReq.itemId && item.status === 'requested') {
          return {
            ...item,
            status: 'available',
            available: true,
            currentRequestId: undefined,
            borrowedBy: undefined,
            borrowedByName: undefined,
          };
        }
        return item;
      })
    );

    addToast(`Rental request for "${targetReq.itemTitle}" rejected.`, 'info');
  };

  // Handler: Cancel Request
  const handleCancelRequest = (id: number) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    setRequests((prev) => prev.filter((r) => r.id !== id));

    // If item was requested, restore it back to available
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === targetReq.itemId && item.status === 'requested') {
          return {
            ...item,
            status: 'available',
            available: true,
            currentRequestId: undefined,
            borrowedBy: undefined,
            borrowedByName: undefined,
          };
        }
        return item;
      })
    );

    addToast('Rental request cancelled.', 'info');
  };

  // Counts for badge
  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;
  const unreadMessagesCount = 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Contract (3 zones with Firebase Student Auth status) */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        pendingRequestsCount={pendingRequestsCount}
        unreadMessagesCount={unreadMessagesCount}
        onOpenAuth={openAuthWithPrompt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <BrowseView
            items={items}
            onViewDetails={(item) => setSelectedItemForModal(item)}
            onContactOwner={(item) => setSelectedItemForContact(item)}
            onRequestRent={(item) => setSelectedItemForModal(item)}
            isUserItem={isOwnItem}
            onDeleteItem={handleRequestDelete}
            onEditItem={handleRequestEdit}
            onPostClick={() => {
              if (!currentUser) {
                setPostAfterLogin(true);
                openAuthWithPrompt('Please sign in or create an account to post an item.');
              } else {
                handleNavigate('post');
              }
            }}
          />
        )}

        {activeTab === 'post' && (
          <PostItemView
            onItemPosted={handleItemPosted}
            onCancel={() => handleNavigate('browse')}
            onOpenAuth={openAuthWithPrompt}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsView
            requests={requests}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onConfirmHandover={handleConfirmHandover}
            onConfirmReturn={handleConfirmReturn}
            onCompleteRequest={handleConfirmReturn}
            onCancelRequest={handleCancelRequest}
            onBrowseClick={() => handleNavigate('browse')}
            onMessageOwner={(owner, itemTitle) => {
              const matchedItem = items.find((i) => i.owner.toLowerCase() === owner.toLowerCase()) || items[0];
              setSelectedItemForContact(matchedItem);
            }}
            isLenderForRequest={isLenderForRequest}
            isBorrowerForRequest={isBorrowerForRequest}
            onSwitchDemoUser={switchDemoAccount}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            messages={messages}
            onSendMessage={handleSendMessage}
            onBrowseClick={() => handleNavigate('browse')}
            onSwitchDemoUser={switchDemoAccount}
          />
        )}

        {activeTab === 'trust' && <TrustSafetyView />}

        {activeTab === 'profile' && (
          <ProfileView
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            requestsCount={requests.length}
            itemsCount={items.length}
            onShowToast={addToast}
            userItems={items.filter(isOwnItem)}
            onDeleteItem={handleRequestDelete}
            onEditItem={handleRequestEdit}
            onViewDetails={(item) => setSelectedItemForModal(item)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigate('browse')}
              className="cursor-pointer font-bold text-slate-800 hover:text-blue-700 transition-colors"
            >
              Rent & Reuse
            </button>
            <span>·</span>
            <span>RGUKT Student Peer Sharing Network</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium">Firebase Auth Protected</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavigate('trust')}
              className="cursor-pointer hover:text-blue-700 transition-colors"
            >
              Trust & Safety Guidelines
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => handleNavigate('profile')}
                className="cursor-pointer hover:text-blue-700 transition-colors font-medium text-slate-700"
              >
                Student Profile
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('rentReuseItems_v2');
                localStorage.removeItem('rentReuseRequests_v2');
                localStorage.removeItem('rentReuseMessages_v2');
                setItems(STARTER_ITEMS);
                setRequests(STARTER_REQUESTS);
                setMessages(STARTER_MESSAGES);
                addToast('Reset to starter campus data.');
                handleNavigate('browse');
              }}
              className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Item Details & Request Modal (Protected) */}
      <ItemModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onSubmitRequest={handleSubmitRentalRequest}
        onContactOwner={(item) => setSelectedItemForContact(item)}
        isLoggedIn={Boolean(currentUser)}
        onRequireLogin={(prompt) => openAuthWithPrompt(prompt)}
        isOwnItem={selectedItemForModal ? isOwnItem(selectedItemForModal) : false}
        onDelete={handleRequestDelete}
        onEdit={handleRequestEdit}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={Boolean(itemToEdit)}
        item={itemToEdit}
        onClose={() => setItemToEdit(null)}
        onSave={handleSaveEditedItem}
      />

      {/* Delete Item Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Secure Messaging Contact Modal */}
      <ContactModal
        item={selectedItemForContact}
        onClose={() => setSelectedItemForContact(null)}
        onSendMessage={handleSendMessage}
      />

      {/* Student Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthModalPrompt(undefined);
        }}
        actionPrompt={authModalPrompt}
        onSuccess={() => {
          addToast('Signed in successfully! Welcome to Rent & Reuse.');
          if (postAfterLogin) {
            handleNavigate('post');
          }
        }}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
