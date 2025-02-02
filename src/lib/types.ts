export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
  };
}

export type BookStatus = 'reading' | 'completed' | 'plan-to-read' | 'dropped';

export interface Book {
  id: string;
  userId: string;
  googleBookId: string;
  title: string;
  author: string;
  description?: string;
  thumbnail?: string;
  imageUrl?: string;
  status: BookStatus;
  rating?: number;
  review?: string;
  startDate?: string;
  finishDate?: string;
  progress?: number;
  currentPage?: number;
  totalPages?: number;
  createdAt: string;
  updatedAt: string;
}

export type NewBook = Omit<Book, 'id'>; 