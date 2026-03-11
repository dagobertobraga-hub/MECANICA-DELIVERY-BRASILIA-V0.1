import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin } from '../lib/types';

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plate: 'ABC1D23',
    model: 'TOYOTA COROLLA 2022',
    clientName: 'JOÃO SILVA',
    clientPhone: '61999999999',
    password: '1D23',
    currentKm: 52000,
    oilIntervalKm: 10000,
    lastOilChangeKm: 45000,
    maintenances: [
      { id: 'm1', date: '2023-10-15', km: 45000, description: 'TROCA DE ÓLEO E FILTRO', value: 350, type: 'Óleo' },
      { id: 'm2', date: '2023-05-10', km: 35000, description: 'REVISÃO DE FREIOS', value: 450, type: 'Freios' }
    ]
  },
  {
    id: 'v2',
    plate: 'XYZ9A88',
    model: 'HONDA CIVIC 2020',
    clientName: 'MARIA OLIVEIRA',
    clientPhone: '61988888888',
    password: '9A88',
    currentKm: 65000,
    oilIntervalKm: 10000,
    lastOilChangeKm: 50000,
    maintenances: [
      { id: 'm3', date: '2023-08-20', km: 50000, description: 'TROCA DE ÓLEO', value: 320, type: 'Óleo' }
    ]
  }
];

const MOCK_BUDGETS: Budget[] = [
  {
    id: 'b1',
    number: '0001',
    clientName: 'JOÃO SILVA',
    clientPhone: '61999999999',
    vehiclePlate: 'ABC1D23',
    km: 52000,
    status: 'Pago',
    items: [
      { id: 'i1', description: 'ÓLEO 5W30 SINTÉTICO', quantity: 4, unitValue: 65, type: 'Peça' },
      { id: 'i2', description: 'FILTRO DE ÓLEO', quantity: 1, unitValue: 45, type: 'Peça' },
      { id: 'i3', description: 'MÃO DE OBRA TROCA DE ÓLEO', quantity: 1, unitValue: 80, type: 'Serviço' }
    ],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z'
  },
  {
    id: 'b2',
    number: '0002',
    clientName: 'MARIA OLIVEIRA',
    clientPhone: '61988888888',
    vehiclePlate: 'XYZ9A88',
    km: 65000,
    status: 'Aberto',
    items: [
      { id: 'i4', description: 'PASTILHA DE FREIO DIANTEIRA', quantity: 1, unitValue: 220, type: 'Peça' },
      { id: 'i5', description: 'DISCO DE FREIO', quantity: 2, unitValue: 180, type: 'Peça' },
      { id: 'i6', description: 'MÃO DE OBRA SISTEMA DE FREIO', quantity: 1, unitValue: 150, type: 'Serviço' }
    ],
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-15T09:00:00Z'
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