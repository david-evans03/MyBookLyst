"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { GoogleBook } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const BookSearch = dynamic(() => import('../components/books/BookSearch'), { ssr: false });

const SearchPage = () => {
  const { user } = useAuth();
  const [existingBookIds, setExistingBookIds] = useState<Set<string>>(new Set());

  // Load user's existing books
  useEffect(() => {
    const loadExistingBooks = async () => {
      if (!user) return;
      
      const q = query(collection(db, 'books'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const bookIds = new Set(querySnapshot.docs.map(doc => doc.data().googleBookId));
      setExistingBookIds(bookIds);
    };

    loadExistingBooks();
  }, [user]);

  const handleBookSelect = async (googleBook: GoogleBook, status: string) => {
    if (!user) return;

    // Check if book already exists in user's list
    if (existingBookIds.has(googleBook.id)) {
      return; // Book already exists, don't add it
    }

    const newBook = {
      googleBookId: googleBook.id,
      title: googleBook.volumeInfo.title,
      author: googleBook.volumeInfo.authors?.[0] || 'Unknown Author',
      description: googleBook.volumeInfo.description || '',
      imageUrl: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      thumbnail: googleBook.volumeInfo.imageLinks?.thumbnail || '',
      status: status,
      userId: user.uid,
      currentPage: 0,
      totalPages: googleBook.volumeInfo.pageCount || 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'books'), newBook);
    // Update local state to include the new book
    setExistingBookIds(prev => new Set(Array.from(prev).concat(googleBook.id)));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow text-center">Search Books</h1>
      <BookSearch onBookSelect={handleBookSelect} existingBookIds={existingBookIds} />
    </div>
  );
};

export default SearchPage; 