import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export async function POST(request: Request) {
  try {
    const { userId, bookId, rating } = await request.json();
    
    if (!userId || !bookId || typeof rating !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userBookId = `${userId}_${bookId}`;
    const userBookRef = doc(db, 'userBooks', userBookId);
    
    await setDoc(userBookRef, {
      rating,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Book rating updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating book rating:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update book rating' },
      { status: 500 }
    );
  }
} 