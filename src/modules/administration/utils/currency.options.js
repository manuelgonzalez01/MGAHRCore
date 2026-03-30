export const CURRENCY_OPTIONS = [
  { value: "BOB", label: "Boliviano (BOB)", locale: "es-BO" },
  { value: "USD", label: "US Dollar (USD)", locale: "en-US" },
  { value: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { value: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { value: "DOP", label: "Peso dominicano (DOP)", locale: "es-DO" },
];

export function getCurrencyOptions() {
  return CURRENCY_OPTIONS;
}

export function isSupportedCurrency(currency = "") {
  return CURRENCY_OPTIONS.some((item) => item.value === currency);
}

export function getCurrencyMeta(currency = "BOB") {
  return CURRENCY_OPTIONS.find((item) => item.value === currency) || CURRENCY_OPTIONS[0];
}
