import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin } from '../lib/types';

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'ABC1D23', model: 'TOYOTA COROLLA 2022', clientName: 'JOÃO SILVA', clientPhone: '61999999999', password: '1D23', currentKm: 52000, oilIntervalKm: 10000, lastOilChangeKm: 45000, maintenances: [] },
  { id: 'v2', plate: 'XYZ9A88', model: 'HONDA CIVIC 2020', clientName: 'MARIA OLIVEIRA', clientPhone: '61988888888', password: '9A88', currentKm: 65000, oilIntervalKm: 10000, lastOilChangeKm: 50000, maintenances: [] },
  { id: 'v3', plate: 'KJH4F22', model: 'VW GOL G7', clientName: 'CARLOS SOUZA', clientPhone: '61977777777', password: '4F22', currentKm: 88000, oilIntervalKm: 10000, lastOilChangeKm: 85000, maintenances: [] },
  { id: 'v4', plate: 'BRA2E19', model: 'FIAT TORO 2021', clientName: 'ANA COSTA', clientPhone: '61966666666', password: '2E19', currentKm: 42000, oilIntervalKm: 10000, lastOilChangeKm: 30000, maintenances: [] },
  { id: 'v5', plate: 'MER3C21', model: 'MERCEDES C180', clientName: 'ROBERTO LIMA', clientPhone: '61955555555', password: '3C21', currentKm: 35000, oilIntervalKm: 8000, lastOilChangeKm: 34500, maintenances: [] },
  { id: 'v6', plate: 'JEEP4X4', model: 'JEEP COMPASS 2023', clientName: 'FERNANDA DIAS', clientPhone: '61944444444', password: '4X4', currentKm: 15000, oilIntervalKm: 10000, lastOilChangeKm: 10000, maintenances: [] },
  { id: 'v7', plate: 'HYU5N11', model: 'HYUNDAI HB20', clientName: 'PAULO REIS', clientPhone: '61933333333', password: '5N11', currentKm: 95000, oilIntervalKm: 10000, lastOilChangeKm: 80000, maintenances: [] },
  { id: 'v8', plate: 'CHV6R22', model: 'CHEVROLET ONIX', clientName: 'JULIANA MELLO', clientPhone: '61922222222', password: '6R22', currentKm: 28000, oilIntervalKm: 10000, lastOilChangeKm: 20000, maintenances: [] },
  { id: 'v9', plate: 'FOR7D33', model: 'FORD RANGER 2019', clientName: 'MARCOS ANTÔNIO', clientPhone: '61911111111', password: '7D33', currentKm: 120000, oilIntervalKm: 10000, lastOilChangeKm: 115000, maintenances: [] },
  { id: 'v10', plate: 'REN8O44', model: 'RENAULT KWID', clientName: 'BEATRIZ LOPES', clientPhone: '61900000000', password: '8O44', currentKm: 45000, oilIntervalKm: 10000, lastOilChangeKm: 44000, maintenances: [] },
  { id: 'v11', plate: 'BMW9I55', model: 'BMW 320I', clientName: 'GUSTAVO HENRIQUE', clientPhone: '61987654321', password: '9I55', currentKm: 12000, oilIntervalKm: 8000, lastOilChangeKm: 5000, maintenances: [] },
  { id: 'v12', plate: 'AUD1A33', model: 'AUDI A3 SEDAN', clientName: 'LUCIANA GOMES', clientPhone: '61912345678', password: '1A33', currentKm: 58000, oilIntervalKm: 10000, lastOilChangeKm: 45000, maintenances: [] },
  { id: 'v13', plate: 'NIS2B44', model: 'NISSAN KICKS 2021', clientName: 'RICARDO ALVES', clientPhone: '61922334455', password: '2B44', currentKm: 32000, oilIntervalKm: 10000, lastOilChangeKm: 30000, maintenances: [] },
  { id: 'v14', plate: 'MIT3C55', model: 'MITSUBISHI L200', clientName: 'SÉRGIO MORAES', clientPhone: '61933445566', password: '3C55', currentKm: 150000, oilIntervalKm: 10000, lastOilChangeKm: 145000, maintenances: [] },
  { id: 'v15', plate: 'PEU4D66', model: 'PEUGEOT 208', clientName: 'CAMILA ROCHA', clientPhone: '61944556677', password: '4D66', currentKm: 25000, oilIntervalKm: 10000, lastOilChangeKm: 20000, maintenances: [] },
  { id: 'v16', plate: 'CIT5E77', model: 'CITROEN C3', clientName: 'BRUNO VIANA', clientPhone: '61955667788', password: '5E77', currentKm: 48000, oilIntervalKm: 10000, lastOilChangeKm: 40000, maintenances: [] },
  { id: 'v17', plate: 'KIA6F88', model: 'KIA SPORTAGE', clientName: 'DANIELA LUZ', clientPhone: '61966778899', password: '6F88', currentKm: 72000, oilIntervalKm: 10000, lastOilChangeKm: 70000, maintenances: [] },
  { id: 'v18', plate: 'HYU7G99', model: 'HYUNDAI CRETA', clientName: 'FÁBIO TEIXEIRA', clientPhone: '61977889900', password: '7G99', currentKm: 38000, oilIntervalKm: 10000, lastOilChangeKm: 30000, maintenances: [] },
  { id: 'v19', plate: 'TOY8H00', model: 'TOYOTA HILUX', clientName: 'ANDRÉ MARTINS', clientPhone: '61988990011', password: '8H00', currentKm: 210000, oilIntervalKm: 10000, lastOilChangeKm: 205000, maintenances: [] },
  { id: 'v20', plate: 'HON9I11', model: 'HONDA HR-V', clientName: 'PATRÍCIA SOUZA', clientPhone: '61999001122', password: '9I11', currentKm: 55000, oilIntervalKm: 10000, lastOilChangeKm: 50000, maintenances: [] }
];

