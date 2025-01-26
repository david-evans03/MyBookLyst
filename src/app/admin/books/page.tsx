"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDocuments, updateDocument, addDocument, deleteDocument } from "@/lib/firebase/firebaseUtils";

interface PendingBook {
  id: string;
  title: string;
  authors: string[];
  description: string;
  imageUrl: string;
  pageCount: number;
  genres: string[];
  addedBy: string;
  addedAt: string;
  status: 'pending';
  approved?: boolean;
}

interface RejectionPopupProps {
  book: PendingBook;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

function RejectionPopup({ book, onConfirm, onClose }: RejectionPopupProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1f2937] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Reject "{book.title}"</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for rejection..."
          className="w-full p-3 bg-[#111827] text-gray-200 border border-[#374151] rounded-lg mb-4 h-32 resize-none 
            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-600 text-gray-100 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const { user } = useAuth();
  const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionBook, setRejectionBook] = useState<PendingBook | null>(null);

  // Update this line to match your UID
  const ADMIN_UIDS = ['pUGokLEstmegrdcWxETR6KSJEKt1'];

  useEffect(() => {
    if (!user || !ADMIN_UIDS.includes(user.uid)) {
      window.location.href = '/';
      return;
    }

    loadPendingBooks();
  }, [user]);

  const loadPendingBooks = async () => {
    try {
      const books = (await getDocuments("custom-books")) as PendingBook[];
      setPendingBooks(books.filter((book) => !book.approved));
    } catch (error) {
      console.error("Error loading pending books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (book: PendingBook) => {
    try {
      // Update custom-books status
      await updateDocument("custom-books", book.id, {
        approved: true,
        status: 'approved',
      });

      // Add to booklist for the original user
      await addDocument("booklist", {
        userId: book.addedBy,
        bookId: book.id,
        title: book.title,
        authors: book.authors,
        imageUrl: book.imageUrl,
        description: book.description,
        addedAt: new Date().toISOString(),
        status: 'plan-to-read',
        genres: book.genres,
        pageCount: book.pageCount,
        progress: 0,
        isCustomBook: true,
      });

      // Remove from pending books
      await deleteDocument("pending-books", book.id);

      // Refresh the list
      loadPendingBooks();
    } catch (error) {
      console.error("Error approving book:", error);
    }
  };

  const handleReject = async (book: PendingBook, reason: string) => {
    try {
      // Delete from custom-books collection
      await deleteDocument("custom-books", book.id);
      
      // Find and delete from pending-books collection
      const pendingBooks = await getDocuments("pending-books");
      const pendingBook = pendingBooks.find(
        (pb: any) => pb.bookId === book.id
      );
      
      if (pendingBook) {
        await deleteDocument("pending-books", pendingBook.id);
      }

      // Add rejection notification to the user
      await addDocument("notifications", {
        userId: book.addedBy,
        type: "book-rejected",
        bookTitle: book.title,
        reason: reason,
        createdAt: new Date().toISOString(),
        read: false
      });

      // Refresh the list
      loadPendingBooks();
      setRejectionBook(null);
    } catch (error) {
      console.error("Error rejecting book:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Book Approval Dashboard</h1>
      <div className="grid gap-6">
        {pendingBooks.map((book) => (
          <div key={book.id} className="bg-[#1f2937] p-6 rounded-lg shadow-lg border border-[#374151]">
            <div className="flex gap-4">
              {book.imageUrl && (
                <img 
                  src={book.imageUrl} 
                  alt={book.title} 
                  className="w-24 h-32 object-cover rounded shadow-md"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-100">{book.title}</h2>
                <p className="text-gray-300">By {book.authors.join(", ")}</p>
                <p className="text-gray-400 text-sm mt-2">{book.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(book)}
                    className="px-4 py-2 bg-emerald-600 text-gray-100 rounded hover:bg-emerald-700 
                      transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectionBook(book)}
                    className="px-4 py-2 bg-red-600 text-gray-100 rounded hover:bg-red-700 
                      transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {pendingBooks.length === 0 && (
          <p className="text-center text-gray-400">No books pending approval</p>
        )}
      </div>

      {rejectionBook && (
        <RejectionPopup
          book={rejectionBook}
          onConfirm={(reason) => handleReject(rejectionBook, reason)}
          onClose={() => setRejectionBook(null)}
        />
      )}
    </div>
  );
} 