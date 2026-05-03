import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin, Schedule, Professional, Review } from '../lib/types';

// Gerador de dados para atingir a meta de 40 clientes e 106 veículos
const generateMockData = () => {
  const vehicles: Vehicle[] = [];
  const clients = [
    'JOÃO SILVA', 'MARIA OLIVEIRA', 'CARLOS SOUZA', 'ANA COSTA', 'ROBERTO LIMA',
    'FERNANDA DIAS', 'PAULO REIS', 'JULIANA MELLO', 'MARCOS ANTÔNIO', 'BEATRIZ LOPES',
    'GUSTAVO HENRIQUE', 'LUCIANA GOMES', 'RICARDO ALVES', 'SÉRGIO MORAES', 'CAMILA ROCHA',
    'BRUNO VIANA', 'DANIELA LUZ', 'FÁBIO TEIXEIRA', 'ANDRÉ MARTINS', 'PATRÍCIA SOUZA',
    'RENATO GARCIA', 'ALINE FARIAS', 'THIAGO NUNES', 'VANESSA LOPES', 'LEANDRO SILVA',
    'MÔNICA REZENDE', 'EDUARDO PAIVA', 'SABRINA COELHO', 'RAFAEL MENDES', 'LETÍCIA DUARTE',
    'IGOR BATISTA', 'PRISCILA RAMOS', 'FELIPE CASTRO', 'TATIANE XAVIER', 'RODRIGO PINTO',
    'NATÁLIA BARROS', 'SAMUEL VIEIRA', 'LARISSA FREITAS', 'DIEGO MACHADO', 'MÁRCIA SANTOS'
  ];

  const models = ['TOYOTA COROLLA', 'HONDA CIVIC', 'VW GOL', 'FIAT TORO', 'JEEP COMPASS', 'HYUNDAI HB20', 'CHEVROLET ONIX', 'FORD RANGER', 'RENAULT KWID', 'BMW 320I'];

  // Criar 106 veículos distribuídos entre os 40 clientes
  for (let i = 0; i < 106; i++) {
    const clientIndex = i % clients.length;
    const plate = `BRA${i}X${Math.floor(10 + Math.random() * 89)}`; // Garantindo 2 dígitos no final para manter padrão
    const km = Math.floor(Math.random() * 150000) + 5000;
    
    vehicles.push({
      id: `v${i}`,
      plate: plate,
      model: models[i % models.length] + ' ' + (2015 + (i % 9)),
      clientName: clients[clientIndex],
      clientPhone: `619${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: plate.slice(-4),
      currentKm: km,
      oilIntervalKm: 10000,
      lastOilChangeKm: km - (Math.floor(Math.random() * 12000)),
      avgKmMonth: 800 + Math.floor(Math.random() * 1200),
      maintenances: []
    });
  }
  return vehicles;
};

export function useStorage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('mecanica_vehicles');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : generateMockData();
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mecanica_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('mecanica_admins');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('mecanica_schedules');
    return saved ? JSON.parse(saved) : [];
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('mecanica_professionals');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'DAGOBERTO BRAGA', role: 'MECÂNICO MASTER', commissionRate: 10 },
      { id: 'p2', name: 'RICARDO SILVA', role: 'AUXILIAR TÉCNICO', commissionRate: 5 }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('mecanica_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('mecanica_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('mecanica_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('mecanica_admins', JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem('mecanica_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('mecanica_professionals', JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { localStorage.setItem('mecanica_reviews', JSON.stringify(reviews)); }, [reviews]);

  return { 
    budgets, setBudgets, 
    vehicles, setVehicles, 
    admins, setAdmins, 
    schedules, setSchedules,
    professionals, setProfessionals,
    reviews, setReviews
  };
}