export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    categories?: string[];
    language?: string;
  };
}

export type BookStatus = 'reading' | 'completed' | 'plan-to-read' | 'dropped';

export interface Book {
  id?: string;
  googleBookId: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  status: BookStatus;
  userId: string;
  currentPage?: number;
  totalPages?: number;
  progress?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export type NewBook = Omit<Book, 'id'>; 