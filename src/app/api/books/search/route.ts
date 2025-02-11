import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data = await response.json();
    const books = data.items?.map((item: any) => ({
      id: item.id,
      volumeInfo: {
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        description: item.volumeInfo.description || '',
        imageLinks: {
          thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '/book-placeholder.png'
        },
        pageCount: item.volumeInfo.pageCount || 0
      }
    })) || [];

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
} 