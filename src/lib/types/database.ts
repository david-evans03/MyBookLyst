// Book related types
export type BookStatus = 'reading' | 'completed' | 'plan-to-read' | 'dropped';

export interface Book {
  id: string;               // Google Books ID or custom ID
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserBook {
  userId: string;          // Firebase Auth user ID
  bookId: string;         // Reference to Book.id
  status: BookStatus;
  currentPage: number;
  progress: number;       // Percentage from 0 to 100
  rating?: number;        // Optional rating from 1 to 5
  createdAt: string;
  updatedAt: string;
}

// Google Books API types
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    pageCount?: number;
  };
}

// User related types
export interface User {
  uid: string;            // Firebase Auth user ID
  email: string;
  username: string;
  photoURL: string;
  hasSeenTutorial: boolean;
  notifications: boolean;
  privacy: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

// Combined type for displaying books with user data
export type CombinedBook = Book & UserBook; 