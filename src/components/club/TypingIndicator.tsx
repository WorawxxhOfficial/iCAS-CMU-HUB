import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
  users: Array<{ userId: number; userName: string }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].userName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].userName} and ${users[1].userName} are typing...`;
    } else {
      return `${users[0].userName} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className={styles.typingIndicator}>
      <Loader2 className={styles.typingSpinner} />
      <span className={styles.typingText}>{getTypingText()}</span>
    </div>
  );
}

