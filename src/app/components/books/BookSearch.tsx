"use client";

import { useState } from 'react';
import { GoogleBook } from '@/lib/types';

interface BookSearchProps {
  onBookSelect: (book: GoogleBook) => void;
}

const BookSearch = ({ onBookSelect }: BookSearchProps) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
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

      {books.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="border rounded p-2 cursor-pointer hover:border-primary"
              onClick={() => onBookSelect(book)}
            >
              <img
                src={book.volumeInfo.imageLinks?.thumbnail || '/book-placeholder.png'}
                alt={book.volumeInfo.title}
                className="w-full h-32 object-cover mb-2"
              />
              <p className="font-medium truncate">{book.volumeInfo.title}</p>
              <p className="text-sm text-gray-600 truncate">
                {book.volumeInfo.authors?.[0] || 'Unknown Author'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch; 