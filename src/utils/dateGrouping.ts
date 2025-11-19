/**
 * Date grouping and formatting utilities for chat messages
 */

export interface DateGroup {
  date: Date;
  label: string;
  key: string;
}

/**
 * Get date label for grouping messages
 * Returns "Today", "Yesterday", or formatted date string
 */
export function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    // Format as "January 15, 2024"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

/**
 * Get a unique key for a date group
 */
export function getDateGroupKey(date: Date): string {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  return `date-${dateStr}`;
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format timestamp with enhanced relative/absolute formatting
 * - Recent (< 1 minute): "Just now"
 * - Recent (< 1 hour): "X minutes ago"
 * - Today: "10:29 AM"
 * - Yesterday: "Yesterday, 10:29 AM"
 * - This year: "Jan 15, 10:29 AM"
 * - Older: "Jan 15, 2024, 10:29 AM"
 */
export function formatChatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Just now (< 1 minute)
  if (diffMinutes < 1) {
    return "Just now";
  }

  // X minutes ago (< 1 hour)
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  // Today (< 24 hours, same day)
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Older (different year)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Group messages by date
 * Returns an array of { date, label, key } for each unique date
 */
export function groupMessagesByDate<T extends { createdAt: Date }>(
  messages: T[]
): Array<{ date: Date; label: string; key: string; messages: T[] }> {
  if (messages.length === 0) return [];

  const groups = new Map<string, { date: Date; label: string; key: string; messages: T[] }>();

  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = getDateGroupKey(messageDate);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: messageDate,
        label: getDateLabel(messageDate),
        key: dateKey,
        messages: [],
      });
    }

    groups.get(dateKey)!.messages.push(message);
  });

  // Sort groups by date (oldest first)
  return Array.from(groups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

