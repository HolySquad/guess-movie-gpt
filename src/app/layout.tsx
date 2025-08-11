export const metadata = {
  title: "What The Film — TMDb",
  description: "Guess the film by its backdrop — TMDb images proxied to avoid CORS",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}