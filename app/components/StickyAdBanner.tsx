"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function StickyAdBanner() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT;

  useEffect(() => {
    if (!client || !slot) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense push error:", error);
    }
  }, [client, slot]);

  const isRealAdReady = Boolean(client && slot);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        padding: "8px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          minHeight: 70,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(7,19,38,0.96)",
          boxShadow: "0 0 30px rgba(0,0,0,0.25)",
          padding: "8px 10px",
          pointerEvents: "auto",
        }}
      >
        {isRealAdReady ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: "50px" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div
            style={{
              minHeight: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.78)",
              fontSize: 13,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Banner reclamă (placeholder)
          </div>
        )}
      </div>
    </div>
  );
}
