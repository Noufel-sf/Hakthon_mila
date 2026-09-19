import { AidCategory, ZoneType, Priority, DepotStatus } from './types';

export const AID_CATEGORIES: {
  id: AidCategory;
  nameAr: string;
  nameFr: string;
  defaultZone: ZoneType;
  icon: string;
  color: string;
  commonUnits: string[];
  requiresExpirationDate: boolean;
}[] = [
  {
    id: 'FOOD',
    nameAr: 'المواد الغذائية والتموين',
    nameFr: 'Food & Nutrition',
    defaultZone: 'Zone A',
    icon: '🍲',
    color: 'emerald',
    commonUnits: ['KG', 'BOXES', 'PACKS', 'طرد', 'علبة'],
    requiresExpirationDate: true,
  },
  {
    id: 'WATER',
    nameAr: 'مياه الشرب المعدنية',
    nameFr: 'Drinking Water',
    defaultZone: 'Zone A',
    icon: '💧',
    color: 'sky',
    commonUnits: ['PACKS', 'BOTTLES', 'حزمة', 'قارورة'],
    requiresExpirationDate: true,
  },
  {
    id: 'CLOTHES',
    nameAr: 'الملابس والألبسة الشتوية',
    nameFr: 'Clothes & Winter Wear',
    defaultZone: 'Zone B',
    icon: '👕',
    color: 'indigo',
    commonUnits: ['PIECES', 'SETS', 'قطعة', 'طقم'],
    requiresExpirationDate: false,
  },
  {
    id: 'BLANKETS',
    nameAr: 'الأغطية والبطانيات الصوفية',
    nameFr: 'Blankets & Quilts',
    defaultZone: 'Zone B',
    icon: '🧣',
    color: 'violet',
    commonUnits: ['PIECES', 'بطانية', 'غطاء'],
    requiresExpirationDate: false,
  },
  {
    id: 'MATTRESSES',
    nameAr: 'الأفرشة الإسفنجية ومستلزمات النوم',
    nameFr: 'Mattresses & Bedding',
    defaultZone: 'Zone B',
    icon: '🛏️',
    color: 'indigo',
    commonUnits: ['PIECES', 'فراش', 'سرير'],
    requiresExpirationDate: false,
  },
  {
    id: 'FURNITURE',
    nameAr: 'الأثاث والأرائك والكنبات',
    nameFr: 'Furniture & Sofas',
    defaultZone: 'Zone D',
    icon: '🛋️',
    color: 'rose',
    commonUnits: ['PIECES', 'كنبة', 'طاولة', 'أريكة'],
    requiresExpirationDate: false,
  },
  {
    id: 'APPLIANCES',
    nameAr: 'الأجهزة الكهرومنزلية',
    nameFr: 'Home Appliances',
    defaultZone: 'Zone C',
    icon: '⚡',
    color: 'amber',
    commonUnits: ['UNITS', 'ثلاجة', 'مدفأة', 'فرن', 'وحدة'],
    requiresExpirationDate: false,
  },
  {
    id: 'MEDICAL',
    nameAr: 'الأدوية والإسعافات الأولية',
    nameFr: 'Medical & First Aid',
    defaultZone: 'Zone A',
    icon: '🩺',
    color: 'rose',
    commonUnits: ['BOXES', 'علبة', 'طرد إغاثة'],
    requiresExpirationDate: true,
  },
  {
    id: 'HYGIENE',
    nameAr: 'مستلزمات النظافة وحفاضات الأطفال',
    nameFr: 'Hygiene & Diapers',
    defaultZone: 'Zone B',
    icon: '🧴',
    color: 'teal',
    commonUnits: ['PACKS', 'BOXES', 'علبة', 'حزمة'],
    requiresExpirationDate: false,
  },
  {
    id: 'OTHER',
    nameAr: 'تجهيزات ومعدات إغاثية أخرى',
    nameFr: 'Other Equipment',
    defaultZone: 'Zone C',
    icon: '📦',
    color: 'slate',
    commonUnits: ['UNITS', 'وحدة', 'قطعة'],
    requiresExpirationDate: false,
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
    title: 'المنطقة أ: التموين، الأغذية والمستلزمات الطبية',
    category: 'FOOD',
    description: 'تخزين الطرود الغذائية، الحليب، المياه، المعلبات والأدوية',
    color: 'emerald',
    rule: 'تخزين بدرجة حرارة ملائمة ومراقبة تواريخ الصلاحية أولاً بأول (FIFO)',
  },
  {
    id: 'Zone B',
    title: 'المنطقة ب: الأفرشة، البطانيات والنظافة',
    category: 'MATTRESSES',
    description: 'أفرشة إسفنجية، بطانيات شتوية، حفاضات أطفال ومستلزمات نظافة',
    color: 'indigo',
    rule: 'تخزين جاف ومحمي من الرطوبة والغبار فوق منصات خشبية (Pallets)',
  },
  {
    id: 'Zone C',
    title: 'المنطقة ج: الكهرومنزلي والمعدات الثقيلة',
    category: 'APPLIANCES',
    description: 'ثلاجات، مدافئ، أفران، مولدات كهربائية ومضخات',
    color: 'amber',
    rule: 'مساحة مناورة للرافعات الشوكية وفحص السلامة والتشغيل',
  },
  {
    id: 'Zone D',
    title: 'المنطقة د: الأثاث والكنبات والخيام',
    category: 'FURNITURE',
    description: 'الأرائك، الصالونات، الطاولات والكراسي وخيام الإيواء',
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

export const PRIORITY_LABELS: Record<Priority, { label: string; color: string }> = {
  CRITICAL: { label: 'حرج جداً', color: 'rose' },
  HIGH: { label: 'أولوية قصوى', color: 'amber' },
  MEDIUM: { label: 'متوسط', color: 'blue' },
  LOW: { label: 'مستقر / منخفض', color: 'emerald' },
};

export const DEPOT_STATUS_LABELS: Record<DepotStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'نشط ومتاح للتفريغ', color: 'emerald' },
  INACTIVE: { label: 'غير نشط', color: 'slate' },
  AT_CAPACITY: { label: 'مكتمل الطاقة الاستيعابية', color: 'rose' },
  TEMPORARILY_CLOSED: { label: 'مغلق مؤقتاً', color: 'amber' },
};

export function getZoneForCategory(category: AidCategory | string): ZoneType {
  const cat = String(category).toUpperCase();
  if (cat === 'FOOD' || cat === 'WATER' || cat === 'MEDICAL' || cat === 'HYGIENE') {
    return 'Zone A';
  }
  if (cat === 'CLOTHES' || cat === 'BLANKETS' || cat === 'MATTRESSES') {
    return 'Zone B';
  }
  if (cat === 'APPLIANCES') {
    return 'Zone C';
  }
  return 'Zone D';
}

