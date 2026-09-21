import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bawsalaplus.vercel.app';

export const metadata: Metadata = {
  title: 'دليل المستودعات الميدانية',
  description:
    'دليل مستودعات ونقاط التفريغ المعتمدة لمساعدات الكوارث في مختلف ولايات الجزائر (ميلة، سكيكدة، جيجل). استكشف نسب الإشغال، الطاقة الاستيعابية، والتوزيع الجغرافي المباشر.',
  alternates: {
    canonical: '/depots',
  },
  openGraph: {
    title: 'دليل المستودعات الميدانية ونقاط التفريغ | البوصلة +',
    description:
      'بيان شامل ومباشر لجميع مستودعات الإغاثة الميدانية، نسب إشغالها، النواقص الحرجة، وإحداثيات نقاط التفريغ على الخريطة.',
    url: `${SITE_URL}/depots`,
    images: [
      {
        url: '/relief-depot.jpg',
        width: 1200,
        height: 800,
        alt: 'دليل مستودعات الإغاثة الميدانية في الجزائر',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دليل المستودعات الميدانية | البوصلة +',
    description:
      'دليل مستودعات ونقاط التفريغ المعتمدة لمساعدات الكوارث في الجزائر مع تتبع مباشر للحالة ونسب الإشغال.',
    images: ['/relief-depot.jpg'],
  },
};

const depotsBreadcrumbs = {
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
      name: 'دليل المستودعات الميدانية',
      item: `${SITE_URL}/depots`,
    },
  ],
};

export default function DepotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={depotsBreadcrumbs} />
      {children}
    </>
  );
}
