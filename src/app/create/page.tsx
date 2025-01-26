// Comment out the entire file
/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDocument, uploadFile } from "@/lib/firebase/firebaseUtils";
import ImageUpload from "@/components/ImageUpload";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      let imageUrl;
      if (image) {
        imageUrl = await uploadFile(image, `posts/${Date.now()}_${image.name}`);
      }

      await addDocument("posts", {
        text,
        imageUrl,
        userId: user.uid,
        userName: user.displayName,
        userImage: user.photoURL,
        createdAt: new Date().toISOString(),
        likes: [],
      });

      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
        <ImageUpload onImageChange={setImage} />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
*/ 