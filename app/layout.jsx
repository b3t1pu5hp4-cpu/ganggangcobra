import "./globals.css";

export const metadata = {
  title: "Gang Cobra — Photobooth",
  description: "A little place for memories worth keeping.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
