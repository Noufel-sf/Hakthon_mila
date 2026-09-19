import type { Metadata } from "next";
import { Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveCrisisTicker from "@/components/LiveCrisisTicker";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import ApiSyncProvider from "@/components/ApiSyncProvider";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
  description: "منصة البوصلة + لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${alexandria.variable} ${cairo.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-[#E0533C] selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ApiSyncProvider>
            <Toaster richColors position="top-center" dir="rtl" />
            {/* <LiveCrisisTicker /> */}
            <Navbar />
            <main className="flex-1 pb-16">
              {children}
            </main>
            <Footer />
          </ApiSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
