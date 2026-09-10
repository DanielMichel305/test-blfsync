const arabicMetricUnits: Record<string, string> = {
  souls: 'نفوس',
  streams: 'مشاهدات',
  usd: 'دولار',
  egp: 'جنيه مصري',
  'houses built': 'منازل مبنية',
};

// The API currently supplies one name/description value, so preserve it exactly.
export const getLocalizedTrackName = (_trackId: string, fallbackName: string, _language: 'en' | 'ar') => fallbackName;
export const getLocalizedTrackDesc = (_trackId: string, fallbackDesc: string, _language: 'en' | 'ar') => fallbackDesc;

export const getLocalizedTrackUnitLabel = (_trackId: string, fallbackUnit: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallbackUnit;
  return arabicMetricUnits[fallbackUnit] || fallbackUnit;
};

// Badge definitions are server-managed and do not expose localized variants.
export const getLocalizedBadgeName = (_badgeType: string, fallback: string, _language: 'en' | 'ar') => fallback;
export const getLocalizedBadgeDesc = (_badgeType: string, fallback: string, _language: 'en' | 'ar') => fallback;
