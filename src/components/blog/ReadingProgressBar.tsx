"use client";
import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        left: 0,
        width: `${progress}%`,
        height: 2,
        background: "#1E4530",
        zIndex: 50,
        transition: "width 0.05s linear",
        pointerEvents: "none",
      }}
    />
  );
}
