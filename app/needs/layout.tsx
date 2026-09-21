import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bawsalaplus.vercel.app';

export const metadata: Metadata = {
  title: 'مرصد الاحتياجات والنواقص الميدانية',
  description:
    'المرصد الوطني الميداني للاحتياجات والنواقص الحرجة في مستودعات الإغاثة بالجزائر. راقب العجز والفائض لحظياً لمواد التموين، الأفرشة، والمستلزمات الطبية لتوجيه التبرعات مباشرة دون تكدس.',
  alternates: {
    canonical: '/needs',
  },
  openGraph: {
    title: 'مرصد الاحتياجات والنواقص الميدانية | البوصلة +',
    description:
      'قائمة الاحتياجات العاجلة ومستوى العجز والفائض في مستودعات الإغاثة لمساعدة المتضررين من الكوارث في الجزائر.',
    url: `${SITE_URL}/needs`,
    images: [
      {
        url: '/bawsala+.png',
        width: 1200,
        height: 630,
        alt: 'مرصد الاحتياجات والنواقص الميدانية - البوصلة +',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرصد الاحتياجات والنواقص الميدانية | البوصلة +',
    description:
      'بيان النواقص ومستوى العجز في مستودعات إغاثة الكوارث بالجزائر لتوجيه التبرعات بدقة.',
    images: ['/bawsala+.png'],
  },
};

const needsBreadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'مرصد الاحتياجات والنواقص',
      item: `${SITE_URL}/needs`,
    },
  ],
};

export default function NeedsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={needsBreadcrumbs} />
      {children}
    </>
  );
}
