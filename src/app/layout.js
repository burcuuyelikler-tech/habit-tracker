import "./globals.css";

export const metadata = {
  title: "Habit Vault",
  description: "Premium habit tracker — track, remind, reward.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#0F0D0A",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
