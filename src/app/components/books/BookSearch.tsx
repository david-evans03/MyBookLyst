"use client";

import { useState } from 'react';
import { GoogleBook, UserBook } from '@/lib/types/database';
import Image from 'next/image';

interface BookSearchProps {
  onBookSelect: (book: GoogleBook, status: UserBook['status']) => void;
  existingBookIds: Set<string>;
}

const BookSearch = ({ onBookSelect, existingBookIds }: BookSearchProps) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedBooks, setAddedBooks] = useState<{ [key: string]: boolean }>({});

  const searchBooks = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search books');
      }
      
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error searching books:', error);
      setError(error instanceof Error ? error.message : 'Failed to search books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = (book: GoogleBook, status: UserBook['status']) => {
    onBookSelect(book, status);
    setAddedBooks(prev => ({ ...prev, [book.id]: true }));
  };

  const statusOptions: { value: UserBook['status']; label: string }[] = [
    { value: 'reading', label: 'Currently Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan-to-read', label: 'Plan to Read' },
    { value: 'dropped', label: 'Dropped' }
  ];

  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Add books..."
          className="flex-1 p-2 border rounded"
          onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button
          onClick={searchBooks}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {books.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {books.map((book) => (
            <div 
              key={book.id}
              className="bg-gray-900/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700/30 
                hover:border-cyan-400/30 transition-all duration-300"
            >
              <div className="relative pt-[150%] mb-4">
                <Image
                  src={book.volumeInfo.imageLinks?.thumbnail || '/book-placeholder.png'}
                  alt={book.volumeInfo.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  className="absolute inset-0 object-cover rounded"
                  priority={false}
                />
              </div>
              <h3 className="font-medium text-lg mb-2 line-clamp-2">
                {book.volumeInfo.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {book.volumeInfo.authors?.[0] || 'Unknown Author'}
              </p>
              
              {addedBooks[book.id] || existingBookIds.has(book.id) ? (
                <select
                  disabled
                  className="w-full p-2 border rounded bg-green-50 text-green-600 cursor-not-allowed"
                  value="added"
                >
                  <option value="added">Added to Lyst!</option>
                </select>
              ) : (
                <select
                  onChange={(e) => handleStatusSelect(book, e.target.value as UserBook['status'])}
                  className="w-full p-2 border rounded"
                  defaultValue=""
                >
                  <option value="" disabled>Add to My Lyst</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch; 