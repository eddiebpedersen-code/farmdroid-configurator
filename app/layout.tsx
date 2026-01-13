import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmDroid Configurator",
  description: "Configure your FarmDroid FD20 robot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
