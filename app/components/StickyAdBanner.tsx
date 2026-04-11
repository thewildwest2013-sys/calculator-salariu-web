"use client";

export default function StickyAdBanner() {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "red",
        color: "white",
        padding: "12px",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      TEST BANNER
    </div>
  );
}