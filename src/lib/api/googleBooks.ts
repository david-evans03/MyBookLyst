const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    categories?: string[];
    pageCount?: number;
  };
}

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  imageUrl: string;
  description: string;
  genres: string[];
  pageCount: number;
  isCustomBook?: boolean;
}

export async function searchGoogleBooks(query: string): Promise<BookSearchResult[]> {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    
    return data.items.map((item: GoogleBookResult) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      imageUrl: item.volumeInfo.imageLinks?.thumbnail || "",
      description: item.volumeInfo.description || "",
      genres: item.volumeInfo.categories || [],
      pageCount: item.volumeInfo.pageCount || 0,
    }));
  } catch (error) {
    console.error("Error searching Google Books:", error);
    throw error;
  }
} 