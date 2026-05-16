"use client";
import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        fontFamily: "var(--font-syne)",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: copied ? "var(--green)" : "var(--muted)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        transition: "color 0.15s",
      }}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
