// Root layout - minimal wrapper that delegates to locale layouts
// The actual HTML structure is in /app/[locale]/layout.tsx

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
