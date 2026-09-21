import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bawsala-plus.dz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/depots',
          '/depots/*',
          '/needs',
          '/_next/static/*',
          '/bawsala+.png',
          '/relief-depot.jpg',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/depots',
          '/depots/*',
          '/needs',
          '/_next/static/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
