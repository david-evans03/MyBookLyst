export type BookStatus = 'reading' | 'completed' | 'plan-to-read' | 'dropped';

export interface Book {
  id?: string;
  userId: string;
  title: string;
  author: string;
  imageUrl?: string;
  status: BookStatus;
  rating?: number;
  currentPage?: number;
  totalPages?: number;
  progress?: number;
  updatedAt?: string;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
} 