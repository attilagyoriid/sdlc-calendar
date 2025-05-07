"use client";

import { useState, useEffect } from "react";
import styles from "./SplashScreen.module.scss";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export default function SplashScreen({ 
  onComplete, 
  minDisplayTime = 2000 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.splashScreen}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <svg viewBox="0 0 100 100" className={styles.calendarIcon}>
            <rect x="20" y="20" width="60" height="60" rx="5" className={styles.calendarBase} />
            <rect x="30" y="10" width="5" height="20" rx="2" className={styles.calendarHanger} />
            <rect x="65" y="10" width="5" height="20" rx="2" className={styles.calendarHanger} />
            <rect x="20" y="30" width="60" height="10" className={styles.calendarHeader} />
            <circle cx="50" cy="55" r="15" className={styles.calendarCircle} />
          </svg>
        </div>
        <h1 className={styles.title}>SDLC Calendar</h1>
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress}></div>
        </div>
      </div>
    </div>
  );
}