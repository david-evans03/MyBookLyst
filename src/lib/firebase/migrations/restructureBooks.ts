import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export async function migrateBooks() {
  try {
    // Get all existing books
    const booksSnapshot = await getDocs(collection(db, 'books'));
    const processedBooks = new Map();

    // Process each book
    for (const bookDoc of booksSnapshot.docs) {
      const bookData = bookDoc.data();
      const userId = bookData.userId;
      
      // Create or get unique book entry
      const bookId = bookData.googleBookId || bookDoc.id;
      if (!processedBooks.has(bookId)) {
        // Create new book document without user-specific data
        await setDoc(doc(db, 'books', bookId), {
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          imageUrl: bookData.imageUrl,
          thumbnail: bookData.thumbnail,
          totalPages: bookData.totalPages,
          googleBookId: bookData.googleBookId,
          createdAt: bookData.createdAt,
          updatedAt: bookData.updatedAt
        });
        processedBooks.set(bookId, true);
      }

      // Create userBook entry
      const userBookId = `${userId}_${bookId}`;
      await setDoc(doc(db, 'userBooks', userBookId), {
        userId: userId,
        bookId: bookId,
        status: bookData.status || 'completed',
        currentPage: bookData.currentPage || 0,
        progress: bookData.progress || 0,
        createdAt: bookData.createdAt,
        updatedAt: bookData.updatedAt
      });

      // Delete old book document
      await deleteDoc(doc(db, 'books', bookDoc.id));
    }

    console.log('Migration completed successfully');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error: any) {
    console.error('Migration failed:', error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
} 