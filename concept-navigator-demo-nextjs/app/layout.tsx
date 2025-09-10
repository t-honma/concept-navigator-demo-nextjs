export const metadata = {
  title: "Concept Navigator",
  description: "プロトタイプ ver2.0"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
