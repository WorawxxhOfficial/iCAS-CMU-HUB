import React from "react";
import styles from "./DateHeader.module.css";

interface DateHeaderProps {
  label: string;
}

export function DateHeader({ label }: DateHeaderProps) {
  return (
    <div className={styles.dateHeader}>
      <div className={styles.dateLine} />
      <span className={styles.dateLabel}>{label}</span>
      <div className={styles.dateLine} />
    </div>
  );
}

