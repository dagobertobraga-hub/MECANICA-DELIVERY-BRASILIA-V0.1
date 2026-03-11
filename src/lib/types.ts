export type BudgetStatus = 'Rascunho' | 'Aberto' | 'Em Negociação' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Pago' | 'Recusado';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  type: 'Peça' | 'Serviço';
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
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  km: number;
  description: string;
  value: number;
  type: 'Óleo' | 'Filtro' | 'Correia' | 'Suspensão' | 'Freios' | 'Outros';
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