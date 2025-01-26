"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDocument, getDocuments, updateDocument, deleteDocument } from "@/lib/firebase/firebaseUtils";
import { Search } from "lucide-react";
import { searchGoogleBooks, type BookSearchResult } from "@/lib/api/googleBooks";
import { useRouter, usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import AuthGuard from "@/components/AuthGuard";
import { Slider } from "@/components/ui/slider";
import { Star, StarHalf } from "lucide-react";

interface Book {
  id: string;
  title: string;
  authors: string[];
  imageUrl: string;
  description: string;
  addedAt?: string;
  genres: string[];
  pageCount: number;
}

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

interface CompletionPopupProps {
  book: BookListItem;
  onClose: () => void;
  onPost: (text: string) => Promise<void>;
}

interface UserSearchResult {
  uid: string;
  name: string;
  photoURL?: string;
  email?: string;
}

type TabType = 'all' | 'reading' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-read';

interface ProgressUpdateProps {
  book: BookListItem;
  onClose: () => void;
  onUpdate: (progress: number) => Promise<void>;
}

interface RatingModalProps {
  book: BookListItem;
  onClose: () => void;
  onRate: (score: number) => Promise<void>;
}

interface BookStats {
  completionRate: number;
  statusDistribution: Record<string, number>;
  monthlyPages: { month: string; pages: number }[];
}

function CompletionPopup({ book, onClose, onPost }: CompletionPopupProps) {
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!postText.trim()) return;
    setIsPosting(true);
    await onPost(postText);
    setIsPosting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-4 mb-4">
          {book.imageUrl ? (
            <div className="w-24 h-36 flex items-center justify-center bg-gray-100 rounded">
              <img
                src={book.imageUrl.replace('http://', 'https://')}
                alt={`Cover of ${book.title}`}
                className="max-w-full max-h-full object-contain rounded"
                width={96}
                height={144}
              />
            </div>
          ) : (
            <div className="w-24 h-36 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">Congratulations!</h3>
            <p className="text-sm text-gray-600">You've completed {book.title}</p>
          </div>
        </div>
        
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Share your thoughts about this book..."
          className="w-full p-3 border rounded-lg mb-4 h-32 resize-none"
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Maybe Later
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting || !postText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressUpdateModal({ book, onClose, onUpdate }: ProgressUpdateProps) {
  const [progress, setProgress] = useState(book.progress || 0);
  const maxPages = book.pageCount || 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] p-6 rounded-lg w-96 border border-[#3a3a3a]">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Update Progress</h3>
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">
            Pages Read: {progress} / {maxPages}
          </p>
          <input
            type="range"
            min="0"
            max={maxPages}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0"
          />
          <div className="mt-4">
            <input
              type="number"
              value={progress}
              min="0"
              max={maxPages}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#3a3a3a] border border-[#4a4a4a] rounded-lg text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(progress)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingModal({ book, onClose, onRate }: RatingModalProps) {
  const [score, setScore] = useState(book.score || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] p-6 rounded-lg w-96 border border-[#3a3a3a]">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Rate Book</h3>
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Score: {score}/10</p>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-2 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onRate(score)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Rate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [myBooks, setMyBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [completedBook, setCompletedBook] = useState<BookListItem | null>(null);
  const router = useRouter();
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookListItem | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Add refs for the search containers
  const bookSearchRef = useRef<HTMLDivElement>(null);
  const userSearchRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All Books' },
    { id: 'reading', label: 'Currently Reading' },
    { id: 'completed', label: 'Completed' },
    { id: 'on-hold', label: 'On Hold' },
    { id: 'dropped', label: 'Dropped' },
    { id: 'plan-to-read', label: 'Plan to Read' },
  ];

  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      loadUserBooks();
    }
  }, [user]);

  const loadUserBooks = async () => {
    if (!user) return;
    const books = await getDocuments("booklist") as BookListItem[];
    const userBooks = books.filter(book => book.userId === user.uid);
    setMyBooks(userBooks);
  };

  const filteredBooks = myBooks.filter(book => {
    if (activeTab === 'all') {
      return true; // Show all books when 'all' tab is selected
    }
    return book.status === activeTab;
  });

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsSearchOpen(true);
    
    try {
      const results = await searchGoogleBooks(searchQuery);
      setSearchResults(results as BookSearchResult[]);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToMyList = async (book: BookSearchResult, status: TabType) => {
    if (!user || status === 'all') return;
    
    const existingBook = myBooks.find(b => b.bookId === book.id);
    if (existingBook) {
      alert('This book is already in your list! You can change its status from your list.');
      return;
    }

    try {
      await addDocument("booklist", {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        authors: book.authors,
        imageUrl: book.imageUrl,
        description: book.description,
        addedAt: new Date().toISOString(),
        status: status,
        genres: book.genres,
        pageCount: book.pageCount,
        progress: 0,
        isCustomBook: false,
      });
      loadUserBooks();
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const updateBookStatus = async (bookId: string, newStatus: TabType) => {
    if (!user || newStatus === 'all') return;
    try {
      const book = myBooks.find(b => b.id === bookId);
      if (!book) return;

      if (newStatus === 'completed') {
        const effectivePageCount = book.pageCount === 0 
          ? (book.progress || 1)
          : book.pageCount;

        await updateDocument("booklist", bookId, { 
          status: newStatus,
          progress: effectivePageCount,
          pageCount: book.pageCount === 0 ? effectivePageCount : book.pageCount
        });

        const updatedBook = {
          ...book,
          status: newStatus,
          progress: effectivePageCount,
          pageCount: book.pageCount === 0 ? effectivePageCount : book.pageCount
        };

        setMyBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? updatedBook : b
          )
        );
        
        setCompletedBook(updatedBook);
      } else {
        const updateData = {
          status: newStatus,
          progress: book.status === 'completed' ? 0 : (book.progress || 0)
        };

        await updateDocument("booklist", bookId, updateData);
        
        setMyBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, ...updateData } : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating book status:", error);
      if (error instanceof Error) {
        console.error("Detailed error:", error.message);
      }
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!user) return;
    try {
      await deleteDocument("booklist", bookId);
      loadUserBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const updateBookScore = async (bookId: string, newScore: number) => {
    try {
      await updateDocument("booklist", bookId, { score: newScore });
      setMyBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId ? { ...book, score: newScore } : book
        )
      );
    } catch (error) {
      console.error("Error updating book score:", error);
    }
  };

  const updateBookProgress = async (bookId: string, newProgress: number, updateTotal: boolean = false) => {
    try {
      const book = myBooks.find(b => b.id === bookId);
      if (!book) return;

      const updateData: { progress: number; pageCount?: number } = {
        progress: newProgress
      };

      if (updateTotal && book.status === 'completed' && book.pageCount === 0) {
        updateData.pageCount = newProgress;
      }

      await updateDocument("booklist", bookId, updateData);
      
      setMyBooks(prevBooks => 
        prevBooks.map(b => 
          b.id === bookId 
            ? { ...b, ...updateData }
            : b
        )
      );
    } catch (error) {
      console.error("Error updating book progress:", error);
    }
  };

  const searchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    setIsSearchingUsers(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("name", ">=", userSearchQuery),
        where("name", "<=", userSearchQuery + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
        photoURL: doc.data().photoURL,
        email: doc.data().email
      } as UserSearchResult));
      setUserSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Simplified version that just closes the popup
  const handleCreatePost = async (text: string) => {
    setCompletedBook(null);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setHasSearched(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Update the useEffect
  useEffect(() => {
    // Reset search state when component mounts
    setIsSearchOpen(false);
    setIsUserSearchOpen(false);
    setSearchResults([]);
    setUserSearchResults([]);
    setSearchQuery("");
    setUserSearchQuery("");
  }, [pathname]); // Use pathname instead of router.pathname

  // Add this CSS class near the top of your component
  const tableHeaderClass = "px-4 py-2 text-left text-sm font-semibold text-gray-600 w-[calc(100%/7)]";

  // Add this function near your other event handlers
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    if (!selectedBook) return;
    
    try {
      await updateDocument("booklist", selectedBook.id, {
        progress,
        // If progress is 100%, automatically set status to completed
        ...(progress === 100 ? { status: 'completed' } : {})
      });
      
      // Update local state
      setMyBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === selectedBook.id 
            ? { ...book, progress, ...(progress === 100 ? { status: 'completed' } : {}) }
            : book
        )
      );
      
      setShowProgressModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleRatingUpdate = async (score: number) => {
    if (!selectedBook) return;
    
    try {
      await updateDocument("booklist", selectedBook.id, { score });
      setMyBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === selectedBook.id 
            ? { ...book, score }
            : book
        )
      );
      setShowRatingModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Search Bar */}
          <div className="relative flex items-center mb-6">
            <input
              type="text"
              placeholder="Search for books to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-gray-100 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            />
            <button
              onClick={searchBooks}
              disabled={loading}
              className="absolute right-2 px-4 py-1.5 bg-blue-500 text-gray-100 rounded-lg 
              hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching..." : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Show either search results OR user's book list */}
          {hasSearched ? (
            // Search Results View
            <>
              {/* Add Back Button */}
              <div className="mb-6 flex items-center">
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to My Books
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Can't find the book you're looking for?</p>
                <button
                  onClick={() => router.push('/add-book')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                >
                  Add it to our database →
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((book) => (
                      <div key={book.id} className="border rounded-lg p-4 flex gap-4">
                        <img
                          src={book.imageUrl?.replace('http://', 'https://') || '/placeholder-book.png'}
                          alt={`Cover of ${book.title}`}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-gray-600">{book.authors?.join(", ")}</p>
                          {/* Add to list dropdown */}
                          <select
                            onChange={(e) => addToMyList(book, e.target.value as Exclude<TabType, 'all'>)}
                            className="mt-2 w-full p-2 bg-[#1f2937] text-gray-100 border border-[#374151] 
                              rounded-lg appearance-none cursor-pointer hover:bg-[#2d3748] 
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              shadow-inner relative"
                            defaultValue=""
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            <option value="" disabled className="bg-[#1f2937] text-gray-100">Add to list...</option>
                            {tabs.filter(tab => tab.id !== 'all').map((tab) => (
                              <option 
                                key={tab.id} 
                                value={tab.id}
                                className="bg-[#1f2937] text-gray-100 hover:bg-[#2d3748]"
                              >
                                {tab.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // User's Book List View
            <>
              {/* Scrollable Tabs Container */}
              <div className="mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex space-x-2 min-w-max border-b border-[#3a3a3a]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 whitespace-nowrap text-sm font-medium transition-colors
                        ${activeTab === tab.id 
                          ? 'text-blue-400 border-b-2 border-blue-400' 
                          : 'text-gray-400 hover:text-gray-300'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Book List */}
              <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="min-w-[768px]"> {/* Minimum width for table */}
                  <table className="w-full table-auto">
                    <thead className="bg-[#2a2a2a] text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Image</th>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Score</th>
                        <th className="px-4 py-2 text-left">Genre</th>
                        <th className="px-4 py-2 text-left">Progress</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.map((book, index) => (
                          <tr key={book.id} className="border-b border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors">
                            <td className="px-4 py-2 text-gray-300">{index + 1}</td>
                            <td className="px-4 py-2">
                              {book.imageUrl ? (
                                <img
                                  src={book.imageUrl.replace('http://', 'https://')}
                                  alt={`Cover of ${book.title}`}
                                  className="w-12 h-16 object-contain rounded shadow-md"
                                  width={48}
                                  height={64}
                                />
                              ) : (
                                <div className="w-12 h-16 bg-[#2a2a2a] rounded flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No image</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-100 font-medium">{book.title}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowRatingModal(true);
                                }}
                                className="text-gray-400 hover:text-blue-400"
                              >
                                {book.score ? `${book.score}/10` : 'Rate'}
                              </button>
                            </td>
                            <td className="px-4 py-2">{book.genres?.join(", ") || "-"}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                <div 
                                  className="w-full bg-[#2a2a2a] rounded-full h-2 cursor-pointer"
                                  onClick={() => {
                                    setSelectedBook(book);
                                    setShowProgressModal(true);
                                  }}
                                >
                                  <div
                                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(book.progress || 0) / (book.pageCount || 100) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-400">
                                  {book.progress || 0}/{book.pageCount || '?'} pages
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium
                                ${getStatusColor(book.status)}">
                                {book.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                            No books found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {completedBook && (
            <CompletionPopup
              book={completedBook}
              onClose={() => setCompletedBook(null)}
              onPost={handleCreatePost}
            />
          )}

          {showProgressModal && selectedBook && (
            <ProgressUpdateModal
              book={selectedBook}
              onClose={() => {
                setSelectedBook(null);
                setShowProgressModal(false);
              }}
              onUpdate={handleProgressUpdate}
            />
          )}

          {showRatingModal && selectedBook && (
            <RatingModal
              book={selectedBook}
              onClose={() => {
                setSelectedBook(null);
                setShowRatingModal(false);
              }}
              onRate={handleRatingUpdate}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

// Add this helper function for status colors
function getStatusColor(status: string) {
  switch (status) {
    case 'reading':
      return 'bg-blue-500/20 text-blue-400';
    case 'completed':
      return 'bg-green-500/20 text-green-400';
    case 'on-hold':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'dropped':
      return 'bg-red-500/20 text-red-400';
    case 'plan-to-read':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
} 