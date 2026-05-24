"use client";

import { useEffect, useState } from "react";
import { getSavedLang, translateStaticText, type Lang } from "@/lib/i18n";

function translateTree(lang: Lang) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();

        if (["script", "style", "textarea", "input", "code", "pre"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        const value = node.nodeValue || "";
        if (!value.trim()) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const value = node.nodeValue || "";
    const leading = value.match(/^\s*/)?.[0] ?? "";
    const trailing = value.match(/\s*$/)?.[0] ?? "";
    const translated = translateStaticText(value.trim(), lang);

    if (translated !== value.trim()) {
      node.nodeValue = `${leading}${translated}${trailing}`;
    }
  }

  const inputMap: Record<string, string> = {
    "STERGERE": "DELETE",
    "STERGERE / DELETE": "DELETE",
  };

  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((element) => {
    const item = element as HTMLInputElement | HTMLTextAreaElement;
    const placeholder = item.placeholder?.trim();

    if (!placeholder) return;

    if (lang === "en" && inputMap[placeholder]) {
      item.placeholder = inputMap[placeholder];
      return;
    }

    const translated = translateStaticText(placeholder, lang);
    if (translated !== placeholder) item.placeholder = translated;
  });
}

export default function ClientTextTranslator() {
  const [lang, setLang] = useState<Lang>("ro");

  useEffect(() => {
    const read = () => setLang(getSavedLang());

    read();

    window.addEventListener("storage", read);
    window.addEventListener("calculator-salariu-lang-change", read);

    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("calculator-salariu-lang-change", read);
    };
  }, []);

  useEffect(() => {
    translateTree(lang);

    const observer = new MutationObserver(() => translateTree(lang));
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lang]);

  return null;
}
