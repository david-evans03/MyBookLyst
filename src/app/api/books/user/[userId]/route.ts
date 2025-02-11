import { NextResponse } from 'next/server';
import { getUserBooks } from '@/lib/firebase/firebaseUtils';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const books = await getUserBooks(userId);

    return NextResponse.json({
      success: true,
      books
    });
  } catch (error: any) {
    console.error('Error fetching user books:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch books' },
      { status: 500 }
    );
  }
} 