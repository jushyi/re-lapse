import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseConfig';

/**
 * Debug utility to check all photos in database
 * Logs photo states to console for troubleshooting
 */
export const debugAllPhotos = async () => {
  try {
    console.log('=== DEBUG: Fetching ALL photos ===');

    const photosQuery = query(collection(db, 'photos'));
    const snapshot = await getDocs(photosQuery);

    console.log(`Total photos in database: ${snapshot.size}`);

    const photosByState = {
      developing: 0,
      revealed: 0,
      triaged_journaled: 0,
      triaged_archived: 0,
      other: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log('Photo:', {
        id: doc.id,
        status: data.status,
        photoState: data.photoState,
        userId: data.userId,
        capturedAt: data.capturedAt,
      });

      if (data.status === 'developing') {
        photosByState.developing++;
      } else if (data.status === 'revealed') {
        photosByState.revealed++;
      } else if (data.status === 'triaged' && data.photoState === 'journaled') {
        photosByState.triaged_journaled++;
      } else if (data.status === 'triaged' && data.photoState === 'archived') {
        photosByState.triaged_archived++;
      } else {
        photosByState.other++;
      }
    });

    console.log('Photos by state:', photosByState);
    console.log('=== END DEBUG ===');

    return photosByState;
  } catch (error) {
    console.error('Error debugging photos:', error);
    return null;
  }
};

/**
 * Debug utility specifically for journaled photos query
 */
export const debugJournaledPhotos = async () => {
  try {
    console.log('=== DEBUG: Fetching journaled photos ===');

    // Try the exact query used in feedService
    const journaledQuery = query(
      collection(db, 'photos'),
      where('photoState', '==', 'journal')
    );

    const snapshot = await getDocs(journaledQuery);

    console.log(`Journaled photos found: ${snapshot.size}`);

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log('Journaled photo:', {
        id: doc.id,
        status: data.status,
        photoState: data.photoState,
        userId: data.userId,
      });
    });

    console.log('=== END DEBUG ===');

    return snapshot.size;
  } catch (error) {
    console.error('Error debugging journaled photos:', error);
    return 0;
  }
};
