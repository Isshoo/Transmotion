export function formatDate(date, formatStr = "dd MMM yyyy") {
  const { format } = require("date-fns");
  return format(new Date(date), formatStr);
}

export function formatCurrency(amount, locale = "id-ID", currency = "IDR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
