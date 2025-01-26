"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

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
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    router.push(`/profile/${notification.fromUserId}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                {notification.fromUserPhoto ? (
                  <img
                    src={notification.fromUserPhoto}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                )}
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.fromUserName}</span>
                    {' followed you'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
} 