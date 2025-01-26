// Comment out the entire file
/*
"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { updateDocument } from "@/lib/firebase/firebaseUtils";
import { User } from "firebase/auth";

interface PostProps {
  post: {
    id: string;
    text: string;
    imageUrl?: string;
    userId: string;
    userName: string;
    userImage: string;
    createdAt: string;
    likes: string[];
    comments?: Comment[];
  };
  currentUser: User;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  createdAt: string;
}

export default function Post({ post, currentUser }: PostProps) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(likes.includes(currentUser.uid));
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    const newLikes = isLiked
      ? likes.filter((id) => id !== currentUser.uid)
      : [...likes, currentUser.uid];
    
    setLikes(newLikes);
    await updateDocument("posts", post.id, { likes: newLikes });
  };

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const newComment = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userImage: currentUser.photoURL || '',
        text: commentText,
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...comments, newComment];
      await updateDocument("posts", post.id, { 
        comments: updatedComments 
      });
      
      setComments(updatedComments);
      setCommentText("");
      setShowCommentInput(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Image
            src={post.userImage}
            alt={post.userName}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <p className="font-medium">{post.userName}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-gray-800">{post.text}</p>
        {post.imageUrl && (
          <div className="relative w-full flex justify-center bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-48 h-72 relative">
              <img
                src={post.imageUrl.replace('http://', 'https://')}
                alt="Book cover"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
            <span>{likes.length}</span>
          </button>
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment ({comments.length})</span>
          </button>
        </div>

        {showCommentInput && (
          <div className="mt-4 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCommentInput(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                disabled={isCommenting || !commentText.trim()}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCommenting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-2 text-sm">
                <Image
                  src={comment.userImage}
                  alt={comment.userName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium">{comment.userName}</p>
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
*/ 