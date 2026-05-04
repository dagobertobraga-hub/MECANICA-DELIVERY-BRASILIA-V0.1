import React, { createContext, useContext, useState, useEffect } from 'react';
import { Budget, Vehicle, Admin, Schedule, Professional, Review, BudgetItem } from '../lib/types';

interface StorageContextType {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  professionals: Professional[];
  setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const generateMockData = () => {
  const vehicles: Vehicle[] = [];
  const budgets: Budget[] = [];
  const schedules: Schedule[] = [];
  const reviews: Review[] = [];
  
  const clients = [
    'JOÃO SILVA', 'MARIA OLIVEIRA', 'CARLOS SOUZA', 'ANA COSTA', 'ROBERTO LIMA',
    'FERNANDA DIAS', 'PAULO REIS', 'JULIANA MELLO', 'MARCOS ANTÔNIO', 'BEATRIZ LOPES',
    'GUSTAVO HENRIQUE', 'LUCIANA GOMES', 'RICARDO ALVES', 'SÉRGIO MORAES', 'CAMILA ROCHA'
  ];

  const models = [
    'TOYOTA COROLLA', 'HONDA CIVIC', 'VW GOL', 'FIAT TORO', 'JEEP COMPASS', 
    'HYUNDAI HB20', 'CHEVROLET ONIX', 'FORD RANGER', 'RENAULT KWID', 'BMW 320I'
  ];

  const statuses: any[] = ['Aberto', 'Aprovado', 'Pago', 'Concluído', 'Recusado', 'Em Negociação'];
  const services = ['TROCA DE ÓLEO E FILTRO', 'REVISÃO 40K', 'ALINHAMENTO E BALANCEAMENTO', 'LIMPEZA DE ARREFECIMENTO', 'TROCA DE PASTILHAS', 'REVISÃO DE SUSPENSÃO'];

  // Gerar 40 Veículos
  for (let i = 0; i < 40; i++) {
    const clientIndex = i % clients.length;
    const plate = `BRA${i}X${Math.floor(10 + Math.random() * 89)}`;
    const km = Math.floor(Math.random() * 120000) + 10000;
    
    vehicles.push({
      id: `v${i}`,
      plate: plate,
      model: models[i % models.length] + ' ' + (2016 + (i % 8)),
      clientName: clients[clientIndex],
      clientPhone: `(61) 9${Math.floor(91000000 + Math.random() * 8000000)}`,
      password: '1234',
      currentKm: km,
      oilIntervalKm: 10000,
      lastOilChangeKm: km - (Math.floor(Math.random() * 9000)),
      avgKmMonth: 800 + Math.floor(Math.random() * 1000),
      maintenances: []
    });
  }

  // Gerar 50 Orçamentos
  for (let i = 0; i < 50; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const status = statuses[i % statuses.length];
    const items: BudgetItem[] = [
      { id: `i1-${i}`, description: services[i % services.length], quantity: 1, unitValue: 150 + (Math.random() * 300), type: 'Serviço' },
      { id: `i2-${i}`, description: 'PEÇAS DIVERSAS', quantity: 1, unitValue: 200 + (Math.random() * 800), type: 'Peça' }
    ];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i * 2));

    budgets.push({
      id: `b${i}`,
      number: (i + 1).toString().padStart(4, '0'),
      clientName: vehicle.clientName,
      clientPhone: vehicle.clientPhone,
      vehiclePlate: vehicle.plate,
      km: vehicle.currentKm - 500,
      status: status,
      items: items,
      professionalId: i % 2 === 0 ? 'p1' : 'p2',
      commissionValue: items[0].unitValue * 0.1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString()
    });

    // Gerar Avaliações para orçamentos pagos
    if (status === 'Pago' && i < 15) {
      reviews.push({
        id: `r${i}`,
        clientName: vehicle.clientName,
        vehiclePlate: vehicle.plate,
        rating: 4 + Math.floor(Math.random() * 2),
        comment: 'EXCELENTE ATENDIMENTO E SERVIÇO DE QUALIDADE!',
        date: createdAt.toISOString(),
        budgetId: `b${i}`
      });
    }
  }

  // Gerar 20 Agendamentos
  for (let i = 0; i < 20; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const date = new Date();
    date.setDate(date.getDate() + (i % 10));

    schedules.push({
      id: `s${i}`,
      clientName: vehicle.clientName,
      vehiclePlate: vehicle.plate,
      date: date.toISOString().split('T')[0],
      time: `${8 + (i % 10)}:00`,
      status: i < 5 ? 'Pendente' : 'Confirmado',
      createdAt: new Date().toISOString()
    });
  }

  return { vehicles, budgets, schedules, reviews };
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mock = generateMockData();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('mecanica_vehicles_v4');
    return saved ? JSON.parse(saved) : mock.vehicles;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mecanica_budgets_v4');
    return saved ? JSON.parse(saved) : mock.budgets;
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('mecanica_admins_v4');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('mecanica_schedules_v4');
    return saved ? JSON.parse(saved) : mock.schedules;
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
    return saved ? JSON.parse(saved) : mock.reviews;
  });

  useEffect(() => { localStorage.setItem('mecanica_vehicles_v4', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('mecanica_budgets_v4', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('mecanica_admins_v4', JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem('mecanica_schedules_v4', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('mecanica_professionals_v4', JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { localStorage.setItem('mecanica_reviews_v4', JSON.stringify(reviews)); }, [reviews]);

  return (
    <StorageContext.Provider value={{ 
      budgets, setBudgets, 
      vehicles, setVehicles, 
      admins, setAdmins, 
      schedules, setSchedules,
      professionals, setProfessionals,
      reviews, setReviews
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorageContext = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorageContext must be used within a StorageProvider');
  }
  return context;
};