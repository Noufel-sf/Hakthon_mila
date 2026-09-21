import type { Metadata } from 'next';
import { api } from '@/lib/api';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bawsala-plus.dz';

interface DepotLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  let depotName = `مستودع الإغاثة #${id}`;
  let wilaya = '';
  let commune = '';
  let description = 'مستودع إغاثة ميداني معتمد لتنسيق وتفريغ المساعدات الإنسانية في الجزائر.';

  if (!isNaN(numericId)) {
    try {
      const publicData = await api.public.getDepotDetails(numericId).catch(() => null);
      const adminData = !publicData ? await api.depots.getById(numericId).catch(() => null) : null;
      const data = publicData || adminData;

      if (data) {
        depotName = data.name || depotName;
        wilaya = data.wilaya || data.location?.wilaya || '';
        commune = data.commune || data.location?.commune || '';
        if (data.description) {
          description = data.description;
        } else if (wilaya) {
          description = `المستودع الميداني المعتمد لولاية ${wilaya}${commune ? ` - بلدية ${commune}` : ''}. تفاصيل الطاقة الاستيعابية، المواد المتوفرة، ونقطة توجيه الشاحنات.`;
        }
      }
    } catch {
      // Graceful fallback to default title & description
    }
  }

  const title = wilaya ? `${depotName} (ولاية ${wilaya})` : depotName;

  return {
    title,
    description,
    alternates: {
      canonical: `/depots/${id}`,
    },
    openGraph: {
      title: `${title} | البوصلة +`,
      description,
      url: `${SITE_URL}/depots/${id}`,
      images: [
        {
          url: '/relief-depot.jpg',
          width: 1200,
          height: 800,
          alt: `${depotName} - مستودع إغاثة الجزائر`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | البوصلة +`,
      description,
      images: ['/relief-depot.jpg'],
    },
  };
}

export default async function SingleDepotLayout({
  children,
  params,
}: DepotLayoutProps) {
  const { id } = await params;
  const numericId = Number(id);

  let depotName = `مستودع الإغاثة #${id}`;
  let wilaya = '';
  let commune = '';
  let address = '';
  let phone = '';

  if (!isNaN(numericId)) {
    try {
      const publicData = await api.public.getDepotDetails(numericId).catch(() => null);
      const adminData = !publicData ? await api.depots.getById(numericId).catch(() => null) : null;
      const data = publicData || adminData;
      if (data) {
        depotName = data.name || depotName;
        wilaya = data.wilaya || data.location?.wilaya || '';
        commune = data.commune || data.location?.commune || '';
        address = data.address || data.location?.address || '';
        phone = data.phone || data.managerPhone || '';
      }
    } catch {
      // Fallback
    }
  }

  const depotStructuredData = [
    {
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
        {
          '@type': 'ListItem',
          position: 3,
          name: depotName,
          item: `${SITE_URL}/depots/${id}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CivicStructure',
      name: depotName,
      description: `مستودع إغاثة ونقطة تفريغ ميدانية معتمدة بولاية ${wilaya || 'الجزائر'}`,
      url: `${SITE_URL}/depots/${id}`,
      image: `${SITE_URL}/relief-depot.jpg`,
      ...(phone ? { telephone: phone } : {}),
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'DZ',
        ...(wilaya ? { addressRegion: wilaya } : {}),
        ...(commune ? { addressLocality: commune } : {}),
        ...(address ? { streetAddress: address } : {}),
      },
    },
  ];

  return (
    <>
      <JsonLd data={depotStructuredData} />
      {children}
    </>
  );
}
