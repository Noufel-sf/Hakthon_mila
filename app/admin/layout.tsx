import type { Metadata } from 'next';
import AdminLayoutShell from './admin-layout-shell';

export const metadata: Metadata = {
  title: 'لوحة إدارة المستودع الذكي والعمليات اللوجستية',
  description: 'النظام الداخلي لتسيير وتوجيه مستودعات الإغاثة وشاحنات المساعدات الميدانية.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
