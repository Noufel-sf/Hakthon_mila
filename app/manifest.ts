import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'البوصلة + | منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر',
    short_name: 'البوصلة +',
    description:
      'منصة وطنية لتنظيم وتوجيه المساعدات الإنسانية والتسيير الذكي لمستودعات الإغاثة أثناء الكوارث الطبيعية والأزمات.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#03120D',
    theme_color: '#0E4B35',
    dir: 'rtl',
    lang: 'ar',
    categories: ['government', 'humanitarian', 'utilities', 'productivity'],
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
        purpose: 'any',
      },
      {
        src: '/bawsala+.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/bawsala+.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'الخريطة الميدانية التفاعلية',
        short_name: 'الخريطة',
        description: 'تتبع المستودعات وبؤر الكوارث وتوجيه الشاحنات',
        url: '/map',
        icons: [{ src: '/logo2.PNG', sizes: '192x192' }],
      },
      {
        name: 'الاحتياجات والنواقص الحرجة',
        short_name: 'النواقص',
        description: 'استكشاف المواد الإغاثية المطلوبة عاجلاً',
        url: '/needs',
        icons: [{ src: '/logo2.PNG', sizes: '192x192' }],
      },
      {
        name: 'دليل مستودعات الإغاثة',
        short_name: 'المستودعات',
        description: 'قائمة المستودعات ونقاط التفريغ المعتمدة',
        url: '/depots',
        icons: [{ src: '/logo2.PNG', sizes: '192x192' }],
      },
    ],
  };
}
