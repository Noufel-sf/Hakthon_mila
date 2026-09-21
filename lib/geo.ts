/**
 * Geographic helper definitions and coordinate resolvers for Algerian wilayas
 */

export interface WilayaGeoCoordinate {
  nameAr: string;
  nameFr: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const ALGERIA_CENTER: [number, number] = [36.45, 5.25];
export const ALGERIA_DEFAULT_ZOOM = 7;

export const WILAYA_COORDINATES: Record<string, WilayaGeoCoordinate> = {
  'ميلة': { nameAr: 'ميلة', nameFr: 'Mila', lat: 36.4503, lng: 6.2644, zoom: 11 },
  'Mila': { nameAr: 'ميلة', nameFr: 'Mila', lat: 36.4503, lng: 6.2644, zoom: 11 },
  'جيجل': { nameAr: 'جيجل', nameFr: 'Jijel', lat: 36.8206, lng: 5.7667, zoom: 11 },
  'Jijel': { nameAr: 'جيجل', nameFr: 'Jijel', lat: 36.8206, lng: 5.7667, zoom: 11 },
  'سكيكدة': { nameAr: 'سكيكدة', nameFr: 'Skikda', lat: 36.8762, lng: 6.9092, zoom: 11 },
  'Skikda': { nameAr: 'سكيكدة', nameFr: 'Skikda', lat: 36.8762, lng: 6.9092, zoom: 11 },
  'بجاية': { nameAr: 'بجاية', nameFr: 'Béjaïa', lat: 36.7511, lng: 5.0567, zoom: 11 },
  'Béjaïa': { nameAr: 'بجاية', nameFr: 'Béjaïa', lat: 36.7511, lng: 5.0567, zoom: 11 },
  'تيزي وزو': { nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', lat: 36.7118, lng: 4.0459, zoom: 11 },
  'Tizi Ouzou': { nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', lat: 36.7118, lng: 4.0459, zoom: 11 },
  'البليدة': { nameAr: 'البليدة', nameFr: 'Blida', lat: 36.4700, lng: 2.8277, zoom: 11 },
  'Blida': { nameAr: 'البليدة', nameFr: 'Blida', lat: 36.4700, lng: 2.8277, zoom: 11 },
  'عين الدفلى': { nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', lat: 36.2642, lng: 1.9679, zoom: 11 },
  'Aïn Defla': { nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', lat: 36.2642, lng: 1.9679, zoom: 11 },
  'الجزائر': { nameAr: 'الجزائر العاصمة', nameFr: 'Algiers', lat: 36.7538, lng: 3.0588, zoom: 11 },
  'Alger': { nameAr: 'الجزائر العاصمة', nameFr: 'Algiers', lat: 36.7538, lng: 3.0588, zoom: 11 },
  'قسنطينة': { nameAr: 'قسنطينة', nameFr: 'Constantine', lat: 36.3650, lng: 6.6147, zoom: 11 },
  'Constantine': { nameAr: 'قسنطينة', nameFr: 'Constantine', lat: 36.3650, lng: 6.6147, zoom: 11 },
  'سطيف': { nameAr: 'سطيف', nameFr: 'Sétif', lat: 36.1898, lng: 5.4108, zoom: 11 },
  'Sétif': { nameAr: 'سطيف', nameFr: 'Sétif', lat: 36.1898, lng: 5.4108, zoom: 11 },
  'بومرداس': { nameAr: 'بومرداس', nameFr: 'Boumerdès', lat: 36.7598, lng: 3.4735, zoom: 11 },
  'Boumerdès': { nameAr: 'بومرداس', nameFr: 'Boumerdès', lat: 36.7598, lng: 3.4735, zoom: 11 },
  'وهران': { nameAr: 'وهران', nameFr: 'Oran', lat: 35.6987, lng: -0.6349, zoom: 11 },
  'Oran': { nameAr: 'وهران', nameFr: 'Oran', lat: 35.6987, lng: -0.6349, zoom: 11 },
  'عنابة': { nameAr: 'عنابة', nameFr: 'Annaba', lat: 36.9000, lng: 7.7667, zoom: 11 },
  'Annaba': { nameAr: 'عنابة', nameFr: 'Annaba', lat: 36.9000, lng: 7.7667, zoom: 11 },
  'البويرة': { nameAr: 'البويرة', nameFr: 'Bouira', lat: 36.3749, lng: 3.9020, zoom: 11 },
  'Bouira': { nameAr: 'البويرة', nameFr: 'Bouira', lat: 36.3749, lng: 3.9020, zoom: 11 },
  'باتنة': { nameAr: 'باتنة', nameFr: 'Batna', lat: 35.5558, lng: 6.1741, zoom: 11 },
  'Batna': { nameAr: 'باتنة', nameFr: 'Batna', lat: 35.5558, lng: 6.1741, zoom: 11 },
};

/**
 * Resolves accurate coordinates for a depot.
 * Checks depot's explicit latitude/longitude first.
 * If not provided or zero, uses Wilaya centroid with a deterministic offset based on depot id.
 */
export function resolveDepotCoordinates(depot: {
  id?: string | number;
  depotId?: string | number;
  location?: {
    wilaya?: string;
    commune?: string;
    latitude?: number;
    longitude?: number;
  };
  wilaya?: string;
}): [number, number] {
  const lat = depot.location?.latitude;
  const lng = depot.location?.longitude;

  if (typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }

  const wilayaName = (depot.location?.wilaya || depot.wilaya || '').trim();
  const baseCoord = WILAYA_COORDINATES[wilayaName];

  const rawId = depot.depotId ?? depot.id ?? 1;
  const numericId = typeof rawId === 'number' ? rawId : (parseInt(String(rawId).replace(/\D/g, ''), 10) || 1);

  // Deterministic micro-jitter (within ~2km) to prevent markers in the same wilaya from stacking directly on top of each other
  const jitterLat = ((numericId * 17) % 7 - 3) * 0.008;
  const jitterLng = ((numericId * 23) % 7 - 3) * 0.008;

  if (baseCoord) {
    return [baseCoord.lat + jitterLat, baseCoord.lng + jitterLng];
  }

  // Fallback to center of Algeria disaster zone
  return [ALGERIA_CENTER[0] + jitterLat, ALGERIA_CENTER[1] + jitterLng];
}
