import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin, Schedule, Professional, Review } from '../lib/types';

// Gerador de dados: 15 clientes e 40 veículos
const generateMockData = () => {
  const vehicles: Vehicle[] = [];
  const clients = [
    'JOÃO SILVA', 'MARIA OLIVEIRA', 'CARLOS SOUZA', 'ANA COSTA', 'ROBERTO LIMA',
    'FERNANDA DIAS', 'PAULO REIS', 'JULIANA MELLO', 'MARCOS ANTÔNIO', 'BEATRIZ LOPES',
    'GUSTAVO HENRIQUE', 'LUCIANA GOMES', 'RICARDO ALVES', 'SÉRGIO MORAES', 'CAMILA ROCHA'
  ];

  const models = [
    'TOYOTA COROLLA', 'HONDA CIVIC', 'VW GOL', 'FIAT TORO', 'JEEP COMPASS', 
    'HYUNDAI HB20', 'CHEVROLET ONIX', 'FORD RANGER', 'RENAULT KWID', 'BMW 320I'
  ];

  // Criar 40 veículos distribuídos entre os 15 clientes
  for (let i = 0; i < 40; i++) {
    const clientIndex = i % clients.length;
    const plate = `BRA${i}X${Math.floor(10 + Math.random() * 89)}`;
    const km = Math.floor(Math.random() * 120000) + 10000;
    
    vehicles.push({
      id: `v${i}`,
      plate: plate,
      model: models[i % models.length] + ' ' + (2016 + (i % 8)),
      clientName: clients[clientIndex],
      clientPhone: `619${Math.floor(91000000 + Math.random() * 8000000)}`,
      password: '1234',
      currentKm: km,
      oilIntervalKm: 10000,
      lastOilChangeKm: km - (Math.floor(Math.random() * 9000)),
      avgKmMonth: 800 + Math.floor(Math.random() * 1000),
      maintenances: []
    });
  }
  return vehicles;
};

export function useStorage() {
  // Forçamos o reset para a nova carga de dados (v4)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('mecanica_vehicles_v4');
    return saved ? JSON.parse(saved) : generateMockData();
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mecanica_budgets_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('mecanica_admins_v4');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('mecanica_schedules_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('mecanica_professionals_v4');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'DAGOBERTO BRAGA', role: 'MECÂNICO MASTER', commissionRate: 10 },
      { id: 'p2', name: 'RICARDO SILVA', role: 'AUXILIAR TÉCNICO', commissionRate: 5 }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('mecanica_reviews_v4');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('mecanica_vehicles_v4', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('mecanica_budgets_v4', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('mecanica_admins_v4', JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem('mecanica_schedules_v4', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('mecanica_professionals_v4', JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { localStorage.setItem('mecanica_reviews_v4', JSON.stringify(reviews)); }, [reviews]);

  return { 
    budgets, setBudgets, 
    vehicles, setVehicles, 
    admins, setAdmins, 
    schedules, setSchedules,
    professionals, setProfessionals,
    reviews, setReviews
  };
}