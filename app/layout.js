import "./globals.css";

export const metadata = {
  title: "Habit Tracker",
  description: "Your monthly habit tracker, automated.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
