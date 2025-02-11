"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Book, BookStatus, CombinedBook } from '@/lib/types/database';
import dynamic from 'next/dynamic';
import { 
  getUserBooks, 
  updateUserBookProgress, 
  removeUserBook,
  updateUserBookRating 
} from '@/lib/firebase/firebaseUtils';

const BookList = dynamic(() => import('@/app/components/books/BookList'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-cyan-200">Loading...</div>
    </div>
  )
});

const BooksPage = () => {
  const [books, setBooks] = useState<CombinedBook[]>([]);
  const { user } = useAuth();

  const loadBooks = useCallback(async () => {
    if (!user) return;
    const userBooks = await getUserBooks(user.uid);
    setBooks(userBooks);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, loadBooks]);

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    if (!user) return;
    try {
      const response = await fetch('/api/books/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          bookId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update book status');
      }

      loadBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const handleRatingChange = async (bookId: string, rating: number) => {
    if (!user) return;
    try {
      await updateUserBookRating(user.uid, bookId, rating);
      await loadBooks(); // Reload books to show updated rating
    } catch (error) {
      console.error('Error updating book rating:', error);
    }
  };

  const handleProgressChange = async (bookId: string, currentPage: number, totalPages: number) => {
    if (!user) return;
    try {
      await updateUserBookProgress(user.uid, bookId, currentPage);
      loadBooks();
    } catch (error) {
      console.error('Error updating book progress:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!user) return;
    try {
      await removeUserBook(user.uid, bookId);
      loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow text-center">My Books</h1>
      <BookList 
        books={books} 
        onStatusChange={handleStatusChange}
        onRatingChange={handleRatingChange}
        onProgressChange={handleProgressChange}
        onDeleteBook={handleDeleteBook}
      />
    </div>
  );
};

export default BooksPage; 