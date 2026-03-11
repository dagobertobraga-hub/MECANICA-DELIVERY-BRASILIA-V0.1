export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPlate = (plate: string) => {
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 7) {
    // Formato Mercosul: AAA1A11 ou Antigo: AAA1111
    return cleaned;
  }
  return cleaned.slice(0, 7);
};

export const toUpperCase = (text: string) => text.toUpperCase();

export const calculateNextMaintenance = (currentKm: number, lastKm: number, interval: number) => {
  const remaining = (lastKm + interval) - currentKm;
  return remaining > 0 ? remaining : 0;
};