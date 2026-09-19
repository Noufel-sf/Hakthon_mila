import { AidCategory, ZoneType } from './types';

export const AID_CATEGORIES: {
  id: AidCategory;
  nameAr: string;
  nameFr: string;
  defaultZone: ZoneType;
  icon: string;
  color: string;
}[] = [
  {
    id: 'food',
    nameAr: 'المواد الغذائية والتموين',
    nameFr: 'Food & Nutrition',
    defaultZone: 'Zone A',
    icon: '🍲',
    color: 'emerald',
  },
  {
    id: 'bedding',
    nameAr: 'الأفرشة والبطانيات',
    nameFr: 'Bedding & Blankets',
    defaultZone: 'Zone B',
    icon: '🛏️',
    color: 'indigo',
  },
  {
    id: 'appliances',
    nameAr: 'الأجهزة الكهرومنزلية',
    nameFr: 'Home Appliances',
    defaultZone: 'Zone C',
    icon: '⚡',
    color: 'amber',
  },
  {
    id: 'furniture',
    nameAr: 'الأثاث والأرائك والكنبات',
    nameFr: 'Furniture & Sofas',
    defaultZone: 'Zone D',
    icon: '🛋️',
    color: 'rose',
  },
  {
    id: 'medical',
    nameAr: 'الأدوية والإسعافات الأولية',
    nameFr: 'Medical & First Aid',
    defaultZone: 'Zone A',
    icon: '🩺',
    color: 'sky',
  },
  {
    id: 'hygiene',
    nameAr: 'مستلزمات النظافة وحفاضات الأطفال',
    nameFr: 'Hygiene & Diapers',
    defaultZone: 'Zone B',
    icon: '🧴',
    color: 'teal',
  },
];

export const WAREHOUSE_ZONES: {
  id: ZoneType;
  title: string;
  category: AidCategory;
  description: string;
  color: string;
  rule: string;
}[] = [
  {
    id: 'Zone A',
    title: 'المنطقة أ: التموين والأغذية',
    category: 'food',
    description: 'تخزين الطرود الغذائية، الحليب، المياه والمعلبات',
    color: 'emerald',
    rule: 'تخزين بدرجة حرارة ملائمة ومراقبة تواريخ الصلاحية أولاً بأول (FIFO)',
  },
  {
    id: 'Zone B',
    title: 'المنطقة ب: الأفرشة والبطانيات',
    category: 'bedding',
    description: 'تخزين الأفرشة الإسفنجية، البطانيات الصوفية والمفروشات',
    color: 'indigo',
    rule: 'تخزين جاف ومحمي من الرطوبة والغبار فوق منصات خشبية (Pallets)',
  },
  {
    id: 'Zone C',
    title: 'المنطقة ج: الكهرومنزلي والمعدات الثقيلة',
    category: 'appliances',
    description: 'ثلاجات، مدافئ، أفران، مولدات كهربائية ومضخات',
    color: 'amber',
    rule: 'مساحة مناورة للرافعات الشوكية وفحص السلامة والتشغيل',
  },
  {
    id: 'Zone D',
    title: 'المنطقة د: الأثاث والكنبات',
    category: 'furniture',
    description: 'الأرائك، الصالونات، الطاولات والكراسي',
    color: 'rose',
    rule: 'مساحة تخزين واسعة لحجم الأثاث الكبير لتسهيل التحميل المباشر',
  },
];

export const ALGERIAN_DISASTER_WILAYAS = [
  'جيجل',
  'ميلة',
  'سكيكدة',
  'بجاية',
  'تيزي وزو',
  'البليدة',
  'عين الدفلى',
];
