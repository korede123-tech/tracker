import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mavin Campaign Operations Dashboard",
  description: "Internal campaign management platform for Mavin Records",
  icons: {
    icon: "/image/mavin.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
