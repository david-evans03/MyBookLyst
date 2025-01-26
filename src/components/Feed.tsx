// Comment out the entire file
/*
"use client";

import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/firebase/firebaseUtils";
import Post from "@/components/Post";
import { useAuth } from "@/lib/hooks/useAuth";
import LoginForm from "./LoginForm";

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  userId: string;
  userName: string;
  userImage: string;
  createdAt: string;
  likes: string[];
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      const fetchedPosts = await getDocuments("posts");
      setPosts(fetchedPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    };

    if (user) {
      loadPosts();
    }
  }, [user]);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} currentUser={user} />
      ))}
    </div>
  );
}
*/ 