export const REVISION_PLANS = [
  {
    km: 10000,
    name: 'REVISÃO BÁSICA (10K)',
    items: ['Troca de óleo', 'Filtro de óleo', 'Filtro de ar', 'Inspeção de freios', 'Níveis de fluídos']
  },
  {
    km: 20000,
    name: 'REVISÃO INTERMEDIÁRIA (20K)',
    items: ['Itens 10k', 'Filtro de combustível', 'Alinhamento/Balanceamento', 'Limpeza de bicos']
  },
  {
    km: 40000,
    name: 'REVISÃO COMPLETA (40K)',
    items: ['Itens 20k', 'Velas de ignição', 'Fluído de freio', 'Fluído de arrefecimento', 'Pastilhas de freio']
  },
  {
    km: 60000,
    name: 'REVISÃO PREMIUM (60K)',
    items: ['Itens 40k', 'Correia dentada', 'Tensor', 'Bomba d’água', 'Óleo de transmissão']
  },
  {
    km: 100000,
    name: 'REVISÃO MASTER (100K)',
    items: ['Itens 60k', 'Amortecedores', 'Bucha/Pivô', 'Alternador', 'Limpeza de injeção']
  }
];

export const getNextRevision = (currentKm: number) => {
  return REVISION_PLANS.find(plan => plan.km > currentKm) || REVISION_PLANS[REVISION_PLANS.length - 1];
};

export const calculateUsagePrediction = (currentKm: number, avgKmMonth: number = 1000) => {
  const next10k = Math.ceil(currentKm / 10000) * 10000;
  const diff = next10k - currentKm;
  const months = diff / avgKmMonth;
  
  const date = new Date();
  date.setMonth(date.getMonth() + Math.round(months));
  
  return {
    nextKm: next10k,
    estimatedDate: date,
    remainingKm: diff
  };
};