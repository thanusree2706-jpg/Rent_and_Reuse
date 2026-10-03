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
 * Live subscription to Firestore items collection
 * Ensures BrowseView and Item listings always display the updated Firestore status ('unavailable', 'available', etc.)
 * and refresh immediately after transactions.
 */
export function subscribeToFirestoreItems(
  onUpdate: (remoteItems: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const itemsCol = collection(db, ITEMS_COLLECTION);
    return onSnapshot(
      itemsCol,
      (snapshot) => {
        const itemsList: Item[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const id = Number(docSnap.id) || Number(data.id);
          if (id) {
            const rawStatus: ItemStatus = data.status || (data.available ? 'available' : 'unavailable');
            itemsList.push({
              ...(data as Item),
              id,
              status: rawStatus,
              available: rawStatus === 'available',
            });
          }
        });
        onUpdate(itemsList);
      },
      (err) => {
        console.warn('[Firestore] items onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('[Firestore] failed to bind items subscription:', err);
    return () => {};
  }
}

/**
 * Live subscription to Firestore rental requests collection
 */
export function subscribeToFirestoreRequests(
  onUpdate: (remoteRequests: RentalRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const reqCol = collection(db, REQUESTS_COLLECTION);
    return onSnapshot(
      reqCol,
      (snapshot) => {
        const reqList: RentalRequest[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const id = Number(docSnap.id) || Number(data.id);
          if (id) {
            reqList.push({
              ...(data as RentalRequest),
              id,
              itemId: Number(data.itemId),
            });
          }
        });
        onUpdate(reqList);
      },
      (err) => {
        console.warn('[Firestore] requests onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('[Firestore] failed to bind requests subscription:', err);
    return () => {};
  }
}

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
 * Atomic Rental Request Creation
 * Uses Firebase transaction to prevent multiple students from booking the same item simultaneously.
 */
export async function requestItemWithAtomicCheck(params: {
  item: Item;
  request: RentalRequest;
  currentItems: Item[];
}): Promise<{ updatedItem: Item; updatedRequest: RentalRequest }> {
  const { item, request, currentItems } = params;

  // 1. Local atomic check on latest state
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

  // 2. Firebase Firestore Transaction
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
          transaction.set(itemRef, {
            ...remoteData,
            status: 'requested',
            available: false,
            currentRequestId: request.id,
            borrowedBy: request.borrowerId || request.borrower,
            borrowedByName: request.borrower,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } else {
          transaction.set(itemRef, {
            ...updatedItem,
            updatedAt: new Date().toISOString(),
          });
        }

        transaction.set(reqRef, {
          ...updatedRequest,
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err: any) {
      if (err.message && err.message.includes('booked or requested')) {
        throw err;
      }
      console.warn('[Firebase Transaction] fallback notice:', err);
    }
  }

  return { updatedItem, updatedRequest };
}

/**
 * Confirm Handover
 * When the lender clicks "Confirm Handover":
 * - In one Firestore transaction, update item status to 'unavailable' (and available: false)
 * - In the same transaction, update request status to 'Active' (handedOver: true)
 * - Real-time listener immediately refreshes the Browse listing to 'Unavailable'
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
        // Reads before writes (Firestore transaction requirement)
        const itemSnap = await transaction.get(itemRef);
        const reqSnap = await transaction.get(reqRef);

        const existingItemData = itemSnap.exists() ? itemSnap.data() : targetItem;
        const existingReqData = reqSnap.exists() ? reqSnap.data() : targetReq;

        // Atomic write 1: Set item status to 'unavailable' and available to false
        transaction.set(
          itemRef,
          {
            ...existingItemData,
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

        // Atomic write 2: Set request status to 'Active' / 'Handed Over'
        transaction.set(
          reqRef,
          {
            ...existingReqData,
            status: 'Active',
            handedOver: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      console.log(`[Firestore Transaction] Confirmed handover for Item #${itemId} & Request #${requestId}`);
    } catch (err: any) {
      console.error('[Firebase] Handover transaction failed:', err);
      throw err;
    }
  }

  return { updatedItem, updatedRequest };
}

/**
 * Confirm Return
 * When the owner clicks "Confirm Return":
 * - In one Firestore transaction, update item status back to 'available' (and available: true)
 * - Clear the borrowedBy field
 * - In the same transaction, update request status to 'Completed' (returned: true)
 * - Real-time listener immediately refreshes the Browse listing to 'Available'
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

  // Firebase Firestore Update (One atomic transaction for item and request)
  if (isFirebaseConfigured()) {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, String(itemId));
      const reqRef = doc(db, REQUESTS_COLLECTION, String(requestId));

      await runTransaction(db, async (transaction) => {
        // Reads before writes
        const itemSnap = await transaction.get(itemRef);
        const reqSnap = await transaction.get(reqRef);

        const existingItemData = itemSnap.exists() ? itemSnap.data() : targetItem;
        const existingReqData = reqSnap.exists() ? reqSnap.data() : targetReq;

        // Atomic write 1: Set item status to 'available'
        transaction.set(
          itemRef,
          {
            ...existingItemData,
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

        // Atomic write 2: Set request status to 'Completed'
        transaction.set(
          reqRef,
          {
            ...existingReqData,
            status: 'Completed',
            returned: true,
            ratingGiven: rating || 5,
            reviewComment: comment || targetReq.reviewComment || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      console.log(`[Firestore Transaction] Confirmed return for Item #${itemId} & Request #${requestId}`);
    } catch (err: any) {
      console.error('[Firebase] Return transaction failed:', err);
      throw err;
    }
  }

  return { updatedItem, updatedRequest };
}
