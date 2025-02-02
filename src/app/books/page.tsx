"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Book, BookStatus } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const BookList = dynamic(() => import('@/app/components/books/BookList'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-cyan-200">Loading...</div>
    </div>
  )
});

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const { user } = useAuth();

  const loadBooks = useCallback(async () => {
    if (!user) return;

    const q = query(collection(db, 'books'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const booksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));
    setBooks(booksList);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, loadBooks]);

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    await updateDoc(doc(db, 'books', bookId), { status: newStatus });
    loadBooks();
  };

  const handleRatingChange = async (bookId: string, rating: number) => {
    await updateDoc(doc(db, 'books', bookId), { rating });
    loadBooks();
  };

  const handleProgressChange = async (bookId: string, currentPage: number, totalPages: number) => {
    const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
    await updateDoc(doc(db, 'books', bookId), { 
      currentPage,
      totalPages,
      progress
    });
    loadBooks();
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
        // If you're using real-time updates, the UI will update automatically
        // Otherwise, you might need to refresh your books list here
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book');
      }
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