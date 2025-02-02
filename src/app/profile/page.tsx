"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Book, BookStatus } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BookOpen, Users, FileText } from 'lucide-react';
import BookList from '../components/books/BookList';

interface MonthlyReading {
  name: string;
  pages: number;
}

interface StatusDistribution {
  name: string;
  reading: number;
  completed: number;
  'plan-to-read': number;
  dropped: number;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [monthlyReadingData, setMonthlyReadingData] = useState<MonthlyReading[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);

  const loadBooks = useCallback(async () => {
    if (!user) return;

    const q = query(collection(db, 'books'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const booksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));
    setBooks(booksList);
    calculateMonthlyReading(booksList);
    calculateStatusDistribution(booksList);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, loadBooks]);

  const calculateMonthlyReading = (books: Book[]) => {
    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Calculate pages read per month
    books.forEach(book => {
      if (book.currentPage && book.updatedAt) {
        const month = months[new Date(book.updatedAt).getMonth()];
        monthlyData[month] += book.currentPage;
      }
    });

    // Convert to array format for recharts
    const chartData = months.map(month => ({
      name: month,
      pages: monthlyData[month]
    }));

    setMonthlyReadingData(chartData);
  };

  const calculateStatusDistribution = (books: Book[]) => {
    const total = books.length;
    if (total === 0) return;

    const counts = {
      reading: books.filter(book => book.status === 'reading').length,
      completed: books.filter(book => book.status === 'completed').length,
      'plan-to-read': books.filter(book => book.status === 'plan-to-read').length,
      dropped: books.filter(book => book.status === 'dropped').length,
    } as const;

    const distribution = [{
      name: 'Status',
      reading: (counts.reading / total) * 100,
      completed: (counts.completed / total) * 100,
      'plan-to-read': (counts['plan-to-read'] / total) * 100,
      dropped: (counts.dropped / total) * 100,
    }];

    setStatusDistribution(distribution);
  };

  const getTotalPagesRead = () => {
    return books.reduce((total, book) => total + (book.currentPage || 0), 0);
  };

  const getUniqueAuthors = () => {
    return new Set(books.map(book => book.author)).size;
  };

  const getCompletedBooks = () => {
    return books.filter(book => book.status === 'completed').length;
  };

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    try {
      await updateDoc(doc(db, 'books', bookId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      loadBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const handleRatingChange = async (bookId: string, rating: number) => {
    try {
      await updateDoc(doc(db, 'books', bookId), {
        rating,
        updatedAt: new Date().toISOString()
      });
      loadBooks();
    } catch (error) {
      console.error('Error updating book rating:', error);
    }
  };

  const handleProgressChange = async (bookId: string, currentPage: number, totalPages: number) => {
    try {
      await updateDoc(doc(db, 'books', bookId), {
        currentPage,
        totalPages,
        updatedAt: new Date().toISOString()
      });
      loadBooks();
    } catch (error) {
      console.error('Error updating book progress:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
        loadBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow text-center">Reading Analytics</h1>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-8 h-8 text-cyan-300" />
            <h3 className="text-xl font-bold text-cyan-200">Books Completed</h3>
          </div>
          <p className="text-4xl font-bold text-cyan-200">{getCompletedBooks()}</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-8 h-8 text-cyan-300" />
            <h3 className="text-xl font-bold text-cyan-200">Unique Authors</h3>
          </div>
          <p className="text-4xl font-bold text-cyan-200">{getUniqueAuthors()}</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-8 h-8 text-cyan-300" />
            <h3 className="text-xl font-bold text-cyan-200">Pages Read</h3>
          </div>
          <p className="text-4xl font-bold text-cyan-200">{getTotalPagesRead()}</p>
        </div>
      </div>

      {/* Monthly Reading Chart */}
      <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
        <h3 className="text-xl font-bold text-cyan-200 mb-6">Pages Read per Month</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyReadingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8"
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                stroke="#94A3B8"
                tick={{ fill: '#94A3B8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#E5E7EB'
                }}
              />
              <Bar 
                dataKey="pages" 
                fill="rgba(34, 211, 238, 0.3)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30 mt-8">
        <h3 className="text-xl font-bold text-cyan-200 mb-6">Reading Status Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusDistribution}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="#94A3B8"
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                hide={true}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const formattedName = name === 'plan-to-read' ? 'Plan to Read' :
                    name.charAt(0).toUpperCase() + name.slice(1);
                  return [`${value.toFixed(1)}%`, formattedName];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#E5E7EB'
                }}
              />
              <Bar dataKey="reading" stackId="status" fill="#22D3EE" />
              <Bar dataKey="completed" stackId="status" fill="#34D399" />
              <Bar dataKey="plan-to-read" stackId="status" fill="#F472B6" />
              <Bar dataKey="dropped" stackId="status" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 px-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-3 h-3 rounded-full bg-[#22D3EE]" />
            <span className="text-sm text-gray-300">Reading</span>
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-3 h-3 rounded-full bg-[#34D399]" />
            <span className="text-sm text-gray-300">Completed</span>
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-3 h-3 rounded-full bg-[#F472B6]" />
            <span className="text-sm text-gray-300">Plan to Read</span>
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="text-sm text-gray-300">Dropped</span>
          </div>
        </div>
      </div>

      {/* All Books Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-cyan-200 mb-6">All Books</h3>
        <BookList
          books={books}
          onStatusChange={handleStatusChange}
          onRatingChange={handleRatingChange}
          onProgressChange={handleProgressChange}
          onDeleteBook={handleDeleteBook}
        />
      </div>
    </div>
  );
};

export default ProfilePage; 