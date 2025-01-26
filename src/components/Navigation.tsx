"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Home, User, PlusSquare, LogOut, BookOpen, Search, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { auth } from "@/lib/firebase/firebase";
import NotificationsDropdown from './NotificationsDropdown';

interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName", ">=", userSearchQuery),
        where("displayName", "<=", userSearchQuery + "\uf8ff")
      );
      
      const querySnapshot = await getDocs(q);
      const results: UserSearchResult[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          uid: doc.id,
          displayName: userData.displayName,
          photoURL: userData.photoURL
        });
      });
      
      setUserSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const links = [
    { href: "/", label: "Home", icon: Home },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Search Bar - Made narrower */}
          <div className="w-48">
            <div className="relative">
              <input
                type="text"
                placeholder="Find friends"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full px-4 py-2 border rounded-lg"
              />
              
              {/* Search Results Dropdown */}
              {userSearchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {userSearchResults.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() => {
                        router.push(`/profile/${user.uid}`);
                        setUserSearchResults([]);
                        setUserSearchQuery("");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      {user.photoURL && (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span>{user.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logo/Home Link - Centered with flex-grow */}
          <div className="flex-grow flex justify-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              MyBookList
            </Link>
          </div>

          {/* User Profile Section */}
          <div className="w-48 flex items-center justify-end gap-2">
            <NotificationsDropdown />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium">{user?.displayName}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="py-1">
                    <Link
                      href={`/profile/${user.uid}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </div>
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </div>
                    </Link>
                    <Link
                      href="/add-book"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Add Book Manually
                      </div>
                    </Link>
                    {user && user.uid === 'KnyjSMErQ5SQBIkreNblM9tG7Dk1' && (
                      <Link
                        href="/admin/books"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 