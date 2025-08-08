export const metadata = {
  title: "Guess the Movie — TMDb",
  description: "Guess the movie new text here by its backdrop — TMDb images proxied to avoid CORS",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}