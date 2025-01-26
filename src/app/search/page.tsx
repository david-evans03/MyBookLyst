"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Search, Users } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import debounce from 'lodash/debounce';
import { auth } from '@/lib/firebase/firebase';

interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
}

// Add this fuzzy search helper function at the top
const fuzzyMatch = (str: string, pattern: string): boolean => {
  const text = str.toLowerCase();
  const search = pattern.toLowerCase();
  
  let patternIdx = 0;
  let strIdx = 0;
  
  while (patternIdx < search.length && strIdx < text.length) {
    if (search[patternIdx] === text[strIdx]) {
      patternIdx++;
    }
    strIdx++;
  }
  
  return patternIdx === search.length;
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchError, setSearchError] = useState<string>('');

  // Fetch total user count on component mount
  useEffect(() => {
    async function fetchUserCount() {
      try {
        const coll = collection(db, "users");
        const snapshot = await getCountFromServer(coll);
        setTotalUsers(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchUserCount();
  }, []);

  // Create a debounced version of handleSearch
  const debouncedSearch = useMemo(
    () => debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }
      
      setIsSearching(true);
      setHasSearched(true);
      setSearchError('');
      
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(100));
        const querySnapshot = await getDocs(q);
        
        const results = querySnapshot.docs
          .map(doc => ({
            uid: doc.id,
            displayName: doc.data().username || 'Unknown User',
            photoURL: doc.data().photoURL,
            username: doc.data().username
          }))
          .filter(user => 
            // Filter out the current user and apply fuzzy search
            user.uid !== auth.currentUser?.uid && 
            fuzzyMatch(user.username || '', searchTerm)
          )
          .slice(0, 20);
        
        setSearchResults(results);
        
        if (results.length === 0) {
          setSearchError('No users found matching your search.');
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchError('An error occurred while searching.');
      } finally {
        setIsSearching(false);
      }
    }, 300), // 300ms delay
    []
  );

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1a1a1a] pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Find Users</h1>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-5 h-5" />
              <span>{totalUsers} registered users</span>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#2a2a2a] text-gray-100 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
              ${isSearching ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
          </div>

          {/* Debug Info - Only visible during development */}
          {process.env.NODE_ENV === 'development' && searchError && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-500">{searchError}</p>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found</p>
                  <p className="text-gray-500 text-sm mt-2">Try searching with a different name</p>
                </div>
              ) : (
                searchResults.map((user) => (
                  <Link
                    key={user.uid}
                    href={`/profile/${user.uid}`}
                    className="flex items-center p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    <img
                      src={user.photoURL || '/default-avatar.png'}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="text-white font-medium">{user.displayName}</h3>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 