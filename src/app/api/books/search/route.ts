import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data = await response.json();
    
    // Transform the response to match our GoogleBook interface
    const books = (data.items || []).map((item: any) => ({
      id: item.id,
      volumeInfo: {
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        description: item.volumeInfo.description,
        imageLinks: item.volumeInfo.imageLinks,
        pageCount: item.volumeInfo.pageCount
      }
    }));

    return NextResponse.json({
      success: true,
      books
    });
  } catch (error: any) {
    console.error('Google Books API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search books' },
      { status: 500 }
    );
  }
} 