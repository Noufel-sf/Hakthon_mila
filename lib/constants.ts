import { AidCategory, Priority, DepotStatus } from './types';

export const AID_CATEGORIES: {
  id: AidCategory;
  nameAr: string;
  nameFr: string;
  icon: string;
  color: string;
  commonUnits: string[];
  requiresExpirationDate: boolean;
}[] = [
  {
    id: 'FOOD',
    nameAr: 'المواد الغذائية والتموين',
    nameFr: 'Food & Nutrition',
    icon: '🍲',
    color: 'emerald',
    commonUnits: ['KG', 'BOXES', 'PACKS', 'طرد', 'علبة'],
    requiresExpirationDate: true,
  },
  {
    id: 'WATER',
    nameAr: 'مياه الشرب المعدنية',
    nameFr: 'Drinking Water',
    icon: '💧',
    color: 'sky',
    commonUnits: ['PACKS', 'BOTTLES', 'حزمة', 'قارورة'],
    requiresExpirationDate: true,
  },
  {
    id: 'CLOTHES',
    nameAr: 'الملابس والألبسة الشتوية',
    nameFr: 'Clothes & Winter Wear',
    icon: '👕',
    color: 'indigo',
    commonUnits: ['PIECES', 'SETS', 'قطعة', 'طقم'],
    requiresExpirationDate: false,
  },
  {
    id: 'BLANKETS',
    nameAr: 'الأغطية والبطانيات الصوفية',
    nameFr: 'Blankets & Quilts',
    icon: '🧣',
    color: 'violet',
    commonUnits: ['PIECES', 'بطانية', 'غطاء'],
    requiresExpirationDate: false,
  },
  {
    id: 'MATTRESSES',
    nameAr: 'الأفرشة الإسفنجية ومستلزمات النوم',
    nameFr: 'Mattresses & Bedding',
    icon: '🛏️',
    color: 'indigo',
    commonUnits: ['PIECES', 'فراش', 'سرير'],
    requiresExpirationDate: false,
  },
  {
    id: 'FURNITURE',
    nameAr: 'الأثاث والأرائك والكنبات',
    nameFr: 'Furniture & Sofas',
    icon: '🛋️',
    color: 'rose',
    commonUnits: ['PIECES', 'كنبة', 'طاولة', 'أريكة'],
    requiresExpirationDate: false,
  },
  {
    id: 'APPLIANCES',
    nameAr: 'الأجهزة الكهرومنزلية',
    nameFr: 'Home Appliances',
    icon: '⚡',
    color: 'amber',
    commonUnits: ['UNITS', 'ثلاجة', 'مدفأة', 'فرن', 'وحدة'],
    requiresExpirationDate: false,
  },
  {
    id: 'MEDICAL',
    nameAr: 'الأدوية والإسعافات الأولية',
    nameFr: 'Medical & First Aid',
    icon: '🩺',
    color: 'rose',
    commonUnits: ['BOXES', 'علبة', 'طرد إغاثة'],
    requiresExpirationDate: true,
  },
  {
    id: 'HYGIENE',
    nameAr: 'مستلزمات النظافة وحفاضات الأطفال',
    nameFr: 'Hygiene & Diapers',
    icon: '🧴',
    color: 'teal',
    commonUnits: ['PACKS', 'BOXES', 'علبة', 'حزمة'],
    requiresExpirationDate: false,
  },
  {
    id: 'OTHER',
    nameAr: 'تجهيزات ومعدات إغاثية أخرى',
    nameFr: 'Other Equipment',
    icon: '📦',
    color: 'slate',
    commonUnits: ['UNITS', 'وحدة', 'قطعة'],
    requiresExpirationDate: false,
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

export const ITEM_NAME_AR: Record<string, string> = {
  'Bottled Mineral Water 1.5L Packs': 'حزم مياه معدنية 1.5 لتر',
  'Bottled Mineral Water 1.5L (Packs of 6)': 'حزم مياه معدنية 1.5 لتر (حزمة 6 قارورات)',
  'Emergency Family Tent 6-person': 'خيام إيواء عائلية طارئة (6 أفراد)',
  'Emergency Family Dome Tent (6-person)': 'خيام إيواء عائلية قبية (6 أفراد)',
  'Winter Thermal Blanket': 'بطانيات صوفية حرارية شتوية',
  'Thermal Heavyweight Blanket': 'بطانيات صوفية حرارية ثقيلة',
  'Thermal Winter Wool Blanket': 'بطانيات شتوية حرارية من الصوف',
  'Single Bed Foam Mattress': 'أفرشة نوم إسفنجية مفردة',
  'Single Bed High Density Foam Mattress': 'أفرشة نوم إسفنجية عالية الكثافة',
  'Pasteurized Whole Milk 1L': 'حليب معقم كامل الدسم 1 لتر',
  'UHT Long-life Whole Milk 1L': 'حليب معقم كامل الدسم طويل الأجل 1 لتر',
  'Infant Milk Formula 400g (Stage 1)': 'حليب أطفال رضع 400 غ (المرحلة 1)',
  'Baby Food Fruit & Vegetable Puree 120g': 'هريس خضار وفواكه للرضع 120 غ',
  'Family Hygiene Kit (Soap, Toothpaste, Sanitizer)': 'حقائب نظافة وطوارئ عائلية',
  'Family Emergency Hygiene Kit': 'حقائب نظافة وطوارئ عائلية',
  'Canned Tuna 160g': 'معلبات تونة 160 غرام',
  'Canned Tuna 160g in Vegetable Oil': 'معلبات تونة 160 غ في الزيت النباتي',
  'Heavy Duty Portable Water Storage Bladder 5000L': 'خزانات مياه مرنة متنقلة 5000 لتر',
  'Pediatric Oral Rehydration Salts & Electrolytes': 'أملاح معالجة الجفاف للأطفال',
  'Emergency Burn & Wound Dressing Packs': 'ضمادات ومستلزمات علاج الحروق والجروح',
  'Dry Food Family Ration Box': 'طرود غذائية جافة عائلية',
  'Infant Baby Clothes & Swaddle Blankets': 'ألبسة وقماطات للرضع وحديثي الولادة',
};

export function getItemNameAr(name: string): string {
  if (!name) return '';
  return ITEM_NAME_AR[name] || name;
}

export const UNIT_NAME_AR: Record<string, string> = {
  PACKS: 'حزمة',
  PIECES: 'قطعة',
  TENTS: 'خيمة',
  CARTONS: 'كرتون',
  CANS: 'علبة',
  KITS: 'حقيبة',
  UNITS: 'وحدة',
  BOXES: 'طرد',
  BOTTLES: 'قارورة',
  JARS: 'مرطبان',
  TINS: 'علبة',
  SACHETS: 'كيس',
  SETS: 'طقم',
};

export function getUnitNameAr(unit: string): string {
  if (!unit) return '';
  const u = String(unit).toUpperCase();
  return UNIT_NAME_AR[u] || unit;
}


