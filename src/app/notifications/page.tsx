"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notifs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    router.push(`/profile/${notification.fromUserId}`);
  };

  return (
    <div className="max-w-2xl mx-auto pt-20 px-4">
      <h1 className="text-2xl font-bold text-gray-200 mb-6">Notifications</h1>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full p-4 rounded-lg ${
                !notification.read ? 'bg-[#2a2a2a]' : 'bg-[#1a1a1a]'
              } hover:bg-[#3a3a3a] transition-colors flex items-center gap-3`}
            >
              {notification.fromUserPhoto ? (
                <img
                  src={notification.fromUserPhoto}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2a2a2a]" />
              )}
              <div className="flex-1 text-left">
                <p className="text-gray-200">
                  <span className="font-semibold">{notification.fromUserName}</span>
                  {' followed you'}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
} 