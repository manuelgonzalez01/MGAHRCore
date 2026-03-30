export function createSelfServiceId(prefix = "SS") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function sortByDateDesc(items = [], key = "createdAt") {
  return [...items].sort((left, right) => new Date(right[key] || 0) - new Date(left[key] || 0));
}

export function sumBy(items = [], resolver = (item) => item) {
  return items.reduce((total, item) => total + (Number(resolver(item)) || 0), 0);
}

export function triggerJsonDownload(fileName, content) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
