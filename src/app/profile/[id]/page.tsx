"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDocuments, getDocument } from "@/lib/firebase/firebaseUtils";
import { PieChart, BarChart, LineChart } from "@/components/charts";
import { BookOpen, Users, BookMarked, Bookmark, ArrowLeft, User } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import FollowButton from '@/components/FollowButton';
import FollowListModal from '@/components/FollowListModal';
import { useRouter } from 'next/navigation';
import { getStatusColor } from '@/utils/statusColors';

interface BookListItem {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  authors: string[];
  imageUrl: string;
  description: string;
  addedAt: string;
  status: 'reading' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-read';
  score?: number;
  genres: string[];
  progress?: number;
  pageCount: number;
}

interface BookStats {
  totalBooks: number;
  totalPagesRead: number;
  totalAuthors: Set<string>;
  statusDistribution: Record<string, number>;
  authorStats: Array<{ author: string; count: number }>;
  monthlyPages: Array<{ month: string; pages: number }>;
  meanScore: number;
  totalEntries: number;
  completionRate: number;
}

interface UserData {
  uid: string;
  id?: string;
  displayName: string;
  photoURL?: string | null;
  email: string;
  totalBooks?: number;
  completedBooks?: number;
  totalPages?: number;
  completionRate?: number;
  updatedAt?: string;
  uniqueAuthors?: string[];
}

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const userDoc = await getDocument("users", params.id);
        
        if (userDoc) {
          const userData: UserData = {
            uid: userDoc.uid || params.id,
            id: params.id,
            displayName: userDoc.displayName || user?.displayName || 'Anonymous User',
            email: userDoc.email || user?.email || '',
            photoURL: user?.uid === params.id 
              ? (user.photoURL || undefined)
              : (userDoc.photoURL || undefined),
            totalBooks: userDoc.totalBooks || 0,
            completedBooks: userDoc.completedBooks || 0,
            totalPages: userDoc.totalPages || 0,
            completionRate: userDoc.completionRate || 0,
            updatedAt: userDoc.updatedAt || new Date().toISOString(),
            uniqueAuthors: userDoc.uniqueAuthors || []
          };
          
          setUserData(userData);
        }

        // Fetch user's books
        const booksQuery = query(
          collection(db, "booklist"),
          where("userId", "==", params.id)
        );
        const booksSnapshot = await getDocs(booksQuery);
        const userBooks = booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BookListItem[];
        setBooks(userBooks);

        // Fetch followers count
        const followersQuery = query(
          collection(db, "followers"),
          where("followedId", "==", params.id)
        );
        const followersSnapshot = await getDocs(followersQuery);
        setFollowersCount(followersSnapshot.size);

        // Fetch following count
        const followingQuery = query(
          collection(db, "followers"),
          where("followerId", "==", params.id)
        );
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);

        // Calculate stats
        calculateStats(userBooks);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [params.id]);

  const calculateStats = (userBooks: BookListItem[]) => {
    if (!userBooks.length) {
      setStats({
        totalBooks: 0,
        totalPagesRead: 0,
        totalAuthors: new Set(),
        statusDistribution: {},
        authorStats: [],
        monthlyPages: [],
        meanScore: 0,
        totalEntries: 0,
        completionRate: 0
      });
      return;
    }

    // Calculate all stats
    const totalBooks = userBooks.length;
    const totalPagesRead = userBooks.reduce((total, book) => {
      if (book.status === 'completed') {
        return total + (book.pageCount || 0);
      }
      return total + (book.progress || 0);
    }, 0);

    // Get unique authors
    const uniqueAuthors = new Set<string>();
    userBooks.forEach(book => {
      book.authors.forEach((author: string) => uniqueAuthors.add(author));
    });

    // Calculate status distribution
    const statusDist = userBooks.reduce((acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate author stats
    const authorCount = {} as { [key: string]: number };
    userBooks.forEach(book => {
      book.authors.forEach(author => {
        authorCount[author] = (authorCount[author] || 0) + 1;
      });
    });
    const authorStats = Object.entries(authorCount)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate monthly pages
    const monthlyPages = calculateMonthlyPages(userBooks);

    // Calculate mean score
    const scoredBooks = userBooks.filter(book => book.score !== undefined);
    const meanScore = scoredBooks.length
      ? scoredBooks.reduce((sum, book) => sum + (book.score || 0), 0) / scoredBooks.length
      : 0;

    // Calculate completion rate
    const completedBooks = userBooks.filter(book => book.status === 'completed').length;
    const completionRate = (completedBooks / totalBooks) * 100;

    setStats({
      totalBooks,
      totalPagesRead,
      totalAuthors: uniqueAuthors,
      statusDistribution: statusDist,
      authorStats,
      monthlyPages,
      meanScore,
      totalEntries: totalBooks,
      completionRate
    });
  };

  // Helper function to calculate monthly pages
  const calculateMonthlyPages = (books: BookListItem[]) => {
    const monthlyData = {} as { [key: string]: number };
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize all months with 0
    for (let d = sixMonthsAgo; d <= now; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = 0;
    }

    // Add completed books to their respective months
    books.forEach(book => {
      if (book.status === 'completed' && book.addedAt) {
        const monthKey = book.addedAt.slice(0, 7);
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += book.pageCount || 0;
        }
      }
    });

    return Object.entries(monthlyData)
      .map(([month, pages]) => ({ month, pages }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-gray-100 flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8 border border-[#3a3a3a]">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            {userData?.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt="" 
                className="w-24 h-24 rounded-full ring-4 ring-[#3a3a3a] object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#3a3a3a] flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              {/* Username */}
              <h1 className="text-2xl font-semibold text-gray-100 mb-2">{userData?.displayName}</h1>
              
              {/* Follow Button - Moved above followers count */}
              {user?.uid !== params.id && (
                <div className="mb-4">
                  <FollowButton targetUserId={params.id} className="w-full" />
                </div>
              )}
              
              {/* Followers/Following Count */}
              <div className="flex gap-4 text-gray-400">
                <button 
                  onClick={() => setShowFollowModal('followers')}
                  className="hover:text-blue-400 transition-colors"
                >
                  {followersCount} Followers
                </button>
                <button 
                  onClick={() => setShowFollowModal('following')}
                  className="hover:text-blue-400 transition-colors"
                >
                  {followingCount} Following
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Books</p>
                <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <div className="flex items-center gap-3">
              <BookMarked className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Pages Read</p>
                <p className="text-2xl font-bold">{stats?.totalPagesRead || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Unique Authors</p>
                <p className="text-2xl font-bold">{stats?.totalAuthors?.size || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <div className="flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(stats?.completionRate || 0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Reading Status Distribution</h3>
            <PieChart data={stats?.statusDistribution || {}} />
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#3a3a3a]">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Monthly Pages Read</h3>
            <LineChart data={stats?.monthlyPages || []} />
          </div>
        </div>

        {/* Book List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Complete Book List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] p-4">
                <div className="flex gap-4">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-[#3a3a3a] rounded flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">{book.title}</h3>
                    <p className="text-sm text-gray-400">
                      {book.authors.join(", ")}
                    </p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {book.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    {book.score && (
                      <div className="mt-2 text-sm text-gray-400">
                        Rating: <span className="text-blue-400">{book.score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow Modals */}
        {showFollowModal && (
          <FollowListModal
            userId={params.id}
            type={showFollowModal}
            isOpen={!!showFollowModal}
            onClose={() => setShowFollowModal(null)}
          />
        )}
      </div>
    </div>
  );
} 