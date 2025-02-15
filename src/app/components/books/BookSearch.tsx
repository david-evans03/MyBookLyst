"use client";

import { useState, useRef, useEffect } from 'react';
import { GoogleBook, UserBook } from '@/lib/types/database';
import Image from 'next/image';

interface BookSearchProps {
  onBookSelect: (book: GoogleBook, status: UserBook['status']) => void;
  existingBookIds: Set<string>;
}

const BookSearch = ({ onBookSelect, existingBookIds }: BookSearchProps) => {
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'author'>('title');
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedBooks, setAddedBooks] = useState<{ [key: string]: boolean }>({});
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchBooks = async () => {
    if (!searchText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const queryParam = searchType === 'author' 
        ? `inauthor:${encodeURIComponent(searchText)}`
        : `intitle:${encodeURIComponent(searchText)}`;

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${queryParam}&maxResults=12`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Google Books API');
      }
      
      const data = await response.json();
      const formattedBooks = data.items?.map((item: any) => ({
        id: item.id,
        volumeInfo: {
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['Unknown Author'],
          description: item.volumeInfo.description || '',
          imageLinks: {
            thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '/book-placeholder.png'
          },
          pageCount: item.volumeInfo.pageCount || 0
        }
      })) || [];
      
      setBooks(formattedBooks);
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
      <div className="flex gap-2 mb-8 relative">
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="h-[40px] aspect-square flex items-center justify-center rounded-md bg-gray-800/60 border border-gray-700 text-gray-200 hover:bg-gray-700/60 focus:border-cyan-400/30 focus:ring focus:ring-cyan-400/20"
            title="Search filter"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
          </button>
          
          {showPopup && (
            <div className="absolute left-0 top-[44px] bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 min-w-[200px] py-2">
              <button
                onClick={() => {
                  setSearchType('title');
                  setShowPopup(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700/60 ${
                  searchType === 'title' ? 'text-cyan-400' : 'text-gray-200'
                }`}
              >
                Search by Title
              </button>
              <button
                onClick={() => {
                  setSearchType('author');
                  setShowPopup(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700/60 ${
                  searchType === 'author' ? 'text-cyan-400' : 'text-gray-200'
                }`}
              >
                Search by Author
              </button>
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={`Search for ${searchType === 'author' ? 'authors' : 'books'}...`}
          className="flex-1 p-2 rounded-md bg-gray-800/60 border border-gray-700 text-gray-200 focus:border-cyan-400/30 focus:ring focus:ring-cyan-400/20"
          onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button
          onClick={searchBooks}
          className="px-4 py-2 bg-cyan-400/20 text-cyan-200 rounded-md hover:bg-cyan-400/30 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 mb-4">
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
              <p className="text-sm text-gray-400 mb-4">
                {book.volumeInfo.authors?.[0] || 'Unknown Author'}
              </p>
              
              {addedBooks[book.id] || existingBookIds.has(book.id) ? (
                <select
                  disabled
                  className="w-full p-2 rounded-md bg-green-900/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                  value="added"
                >
                  <option value="added">Added to Lyst!</option>
                </select>
              ) : (
                <select
                  onChange={(e) => handleStatusSelect(book, e.target.value as UserBook['status'])}
                  className="w-full p-2 rounded-md bg-gray-800/60 border border-gray-700 text-gray-200 focus:border-cyan-400/30 focus:ring focus:ring-cyan-400/20"
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