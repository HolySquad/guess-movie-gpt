export const metadata = {
  title: "What The Film",
  description: "Guess the film by its backdrop",
};

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="en">
      <Analytics></Analytics>
      <body>{children}</body>
    </html>
  );
}