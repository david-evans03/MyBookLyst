"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { GoogleBook, Book, UserBook } from '@/lib/types/database';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getUserBooks, addBook, addUserBook } from '@/lib/firebase/firebaseUtils';

const BookSearch = dynamic(() => import('../components/books/BookSearch'), { ssr: false });

const SearchPage = () => {
  const { user } = useAuth();
  const [existingBookIds, setExistingBookIds] = useState<Set<string>>(new Set());

  // Debug log for user authentication
  useEffect(() => {
    if (user) {
      console.log('Authenticated user:', {
        uid: user.uid,
        email: user.email
      });
    }
  }, [user]);

  // Load user's existing books
  useEffect(() => {
    const loadExistingBooks = async () => {
      if (!user) return;
      
      try {
        const books = await getUserBooks(user.uid);
        const bookIds = new Set(books.map(book => book.id));
        setExistingBookIds(bookIds);
      } catch (error) {
        console.error('Error loading existing books:', error);
      }
    };

    loadExistingBooks();
  }, [user]);

  const handleBookSelect = async (googleBook: GoogleBook, status: UserBook['status']) => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Check if book already exists in user's list
    if (existingBookIds.has(googleBook.id)) {
      return; // Book already exists, don't add it
    }

    try {
      // Create the book data object
      const bookData: Omit<Book, 'createdAt' | 'updatedAt'> = {
        id: googleBook.id,
        title: googleBook.volumeInfo.title,
        author: googleBook.volumeInfo.authors?.[0] || 'Unknown Author',
        description: googleBook.volumeInfo.description || '',
        imageUrl: googleBook.volumeInfo.imageLinks?.thumbnail || '',
        thumbnail: googleBook.volumeInfo.imageLinks?.thumbnail || '',
        totalPages: googleBook.volumeInfo.pageCount || 0
      };

      console.log('Adding book:', {
        userId: user.uid,
        status,
        bookData
      });

      // Add book directly to Firestore
      await addBook(bookData);
      await addUserBook(user.uid, bookData.id, status);

      // Update local state to include the new book
      setExistingBookIds(prev => new Set(Array.from(prev).concat(googleBook.id)));
    } catch (error) {
      const e = error as Error;
      console.error('Error details:', e);
      console.error('Error adding book:', {
        name: e.name,
        message: e.message,
        stack: e.stack
      });
    }
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