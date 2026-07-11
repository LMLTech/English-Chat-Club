import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "English Chat Club",
    template: "%s | English Chat Club",
  },
  description: "Nền tảng luyện tiếng Anh thực tế – kết nối, học hỏi và phát triển cùng cộng đồng ECC",
  keywords: ["english", "học tiếng anh", "IELTS", "chat club", "luyện nói"],
  authors: [{ name: "ECC Team" }],
  openGraph: {
    title: "English Chat Club",
    description: "Nền tảng luyện tiếng Anh thực tế",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "hsl(224 71% 6%)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "hsl(213 31% 91%)",
            },
          }}
        />
      </body>
    </html>
  );
}