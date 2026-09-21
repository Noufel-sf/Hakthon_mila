import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر',
    short_name: 'البوصلة +',
    description:
      'منصة وطنية لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث الطبيعية والأزمات.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#006233',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo2.PNG',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/bawsala+.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['government', 'humanitarian', 'utilities'],
  };
}
