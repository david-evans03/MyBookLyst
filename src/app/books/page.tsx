"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Book, GoogleBook, NewBook } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const BookList = dynamic(() => import('../components/books/BookList'), { ssr: false });
const BookSearch = dynamic(() => import('../components/books/BookSearch'), { ssr: false });

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

  const handleBookSelect = async (googleBook: GoogleBook) => {
    if (!user) return;

    const newBook: NewBook = {
      googleBookId: googleBook.id,
      title: googleBook.volumeInfo.title,
      author: googleBook.volumeInfo.authors?.[0] || 'Unknown Author',
      description: googleBook.volumeInfo.description || '',
      imageUrl: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      thumbnail: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      status: 'plan-to-read',
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'books'), newBook);
    loadBooks();
  };

  const handleStatusChange = async (bookId: string, newStatus: string) => {
    await updateDoc(doc(db, 'books', bookId), { status: newStatus });
    loadBooks();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Books</h1>
      <BookSearch onBookSelect={handleBookSelect} />
      <BookList books={books} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default BooksPage; 