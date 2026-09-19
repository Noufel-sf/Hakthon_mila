import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ReliefProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import LiveCrisisTicker from "@/components/LiveCrisisTicker";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "إغاثة | المنصة الوطنية للتنسيق اللوجستي وإدارة مستودعات المساعدات",
  description: "منصة رقمية لتنظيم وتوجيه قوافل المساعدات الإنسانية والتسيير الذكي للمستودعات وتوزيع الإعانات العادل أثناء الكوارث",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        <ReliefProvider>
          <LiveCrisisTicker />
          <Navbar />
          <main className="flex-1 pb-16">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-slate-900/60 py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>منظومة إغاثة المركزية — هاكاثون ميلة للابتكار المجتمعي</span>
              </div>
              <p className="text-slate-400">
                منصة توجيهية مستقلة لا تفرض مسار القوافل بل توفر المعلومة الدقيقة لترشيد العطاء ومنع الهدر.
              </p>
            </div>
          </footer>
        </ReliefProvider>
      </body>
    </html>
  );
}
