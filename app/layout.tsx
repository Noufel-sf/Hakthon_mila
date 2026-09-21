import type { Metadata, Viewport } from "next";
import { Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import PublicBackgroundWrapper from "@/components/PublicBackgroundWrapper";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import ApiSyncProvider from "@/components/ApiSyncProvider";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bawsalaplus.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#006233" },
    { media: "(prefers-color-scheme: dark)", color: "#03120D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
    template: "%s | البوصلة +",
  },
  description:
    "المنصة الجزائرية الموحدة لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث الطبيعية والأزمات الميدانية.",
  applicationName: "البوصلة +",
  authors: [{ name: "فريق البوصلة + الجزائري", url: SITE_URL }],
  creator: "منصة البوصلة +",
  publisher: "منصة البوصلة +",
  keywords: [
    "البوصلة +",
    "Bawsala+",
    "إغاثة الجزائر",
    "مساعدات الكوارث في الجزائر",
    "مستودعات الإغاثة",
    "تنسيق المساعدات الإنسانية",
    "الهلال الأحمر الجزائري",
    "الحماية المدنية الجزائر",
    "توزيع المساعدات",
    "توجيه قوافل الإغاثة",
    "ميلة",
    "سكيكدة",
    "جيجل",
    "كارثة طبيعية الجزائر",
    "منصة إغاثة إنسانية",
    "Aide humanitaire Algérie",
    "Algeria disaster relief coordination",
    "Secours d'urgence Algérie",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "ar-DZ": "/",
      "fr-DZ": "/fr",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: SITE_URL,
    siteName: "البوصلة + | Bawsala+",
    title: "البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
    description:
      "المنصة الجزائرية الموحدة لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث الطبيعية والأزمات.",
    images: [
      {
        url: "/bawsala+.png",
        width: 1200,
        height: 630,
        alt: "شعار وهوية منصة البوصلة + لإغاثة الكوارث في الجزائر",
      },
      {
        url: "/relief-depot.jpg",
        width: 1200,
        height: 800,
        alt: "مستودعات الإغاثة الميدانية ونقاط التفريغ في الجزائر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
    description:
      "منصة ذكية موحدة لتنظيم وتوجيه المساعدات وتفادي تكدسها وتلفها أثناء الكوارث في الجزائر.",
    images: ["/bawsala+.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo2.PNG",
  },
  category: "humanitarian",
  classification: "منصة إغاثة إنسانية وإدارة كوارث",
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "البوصلة +",
    alternateName: ["Bawsala+", "منصة البوصلة + لإغاثة الكوارث الجزائرية"],
    url: SITE_URL,
    description:
      "منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر والتسيير الذكي لمستودعات الإغاثة",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["ar", "fr"],
  },
  {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    name: "البوصلة + | Bawsala+",
    alternateName: "منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر",
    description:
      "منصة وطنية لتنظيم وتوجيه المساعدات الإنسانية أثناء الكوارث الطبيعية والأزمات الميدانية في الجزائر",
    url: SITE_URL,
    logo: `${SITE_URL}/bawsala+.png`,
    image: `${SITE_URL}/relief-depot.jpg`,
    areaServed: {
      "@type": "Country",
      name: "Algeria",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "DZ",
      addressRegion: "Mila",
      streetAddress: "المستودع المركزي الميداني — ميلة، الجزائر",
    },
    telephone: "+213 34 50 12 34",
    email: "contact@ighatha-dz.org",
    knowsLanguage: ["ar", "fr", "ber"],
  },
];

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${alexandria.variable} ${cairo.variable}`}>
      <head>
        <JsonLd data={structuredData} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-[#006233] selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ApiSyncProvider>
            <Toaster richColors position="top-center" dir="rtl" />
            <PublicBackgroundWrapper>
              {children}
            </PublicBackgroundWrapper>
          </ApiSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
