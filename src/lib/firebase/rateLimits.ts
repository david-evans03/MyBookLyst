import { db } from './firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

interface UsageQuota {
  reads: number;
  writes: number;
  storage: number;
  lastReset: string;
  documentsCount: number;
}

const DAILY_LIMITS = {
  reads: 45000, // Setting slightly below limit for safety
  writes: 18000,
  storage: 900 * 1024 * 1024, // 900MB (leaving buffer)
  documents: 9000
};

export async function checkAndUpdateQuota(
  operation: 'read' | 'write' | 'storage',
  bytes?: number
): Promise<boolean> {
  const quotaRef = doc(db, 'system', 'usage');
  
  try {
    // Get current usage
    const quotaDoc = await getDoc(quotaRef);
    const today = new Date().toISOString().split('T')[0];
    
    if (!quotaDoc.exists() || quotaDoc.data().lastReset !== today) {
      // Reset counters for new day
      await setDoc(quotaRef, {
        reads: 0,
        writes: 0,
        storage: 0,
        documentsCount: 0,
        lastReset: today
      });
      return true;
    }

    const usage = quotaDoc.data() as UsageQuota;

    // Check limits based on operation
    switch (operation) {
      case 'read':
        if (usage.reads >= DAILY_LIMITS.reads) {
          console.error('Daily read quota exceeded');
          return false;
        }
        await setDoc(quotaRef, { reads: increment(1) }, { merge: true });
        break;

      case 'write':
        if (usage.writes >= DAILY_LIMITS.writes) {
          console.error('Daily write quota exceeded');
          return false;
        }
        if (usage.documentsCount >= DAILY_LIMITS.documents) {
          console.error('Daily document limit exceeded');
          return false;
        }
        await setDoc(quotaRef, { 
          writes: increment(1),
          documentsCount: increment(1)
        }, { merge: true });
        break;

      case 'storage':
        if (!bytes) return false;
        if (usage.storage + bytes > DAILY_LIMITS.storage) {
          console.error('Storage quota would be exceeded');
          return false;
        }
        await setDoc(quotaRef, { storage: increment(bytes) }, { merge: true });
        break;
    }

    return true;
  } catch (error) {
    console.error('Error checking quota:', error);
    return false;
  }
} 