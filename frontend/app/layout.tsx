import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Gym & Fitness Assistant",
  description: "AI-powered personal fitness management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}