const MOCK_BUDGETS: Budget[] = [
  {
    id: 'b1', number: '0001', clientName: 'JOÃO SILVA', clientPhone: '61999999999', vehiclePlate: 'ABC1D23', km: 52000, status: 'Pago',
    items: [{ id: 'i1', description: 'ÓLEO 5W30 SINTÉTICO', quantity: 4, unitValue: 65, type: 'Peça' }, { id: 'i3', description: 'MÃO DE OBRA', quantity: 1, unitValue: 80, type: 'Serviço' }],
    createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-10T14:00:00Z'
  },
  {
    id: 'b2', number: '0002', clientName: 'MARIA OLIVEIRA', clientPhone: '61988888888', vehiclePlate: 'XYZ9A88', km: 65000, status: 'Aberto',
    items: [{ id: 'i4', description: 'PASTILHA DE FREIO', quantity: 1, unitValue: 220, type: 'Peça' }, { id: 'i6', description: 'MÃO DE OBRA', quantity: 1, unitValue: 150, type: 'Serviço' }],
    createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z'
  },
  {
    id: 'b3', number: '0003', clientName: 'CARLOS SOUZA', clientPhone: '61977777777', vehiclePlate: 'KJH4F22', km: 88000, status: 'Aprovado',
    items: [{ id: 'i7', description: 'FILTRO DE AR', quantity: 1, unitValue: 45, type: 'Peça' }, { id: 'i8', description: 'LIMPEZA DE BICO', quantity: 1, unitValue: 200, type: 'Serviço' }],
    createdAt: '2024-02-20T11:00:00Z', updatedAt: '2024-02-21T10:00:00Z'
  },
  {
    id: 'b4', number: '0004', clientName: 'ANA COSTA', clientPhone: '61966666666', vehiclePlate: 'BRA2E19', km: 42000, status: 'Em Negociação',
    items: [{ id: 'i9', description: 'AMORTECEDOR DIANTEIRO', quantity: 2, unitValue: 450, type: 'Peça' }, { id: 'i10', description: 'MÃO DE OBRA SUSPENSÃO', quantity: 1, unitValue: 300, type: 'Serviço' }],
    createdAt: '2024-02-22T14:00:00Z', updatedAt: '2024-02-22T14:00:00Z'
  },
  {
    id: 'b5', number: '0005', clientName: 'ROBERTO LIMA', clientPhone: '61955555555', vehiclePlate: 'MER3C21', km: 35000, status: 'Pago',
    items: [{ id: 'i11', description: 'ÓLEO MOTUL', quantity: 6, unitValue: 95, type: 'Peça' }, { id: 'i12', description: 'FILTRO MANN', quantity: 1, unitValue: 120, type: 'Peça' }],
    createdAt: '2024-02-10T08:00:00Z', updatedAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'b6', number: '0006', clientName: 'FERNANDA DIAS', clientPhone: '61944444444', vehiclePlate: 'JEEP4X4', km: 15000, status: 'Concluído',
    items: [{ id: 'i13', description: 'ALINHAMENTO E BALANCEAMENTO', quantity: 1, unitValue: 180, type: 'Serviço' }],
    createdAt: '2024-02-24T09:00:00Z', updatedAt: '2024-02-25T16:00:00Z'
  },
  {
    id: 'b7', number: '0007', clientName: 'PAULO REIS', clientPhone: '61933333333', vehiclePlate: 'HYU5N11', km: 95000, status: 'Recusado',
    items: [{ id: 'i14', description: 'KIT EMBREAGEM', quantity: 1, unitValue: 850, type: 'Peça' }, { id: 'i15', description: 'MÃO DE OBRA EMBREAGEM', quantity: 1, unitValue: 500, type: 'Serviço' }],
    createdAt: '2024-02-18T10:00:00Z', updatedAt: '2024-02-18T10:00:00Z'
  },
  {
    id: 'b8', number: '0008', clientName: 'JULIANA MELLO', clientPhone: '61922222222', vehiclePlate: 'CHV6R22', km: 28000, status: 'Rascunho',
    items: [{ id: 'i16', description: 'VELAS DE IGNIÇÃO', quantity: 4, unitValue: 45, type: 'Peça' }],
    createdAt: '2024-02-26T15:00:00Z', updatedAt: '2024-02-26T15:00:00Z'
  },
  {
    id: 'b9', number: '0009', clientName: 'MARCOS ANTÔNIO', clientPhone: '61911111111', vehiclePlate: 'FOR7D33', km: 120000, status: 'Em Andamento',
    items: [{ id: 'i17', description: 'BOMBA D ÁGUA', quantity: 1, unitValue: 380, type: 'Peça' }, { id: 'i18', description: 'ADITIVO RADIADOR', quantity: 3, unitValue: 35, type: 'Peça' }],
    createdAt: '2024-02-25T11:00:00Z', updatedAt: '2024-02-25T11:00:00Z'
  },
  {
    id: 'b10', number: '0010', clientName: 'BEATRIZ LOPES', clientPhone: '61900000000', vehiclePlate: 'REN8O44', km: 45000, status: 'Pago',
    items: [{ id: 'i19', description: 'PNEU 165/70 R14', quantity: 2, unitValue: 320, type: 'Peça' }],
    createdAt: '2024-02-25T13:00:00Z', updatedAt: '2024-02-25T15:00:00Z'
  },
  {
    id: 'b11', number: '0011', clientName: 'GUSTAVO HENRIQUE', clientPhone: '61987654321', vehiclePlate: 'BMW9I55', km: 12000, status: 'Aberto',
    items: [{ id: 'i20', description: 'REVISÃO SISTEMA ELÉTRICO', quantity: 1, unitValue: 450, type: 'Serviço' }],
    createdAt: '2024-02-26T08:00:00Z', updatedAt: '2024-02-26T08:00:00Z'
  },
  {
    id: 'b12', number: '0012', clientName: 'LUCIANA GOMES', clientPhone: '61912345678', vehiclePlate: 'AUD1A33', km: 58000, status: 'Aprovado',
    items: [{ id: 'i21', description: 'TURBINA REVISÃO', quantity: 1, unitValue: 1800, type: 'Serviço' }],
    createdAt: '2024-02-26T10:00:00Z', updatedAt: '2024-02-26T10:00:00Z'
  }
];

export function useStorage() {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mecanica_budgets');
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('mecanica_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('mecanica_admins');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com' }];
  });

  useEffect(() => {
    localStorage.setItem('mecanica_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('mecanica_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('mecanica_admins', JSON.stringify(admins));
  }, [admins]);

  return { budgets, setBudgets, vehicles, setVehicles, admins, setAdmins };
}