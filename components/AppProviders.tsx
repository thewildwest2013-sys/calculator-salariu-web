"use client";

import { UIProvider } from "@/lib/ui-context";
import AppChrome from "@/components/AppChrome";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <UIProvider><AppChrome>{children}</AppChrome></UIProvider>;
}
