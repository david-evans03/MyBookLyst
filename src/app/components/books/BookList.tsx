"use client";

import { useState } from 'react';
import { Book } from '@/lib/types';

interface BookListProps {
  books: Book[];
  onStatusChange: (bookId: string, newStatus: string) => void;
}

const BookList = ({ books, onStatusChange }: BookListProps) => {
  const [filter, setFilter] = useState('all');

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.status === filter;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['all', 'reading', 'completed', 'plan-to-read', 'favorites'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 shadow-sm">
            <img
              src={book.imageUrl || '/book-placeholder.png'}
              alt={book.title}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">{book.author}</p>
            <select
              value={book.status}
              onChange={(e) => onStatusChange(book.id, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="plan-to-read">Plan to Read</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList; 