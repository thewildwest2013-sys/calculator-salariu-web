"use client";

import Script from "next/script";

export default function MonetagBanner() {
  return (
    <Script
      id="monetag-inpage-push"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11153719',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
      }}
    />
  );
}