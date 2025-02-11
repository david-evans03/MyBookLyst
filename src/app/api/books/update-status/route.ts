import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export async function POST(request: Request) {
  try {
    const { userId, bookId, status } = await request.json();
    
    if (!userId || !bookId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userBookId = `${userId}_${bookId}`;
    const userBookRef = doc(db, 'userBooks', userBookId);
    
    await setDoc(userBookRef, {
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Book status updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating book status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update book status' },
      { status: 500 }
    );
  }
} 