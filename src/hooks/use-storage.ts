import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin, Schedule } from '../lib/types';

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

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('mecanica_schedules');
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem('mecanica_schedules', JSON.stringify(schedules));
  }, [schedules]);

  return { budgets, setBudgets, vehicles, setVehicles, admins, setAdmins, schedules, setSchedules };
}