import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  runTransaction,
  isFirebaseConfigured,
} from '../firebase';
import { Item, RentalRequest, ItemStatus } from '../types';

const ITEMS_COLLECTION = 'items';
const REQUESTS_COLLECTION = 'rental_requests';

/**
 * Sync item to Firebase Firestore
 */
export async function syncItemToFirestore(item: Item): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, String(item.id));
    await setDoc(itemRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('[Firebase] syncItemToFirestore fallback:', error);
  }
}

/**
 * Sync rental request to Firebase Firestore
 */
export async function syncRequestToFirestore(request: RentalRequest): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const reqRef = doc(db, REQUESTS_COLLECTION, String(request.id));
    await setDoc(reqRef, {
      ...request,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('[Firebase] syncRequestToFirestore fallback:', error);
  }
}

/**
 * 2. Atomic Rental Request Creation
 * Uses Firebase transaction when available to prevent multiple students from
 * successfully booking the same item simultaneously.
 */
export async function requestItemWithAtomicCheck(params: {
  item: Item;
  request: RentalRequest;
  currentItems: Item[];
}): Promise<{ updatedItem: Item; updatedRequest: RentalRequest }> {
  const { item, request, currentItems } = params;

  // 1. Local atomic check on latest in-memory state
  const latestItem = currentItems.find((i) => i.id === item.id) || item;
  const currentStatus: ItemStatus = latestItem.status || (latestItem.available ? 'available' : 'unavailable');

  if (currentStatus === 'unavailable') {
    throw new Error('This item is currently lent out and unavailable for booking.');
  }
  if (currentStatus === 'requested') {
    throw new Error('This item has already been requested by another student. Simultaneous requests are prevented.');
  }

  const updatedItem: Item = {
    ...latestItem,
    status: 'requested',
    available: false,
    currentRequestId: request.id,
    borrowedBy: request.borrowerId || request.borrower,
    borrowedByName: request.borrower,
  };

  const updatedRequest: RentalRequest = {
    ...request,
    status: 'Pending',
  };

  // 2. Firebase Firestore Transaction (Atomic lock on database document)
  if (isFirebaseConfigured()) {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, String(item.id));
      const reqRef = doc(db, REQUESTS_COLLECTION, String(request.id));

      await runTransaction(db, async (transaction) => {
        const itemSnap = await transaction.get(itemRef);
        if (itemSnap.exists()) {
          const remoteData = itemSnap.data();
          const remoteStatus = remoteData.status || (remoteData.available ? 'available' : 'unavailable');
          if (remoteStatus !== 'available') {
            throw new Error('This item was just booked or requested by another student.');
          }
          transaction.update(itemRef, {
            status: 'requested',
            available: false,
            currentRequestId: request.id,
            borrowedBy: request.borrowerId || request.borrower,
            borrowedByName: request.borrower,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // If document doesn't exist yet in Firestore, initialize it
          transaction.set(itemRef, {
            ...updatedItem,
            updatedAt: new Date().toISOString(),
          });
        }

        // Save request record
        transaction.set(reqRef, {
          ...updatedRequest,
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err: any) {
      if (err.message && err.message.includes('booked or requested')) {
        throw err;
      }
      console.warn('[Firebase Transaction] Network/auth warning, persisting locally:', err);
    }
  }

  return { updatedItem, updatedRequest };
}

/**
 * 3. Confirm Handover
 * When the owner clicks "Confirm Handover":
 * - Change the item's Firebase status to "unavailable".
 * - Record the borrower ID.
 * - Update the item immediately in the Browse page.
 * - Display an "Unavailable" badge on the item.
 * - Disable the Request Item button for other students.
 * - Prevent other students from requesting this item.
 */
export async function confirmHandoverWithAtomicCheck(params: {
  itemId: number;
  requestId: number;
  borrowerId: string;
  borrowerName: string;
  isOwner: boolean;
  currentItems: Item[];
  currentRequests: RentalRequest[];
}): Promise<{ updatedItem: Item; updatedRequest: RentalRequest }> {
  const { itemId, requestId, borrowerId, borrowerName, isOwner, currentItems, currentRequests } = params;

  if (!isOwner) {
    throw new Error('Only the item owner can confirm handover.');
  }

  const targetItem = currentItems.find((i) => i.id === itemId);
  if (!targetItem) {
    throw new Error('Item not found.');
  }

  const targetReq = currentRequests.find((r) => r.id === requestId);
  if (!targetReq) {
    throw new Error('Rental request not found.');
  }

  const updatedItem: Item = {
    ...targetItem,
    status: 'unavailable',
    available: false,
    borrowedBy: borrowerId,
    borrowedByName: borrowerName,
    borrowedAt: new Date().toISOString(),
    currentRequestId: requestId,
  };

  const updatedRequest: RentalRequest = {
    ...targetReq,
    status: 'Active',
    handedOver: true,
  };

  // Firebase Firestore Update (One atomic transaction for item and request)
  if (isFirebaseConfigured()) {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, String(itemId));
      const reqRef = doc(db, REQUESTS_COLLECTION, String(requestId));

      await runTransaction(db, async (transaction) => {
        transaction.set(
          itemRef,
          {
            ...updatedItem,
            status: 'unavailable',
            available: false,
            borrowedBy: borrowerId,
            borrowedByName: borrowerName,
            borrowedAt: new Date().toISOString(),
            currentRequestId: requestId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        transaction.set(
          reqRef,
          {
            ...updatedRequest,
            status: 'Active',
            handedOver: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });
    } catch (err) {
      console.warn('[Firebase] Handover transaction warning, saved locally:', err);
    }
  }

  return { updatedItem, updatedRequest };
}

/**
 * 4. Confirm Return
 * When the owner clicks "Confirm Return":
 * - Change the item status back to "available".
 * - Clear the borrowedBy field.
 * - Allow other students to request the item again.
 * - Update the Browse page immediately.
 * - ONLY the item owner can confirm return.
 */
export async function confirmReturnWithAtomicCheck(params: {
  itemId: number;
  requestId: number;
  isOwner: boolean;
  currentItems: Item[];
  currentRequests: RentalRequest[];
  rating?: number;
  comment?: string;
}): Promise<{ updatedItem: Item; updatedRequest: RentalRequest }> {
  const { itemId, requestId, isOwner, currentItems, currentRequests, rating, comment } = params;

  if (!isOwner) {
    throw new Error('Only the item owner can confirm return. The borrower cannot mark their own item as available.');
  }

  const targetItem = currentItems.find((i) => i.id === itemId);
  if (!targetItem) {
    throw new Error('Item not found.');
  }

  const targetReq = currentRequests.find((r) => r.id === requestId);
  if (!targetReq) {
    throw new Error('Rental request not found.');
  }

  const currentTrust = targetItem.trust || 85;
  const updatedTrust = Math.min(100, currentTrust + 2);

  const updatedItem: Item = {
    ...targetItem,
    status: 'available',
    available: true,
    borrowedBy: undefined,
    borrowedByName: undefined,
    borrowedAt: undefined,
    currentRequestId: undefined,
    trust: updatedTrust,
    reviewsCount: (targetItem.reviewsCount || 0) + 1,
  };

  const updatedRequest: RentalRequest = {
    ...targetReq,
    status: 'Completed',
    returned: true,
    ratingGiven: rating || 5,
    reviewComment: comment || targetReq.reviewComment,
  };

  // Firebase Firestore Update
  if (isFirebaseConfigured()) {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, String(itemId));
      const reqRef = doc(db, REQUESTS_COLLECTION, String(requestId));

      await runTransaction(db, async (transaction) => {
        transaction.set(
          itemRef,
          {
            status: 'available',
            available: true,
            borrowedBy: null,
            borrowedByName: null,
            borrowedAt: null,
            currentRequestId: null,
            trust: updatedTrust,
            reviewsCount: (targetItem.reviewsCount || 0) + 1,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        transaction.set(
          reqRef,
          {
            status: 'Completed',
            returned: true,
            ratingGiven: rating || 5,
            reviewComment: comment || targetReq.reviewComment || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });
    } catch (err) {
      console.warn('[Firebase] Return transaction warning, saved locally:', err);
    }
  }

  return { updatedItem, updatedRequest };
}
