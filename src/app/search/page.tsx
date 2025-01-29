"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { GoogleBook } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const BookSearch = dynamic(() => import('../components/books/BookSearch'), { ssr: false });

const SearchPage = () => {
  const { user } = useAuth();

  const handleBookSelect = async (googleBook: GoogleBook, status: string) => {
    if (!user) return;

    const newBook = {
      googleBookId: googleBook.id,
      title: googleBook.volumeInfo.title,
      author: googleBook.volumeInfo.authors?.[0] || 'Unknown Author',
      description: googleBook.volumeInfo.description || '',
      imageUrl: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      thumbnail: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      status: status,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'books'), newBook);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Search Books</h1>
      <BookSearch onBookSelect={handleBookSelect} />
    </div>
  );
};

export default SearchPage; 