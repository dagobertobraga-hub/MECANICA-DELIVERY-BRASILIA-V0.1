export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const maskPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value.slice(0, 15);
};

export const maskCurrency = (value: string | number) => {
  if (value === undefined || value === null) return "R$ 0,00";
  let v = typeof value === 'number' ? (value * 100).toFixed(0) : value.replace(/\D/g, "");
  if (!v) return "R$ 0,00";
  v = (Number(v) / 100).toFixed(2).replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return "R$ " + v;
};

export const parseCurrencyToNumber = (value: string) => {
  if (!value) return 0;
  return Number(value.replace(/\D/g, "")) / 100;
};

export const formatPlate = (plate: string) => {
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned.slice(0, 7);
};

export const toUpperCase = (text: string) => text.toUpperCase();

export const calculateNextMaintenance = (currentKm: number, lastKm: number, interval: number) => {
  const remaining = (lastKm + interval) - currentKm;
  return remaining > 0 ? remaining : 0;
};