export function toDisplayGlucose(value, unit = 'mg/dL') {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value ?? '-';
  return unit === 'mmol/L' ? Number((numeric / 18).toFixed(1)) : Math.round(numeric);
}

export function toMgDl(value, unit = 'mg/dL') {
  if (value === '' || value == null) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return unit === 'mmol/L' ? numeric * 18 : numeric;
}

export function getThresholds(settings = {}) {
  const unit = settings.glucoseUnit ?? 'mg/dL';
  const low = toMgDl(settings.lowThreshold, unit) ?? 70;
  const high = toMgDl(settings.highThreshold, unit) ?? 180;
  return { low, high };
}

export function convertGlucoseSettingValue(value, fromUnit, toUnit) {
  if (value === '' || value == null || fromUnit === toUnit) return value;
  const mgDl = toMgDl(value, fromUnit);
  if (mgDl == null) return '';
  return String(toDisplayGlucose(mgDl, toUnit));
}
