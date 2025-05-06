"use client";

import styles from "./page.module.css";
import MyCalendar from "./components/MyCalendar";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>SDLC Calendar</h1>
        <MyCalendar />
      </main>
    </div>
  );
}
