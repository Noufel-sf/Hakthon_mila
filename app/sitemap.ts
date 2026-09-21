import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bawsalaplus.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core static public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/depots`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/needs`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // Try to fetch dynamic depots list from API with resilient fallback
  try {
    const depots = await api.depots.list().catch(() => []);
    if (depots && depots.length > 0) {
      depots.forEach((depot) => {
        if (depot.id) {
          routes.push({
            url: `${SITE_URL}/depots/${depot.id}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    } else {
      // Fallback default depot routes for indexing
      [1, 2, 3].forEach((id) => {
        routes.push({
          url: `${SITE_URL}/depots/${id}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    }
  } catch {
    // If backend is not reached during static generation, provide standard depot routes
    [1, 2, 3].forEach((id) => {
      routes.push({
        url: `${SITE_URL}/depots/${id}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  }

  return routes;
}
