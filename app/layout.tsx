import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";

import { ThemeScript } from "@/components/shared/ThemeScript";
import { SHOP } from "@/lib/constants/shop";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Used for exactly one thing: the account reference code, which people copy.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Display face for the buyer-facing pages only. The admin stays on Geist.
 *
 * Archivo is loaded with its width axis so headings can be set *expanded*.
 * That is the whole reason it is here: a wide grotesque is the lettering of
 * signage and catalogue plates — a dealer's floor, an auction lot number — and
 * the shop is asking a stranger to trust it with real money. Width reads as
 * authority in a way another neutral sans at a heavier weight does not, and it
 * contrasts with Geist on an axis Geist does not have, rather than being a
 * second sans that merely looks slightly different.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: {
    default: SHOP.name,
    template: `%s · ${SHOP.name}`,
  },
  description: "Buy and sell Mobile Legends: Bang Bang accounts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // ThemeScript sets `data-theme` on this element before React hydrates,
      // which is a deliberate server/client difference rather than a bug.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
