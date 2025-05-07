"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import MyCalendar from "./components/MyCalendar";
import SplashScreen from "./components/SplashScreen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className={styles.page}>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <main className={styles.main}>
          <h1>SDLC Calendar</h1>
          <MyCalendar />
        </main>
      )}
    </div>
  );
}