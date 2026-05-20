// components/notification-bell.tsx
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";

interface NotificationBellProps {
  userId: string;
  initialUnreadCount: number;
}

export function NotificationBell({
  userId,
  initialUnreadCount,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn(
        "Pusher is not initialized because NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER is missing."
      );
      return;
    }

    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`user-${userId}`);
    channel.bind("new-notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [userId]);

  return (
    <Link href="/notifications" className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
