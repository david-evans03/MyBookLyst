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

export type BookStatus = 'reading' | 'completed' | 'plan-to-read' | 'dropped';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  totalPages: number;
  status: BookStatus;
  currentPage: number;
  progress: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export type NewBook = Omit<Book, 'id'>; 