"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Book } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const BookList = dynamic(() => import('../components/books/BookList'), { ssr: false });

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;

    const q = query(collection(db, 'books'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const booksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));
    setBooks(booksList);
  };

  const handleStatusChange = async (bookId: string, newStatus: string) => {
    await updateDoc(doc(db, 'books', bookId), { status: newStatus });
    loadBooks();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow">My Books</h1>
      <BookList books={books} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default BooksPage; 