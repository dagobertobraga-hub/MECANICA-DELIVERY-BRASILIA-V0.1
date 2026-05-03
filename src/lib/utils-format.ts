export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPlate = (plate: string) => {
  // Remove tudo que não for letra ou número e limita a 7 caracteres
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned.slice(0, 7);
};

export const toUpperCase = (text: string) => text.toUpperCase();

export const calculateNextMaintenance = (currentKm: number, lastKm: number, interval: number) => {
  const remaining = (lastKm + interval) - currentKm;
  return remaining > 0 ? remaining : 0;
};