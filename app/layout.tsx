import type { Metadata } from "next";
import { Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LiveCrisisTicker from "@/components/LiveCrisisTicker";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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
  title: "إغاثة | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
  description: "منصة رقمية لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${alexandria.variable} ${cairo.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-[#E0533C] selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Toaster richColors position="top-center" dir="rtl" />
          <LiveCrisisTicker />
          <Navbar />
          <main className="flex-1 pb-16">
            {children}
          </main>
          <footer className="border-t border-border bg-slate-50 dark:bg-slate-900/60 py-8 text-center text-xs text-muted-foreground transition-colors">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">منظومة إغاثة الوطنية — هاكاثون ميلة</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                منصة لتوفير المعلومة الدقيقة لترشيد وتوجيه العطاء ومنع هدر المساعدات.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
