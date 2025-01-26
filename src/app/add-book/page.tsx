"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDocument } from "@/lib/firebase/firebaseUtils";

export default function AddBook() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState({
    title: "",
    authors: [""],
    description: "",
    imageUrl: "",
    pageCount: 0,
    genres: [""],
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...bookData.authors];
    newAuthors[index] = value;
    setBookData({ ...bookData, authors: newAuthors });
  };

  const handleGenreChange = (index: number, value: string) => {
    const newGenres = [...bookData.genres];
    newGenres[index] = value;
    setBookData({ ...bookData, genres: newGenres });
  };

  const addAuthorField = () => {
    setBookData({ ...bookData, authors: [...bookData.authors, ""] });
  };

  const addGenreField = () => {
    setBookData({ ...bookData, genres: [...bookData.genres, ""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const filteredAuthors = bookData.authors.filter(author => author.trim() !== "");
      const filteredGenres = bookData.genres.filter(genre => genre.trim() !== "");
      
      // Add to custom books collection with pending status
      const customBookRef = await addDocument("custom-books", {
        title: bookData.title,
        authors: filteredAuthors,
        imageUrl: bookData.imageUrl,
        description: bookData.description,
        genres: filteredGenres,
        pageCount: Number(bookData.pageCount) || 0,
        addedBy: user.uid,
        addedAt: new Date().toISOString(),
        status: 'pending', // Add pending status
        approved: false,   // Add approval flag
      });

      // Add to user's pending books
      await addDocument("pending-books", {
        userId: user.uid,
        bookId: customBookRef.id,
        title: bookData.title,
        authors: filteredAuthors,
        imageUrl: bookData.imageUrl,
        description: bookData.description,
        addedAt: new Date().toISOString(),
        genres: filteredGenres,
        pageCount: Number(bookData.pageCount) || 0,
      });

      router.push("/booklist?message=Book submitted for review");
    } catch (error) {
      console.error("Error adding book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Return null while redirecting
  }

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Add Book Manually</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={bookData.title}
            onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
            className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Authors <span className="text-red-400">*</span>
          </label>
          {bookData.authors.map((author, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                required
                value={author}
                onChange={(e) => handleAuthorChange(index, e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addAuthorField}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add another author
          </button>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            value={bookData.description}
            onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
            className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg min-h-[150px]"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            value={bookData.imageUrl}
            onChange={(e) => setBookData({ ...bookData, imageUrl: e.target.value })}
            className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Page Count
          </label>
          <input
            type="number"
            min="0"
            value={bookData.pageCount}
            onChange={(e) => setBookData({ ...bookData, pageCount: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Genres
          </label>
          {bookData.genres.map((genre, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={genre}
                onChange={(e) => handleGenreChange(index, e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#3a3a3a] text-gray-100 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addGenreField}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add another genre
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/booklist")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </div>
      </form>
    </div>
  );
} 