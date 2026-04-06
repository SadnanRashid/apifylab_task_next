import type { Metadata } from "next";
import Script from "next/script";

import "../public/assets/css/bootstrap.min.css";
import "../public/assets/css/common.css";
import "../public/assets/css/main.css";
import "../public/assets/css/responsive.css";

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Social Feed App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/images/logo-copy.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script src="/assets/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
