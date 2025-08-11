export const metadata = {
  title: "What The Film",
  description: "Guess the film by its backdrop",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}