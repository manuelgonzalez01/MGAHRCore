export function createHealthId(prefix = "HLT") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-5)}`;
}

export function sumBy(items = [], selector = (item) => item) {
  return items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);
}

export function buildFilterOptions(items = [], labelKey = "name") {
  return items.map((item) => ({
    value: item.id,
    label: item[labelKey] || item.name || item.title || item.id,
  }));
}

export function pickByIndex(items = [], step = 2, offset = 0) {
  return items.filter((_, index) => (index + offset) % step === 0);
}
