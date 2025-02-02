"use client";

import { useState, useRef, MouseEvent } from 'react';
import { Book, BookStatus } from '@/lib/types';
import { Star, X } from 'lucide-react';
import RatingPopup from './RatingPopup';
import ProgressPopup from './ProgressPopup';
import Image from 'next/image';

interface BookListProps {
  books: Book[];
  onStatusChange: (bookId: string, newStatus: BookStatus) => void;
  onRatingChange: (bookId: string, rating: number) => void;
  onProgressChange: (bookId: string, currentPage: number, totalPages: number) => void;
  onDeleteBook: (bookId: string) => void;
}

const BookList = ({ books, onStatusChange, onRatingChange, onProgressChange, onDeleteBook }: BookListProps) => {
  const [filter, setFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [activeRatingBook, setActiveRatingBook] = useState<string | null>(null);
  const [activeProgressBook, setActiveProgressBook] = useState<string | null>(null);

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.status === filter;
  });

  const handleTabsDragScroll = (e: MouseEvent) => {
    setIsDragging(true);
    if (tabsRef.current) {
      setStartX(e.pageX - tabsRef.current.offsetLeft);
      setScrollLeft(tabsRef.current.scrollLeft);
    }
  };

  const handleTableDragScroll = (e: MouseEvent) => {
    setIsDragging(true);
    if (tableRef.current) {
      setStartX(e.pageX - tableRef.current.offsetLeft);
      setScrollLeft(tableRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    if (ref.current) {
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 2;
      ref.current.scrollLeft = scrollLeft - walk;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Books' },
    { id: 'reading', label: 'Currently Reading' },
    { id: 'completed', label: 'Completed' },
    { id: 'plan-to-read', label: 'Plan to Read' },
    { id: 'dropped', label: 'Dropped' }
  ];

  const renderRating = (book: Book) => {
    const rating = book.rating || 0;
    return (
      <button 
        onClick={() => setActiveRatingBook(book.id)}
        className="flex items-center gap-2 hover:bg-gray-800/40 p-2 rounded transition-colors"
      >
        <span className="text-cyan-200">{rating}</span>
        <span className="text-gray-400">/10</span>
      </button>
    );
  };

  const renderProgress = (book: Book) => {
    const currentPage = book.currentPage || 0;
    const totalPages = book.totalPages || 0;
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    return (
      <button
        onClick={() => setActiveProgressBook(book.id)}
        className="w-full hover:bg-gray-800/40 p-2 rounded transition-colors"
      >
        <div className="w-full bg-gray-800/60 rounded-full h-2.5">
          <div 
            className="bg-cyan-400/30 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {currentPage}/{book.totalPages || '?'} pages
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div 
        ref={tabsRef}
        className="flex space-x-2 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing p-2"
        onMouseDown={handleTabsDragScroll}
        onMouseMove={(e) => handleMouseMove(e, tabsRef)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 whitespace-nowrap rounded-full transition-all duration-300 backdrop-blur-sm ${
              filter === tab.id
                ? 'bg-cyan-400/20 text-cyan-200 shadow-lg shadow-cyan-400/20'
                : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/40 hover:text-cyan-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div 
        ref={tableRef}
        className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing rounded-lg bg-gray-900/40 backdrop-blur-md shadow-xl"
        onMouseDown={handleTableDragScroll}
        onMouseMove={(e) => handleMouseMove(e, tableRef)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <table className="w-full min-w-[1000px] border-collapse">
          <thead className="bg-gray-900/60 text-left text-sm text-cyan-200">
            <tr>
              <th className="w-16 px-6 py-3">#</th>
              <th className="w-32 px-6 py-3">Cover</th>
              <th className="px-6 py-3">Book Details</th>
              <th className="w-32 px-6 py-3">Rating</th>
              <th className="w-32 px-6 py-3">Progress</th>
              <th className="w-32 px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book, index) => (
              <tr key={book.id} className="border-b border-gray-700/50 hover:bg-gray-800/40 transition-all duration-300 group">
                <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                <td className="px-6 py-4">
                  <Image
                    src={book.imageUrl || '/book-placeholder.png'}
                    alt={book.title}
                    width={64}
                    height={96}
                    className="object-cover rounded shadow-lg"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-cyan-200 text-glow">{book.title}</div>
                  <div className="text-gray-400 text-sm">{book.author}</div>
                </td>
                <td className="px-6 py-4">
                  {renderRating(book)}
                </td>
                <td className="px-6 py-4">
                  {renderProgress(book)}
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() => onDeleteBook(book.id!)}
                    className="opacity-0 group-hover:opacity-100 absolute top-0 right-2
                      p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400
                      transition-all duration-300"
                  >
                    <X size={14} />
                  </button>
                  
                  <select
                    value={book.status}
                    onChange={(e) => onStatusChange(book.id, e.target.value as BookStatus)}
                    className="bg-gray-800/40 text-gray-300 rounded px-3 py-1.5 text-sm border border-gray-700/50
                      focus:ring-cyan-400/30 focus:border-cyan-400/30 hover:bg-gray-700/60"
                  >
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                    <option value="plan-to-read">Plan to Read</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeRatingBook && (
        <RatingPopup
          bookId={activeRatingBook}
          currentRating={books.find(b => b.id === activeRatingBook)?.rating || 0}
          onRate={(rating) => {
            onRatingChange(activeRatingBook, rating);
            setActiveRatingBook(null);
          }}
          onClose={() => setActiveRatingBook(null)}
        />
      )}

      {activeProgressBook && (
        <ProgressPopup
          book={books.find(b => b.id === activeProgressBook)!}
          onProgress={(currentPage, totalPages) => {
            onProgressChange(activeProgressBook, currentPage, totalPages);
            setActiveProgressBook(null);
          }}
          onClose={() => setActiveProgressBook(null)}
        />
      )}
    </div>
  );
};

export default BookList;