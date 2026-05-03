export type BudgetStatus = 'Rascunho' | 'Aberto' | 'Em Negociação' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Pago' | 'Recusado';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  type: 'Peça' | 'Serviço';
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  commissionRate: number; // Porcentagem (ex: 10 para 10%)
}

export interface Budget {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  vehiclePlate: string;
  km: number;
  status: BudgetStatus;
  items: BudgetItem[];
  professionalId?: string;
  commissionValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  km: number;
  description: string;
  value: number;
  type: 'Óleo' | 'Filtro' | 'Correia' | 'Suspensão' | 'Freios' | 'Injeção' | 'Elétrica' | 'Outros';
  photos?: string[];
  checklist?: Record<string, boolean>;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  clientName: string;
  clientPhone: string;
  password?: string;
  currentKm: number;
  oilIntervalKm: number;
  lastOilChangeKm: number;
  avgKmMonth?: number; // Previsão de uso mensal
  maintenances: MaintenanceRecord[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Schedule {
  id: string;
  clientName: string;
  vehiclePlate: string;
  date: string;
  time: string;
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
  createdAt: string;
}

export interface Review {
  id: string;
  clientName: string;
  vehiclePlate: string;
  rating: number;
  comment: string;
  date: string;
  budgetId: string;
}