import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc,
  deleteDoc,
  orderBy,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { Book, UserBook, User } from '../types/database';

// Book Functions
export async function addBook(bookData: Omit<Book, 'createdAt' | 'updatedAt'>) {
  try {
    console.log('[addBook] Starting to add book:', {
      id: bookData.id,
      title: bookData.title
    });
    
    const now = new Date().toISOString();
    const bookRef = doc(db, 'books', bookData.id);
    
    const fullBookData = {
      ...bookData,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('[addBook] Writing book data:', {
      path: `books/${bookData.id}`,
      data: fullBookData
    });
    
    await setDoc(bookRef, fullBookData, { merge: true });
    console.log('[addBook] Successfully added book');
    return bookRef;
  } catch (error: any) {
    console.error('[addBook] Error:', {
      code: error.code,
      name: error.name,
      message: error.message,
      path: `books/${bookData.id}`
    });
    throw error;
  }
}

export async function getBook(bookId: string): Promise<Book | null> {
  const bookDoc = await getDoc(doc(db, 'books', bookId));
  return bookDoc.exists() ? { id: bookDoc.id, ...bookDoc.data() } as Book : null;
}

// UserBook Functions
export async function addUserBook(userId: string, bookId: string, status: UserBook['status'] = 'plan-to-read') {
  try {
    console.log('[addUserBook] Starting to add user book:', {
      userId,
      bookId,
      status
    });
    
    const now = new Date().toISOString();
    const userBookId = `${userId}_${bookId}`;
    const userBookRef = doc(db, 'userBooks', userBookId);
    
    // Create base user book data without optional fields
    const userBookData = {
      userId,      // This must match the authenticated user's ID
      bookId,
      status,
      currentPage: 0,
      progress: 0,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('[addUserBook] Writing user book data:', {
      path: `userBooks/${userBookId}`,
      data: userBookData
    });
    
    await setDoc(userBookRef, userBookData);
    console.log('[addUserBook] Successfully added user book');
    return userBookRef;
  } catch (error: any) {
    console.error('[addUserBook] Error:', {
      code: error.code,
      name: error.name,
      message: error.message,
      path: `userBooks/${userId}_${bookId}`,
      userId,
      auth: 'Check if user is properly authenticated'
    });
    throw error;
  }
}

export async function getUserBooks(userId: string) {
  const userBooksRef = collection(db, 'userBooks');
  const q = query(
    userBooksRef, 
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const userBooksSnapshot = await getDocs(q);
  const userBooks = userBooksSnapshot.docs.map(doc => doc.data() as UserBook);
  
  // Get full book details for each user book
  const books = await Promise.all(
    userBooks.map(async (userBook) => {
      const bookDoc = await getBook(userBook.bookId);
      if (!bookDoc) return null;
      return {
        ...bookDoc,
        ...userBook
      };
    })
  );
  
  return books.filter((book): book is (Book & UserBook) => book !== null);
}

export async function updateUserBookProgress(
  userId: string, 
  bookId: string, 
  currentPage: number
) {
  const userBookId = `${userId}_${bookId}`;
  const userBookRef = doc(db, 'userBooks', userBookId);
  const userBookDoc = await getDoc(userBookRef);
  
  if (!userBookDoc.exists()) {
    throw new Error('Book not found in user\'s library');
  }
  
  const bookDoc = await getBook(bookId);
  if (!bookDoc) {
    throw new Error('Book not found');
  }
  
  const progress = (currentPage / bookDoc.totalPages) * 100;
  const status = progress >= 100 ? 'completed' : 'reading';
  
  await setDoc(userBookRef, {
    currentPage,
    progress,
    status,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function removeUserBook(userId: string, bookId: string) {
  const userBookId = `${userId}_${bookId}`;
  await deleteDoc(doc(db, 'userBooks', userBookId));
}

// User Functions
export async function createOrUpdateUser(userData: Partial<User> & { uid: string }) {
  const now = new Date().toISOString();
  const userRef = doc(db, 'users', userData.uid);
  const userDoc = await getDoc(userRef);
  
  await setDoc(userRef, {
    ...userData,
    updatedAt: now,
    createdAt: userDoc.exists() ? userDoc.data()?.createdAt : now
  }, { merge: true });
  
  return userRef;
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data() as DocumentData;
  return {
    uid: userDoc.id,
    email: data.email,
    username: data.username,
    photoURL: data.photoURL,
    hasSeenTutorial: data.hasSeenTutorial,
    notifications: data.notifications,
    privacy: data.privacy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

// Search Functions
export async function searchUserBooks(userId: string, query: string) {
  const userBooks = await getUserBooks(userId);
  return userBooks.filter(book => 
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getRecentlyUpdatedBooks(userId: string, maxResults: number = 5) {
  const userBooksRef = collection(db, 'userBooks');
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    where('updatedAt', '<=', new Date().toISOString())
  ];
  
  if (maxResults > 0) {
    constraints.push(orderBy('updatedAt', 'desc'));
  }
  
  const q = query(userBooksRef, ...constraints);
  const userBooksSnapshot = await getDocs(q);
  const userBooks = userBooksSnapshot.docs
    .slice(0, maxResults)
    .map(doc => doc.data() as UserBook);
  
  const books = await Promise.all(
    userBooks.map(async (userBook) => {
      const bookDoc = await getBook(userBook.bookId);
      if (!bookDoc) return null;
      return {
        ...bookDoc,
        ...userBook
      };
    })
  );
  
  return books.filter((book): book is (Book & UserBook) => book !== null);
}

export async function updateUserBookRating(userId: string, bookId: string, rating: number) {
  try {
    console.log('[updateUserBookRating] Starting to update book rating:', {
      userId,
      bookId,
      rating
    });
    
    const userBookId = `${userId}_${bookId}`;
    const userBookRef = doc(db, 'userBooks', userBookId);
    const userBookDoc = await getDoc(userBookRef);
    
    if (!userBookDoc.exists()) {
      throw new Error('Book not found in user\'s library');
    }
    
    await setDoc(userBookRef, {
      rating,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('[updateUserBookRating] Successfully updated book rating');
  } catch (error: any) {
    console.error('[updateUserBookRating] Error:', {
      code: error.code,
      name: error.name,
      message: error.message,
      path: `userBooks/${userId}_${bookId}`,
      userId
    });
    throw error;
  }
}

export async function updateUserBookStatus(userId: string, bookId: string, status: UserBook['status']) {
  try {
    console.log('[updateUserBookStatus] Starting to update book status:', {
      userId,
      bookId,
      status
    });
    
    const userBookId = `${userId}_${bookId}`;
    const userBookRef = doc(db, 'userBooks', userBookId);
    const userBookDoc = await getDoc(userBookRef);
    
    if (!userBookDoc.exists()) {
      throw new Error('Book not found in user\'s library');
    }
    
    await setDoc(userBookRef, {
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('[updateUserBookStatus] Successfully updated book status');
  } catch (error: any) {
    console.error('[updateUserBookStatus] Error:', {
      code: error.code,
      name: error.name,
      message: error.message,
      path: `userBooks/${userId}_${bookId}`,
      userId
    });
    throw error;
  }
} 