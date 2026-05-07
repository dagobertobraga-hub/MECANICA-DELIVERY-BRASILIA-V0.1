import React, { createContext, useContext, useState, useEffect } from 'react';
import { Budget, Vehicle, Admin, Schedule, Professional, Review, BudgetItem, Client } from '../lib/types';

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
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const generateMockData = () => {
  const clients: Client[] = [];
  const vehicles: Vehicle[] = [];
  const budgets: Budget[] = [];
  const schedules: Schedule[] = [];
  const reviews: Review[] = [];
  
  const firstNames = ['JOÃO', 'MARIA', 'CARLOS', 'ANA', 'ROBERTO', 'FERNANDA', 'PAULO', 'JULIANA', 'MARCOS', 'BEATRIZ', 'RICARDO', 'PATRÍCIA', 'LUCAS', 'CAMILA', 'GABRIEL', 'LETÍCIA', 'BRUNO', 'AMANDA', 'RAFAEL', 'VANESSA'];
  const lastNames = ['SILVA', 'OLIVEIRA', 'SOUZA', 'COSTA', 'LIMA', 'DIAS', 'REIS', 'MELLO', 'ANTÔNIO', 'LOPES', 'SANTOS', 'FERREIRA', 'PEREIRA', 'RODRIGUES', 'ALMEIDA', 'NASCIMENTO', 'CARVALHO', 'ARAÚJO', 'MOREIRA', 'GOMES'];

  // 1. Gerar 40 Clientes
  for (let i = 0; i < 40; i++) {
    const name = `${firstNames[i % 20]} ${lastNames[Math.floor(i / 2)]} ${i > 19 ? 'JUNIOR' : ''}`.trim();
    clients.push({
      id: `c${i}`,
      name: name,
      phone: `(61) 9${Math.floor(91000000 + Math.random() * 8000000)}`,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@exemplo.com`,
      document: `${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}`,
      address: `SDE QUADRA ${Math.floor(Math.random() * 20) + 1}, CONJUNTO ${String.fromCharCode(65 + (i % 6))}, LOTE ${i + 1}`,
      city: 'BRASÍLIA',
      state: 'DF',
      zipCode: '72145-201',
      createdAt: new Date(Date.now() - (i * 86400000 * 2)).toISOString()
    });
  }

  const models = [
    'TOYOTA COROLLA', 'HONDA CIVIC', 'VW GOL', 'FIAT TORO', 'JEEP COMPASS', 
    'HYUNDAI HB20', 'CHEVROLET ONIX', 'FORD RANGER', 'RENAULT KWID', 'BMW 320I',
    'FIAT STRADA', 'VW T-CROSS', 'HYUNDAI CRETA', 'CHEVROLET TRACKER', 'TOYOTA HILUX'
  ];

  // 2. Gerar 120 Veículos (3 por cliente em média)
  for (let i = 0; i < 120; i++) {
    const client = clients[i % 40];
    const plate = `BRA${Math.floor(i/10)}${i%10}X${Math.floor(10 + Math.random() * 89)}`;
    const km = Math.floor(Math.random() * 150000) + 5000;
    
    vehicles.push({
      id: `v${i}`,
      plate: plate,
      model: models[i % models.length] + ' ' + (2015 + (i % 9)),
      clientName: client.name,
      clientPhone: client.phone,
      password: '1234',
      currentKm: km,
      oilIntervalKm: 10000,
      lastOilChangeKm: km - (Math.floor(Math.random() * 12000)),
      avgKmMonth: 600 + Math.floor(Math.random() * 1200),
      maintenances: []
    });
  }

  const statuses: any[] = ['Aberto', 'Aprovado', 'Pago', 'Concluído', 'Recusado', 'Em Negociação', 'Em Andamento'];
  const serviceList = [
    { desc: 'TROCA DE ÓLEO E FILTRO', val: 350 },
    { desc: 'REVISÃO COMPLETA 40K', val: 1200 },
    { desc: 'ALINHAMENTO E BALANCEAMENTO', val: 180 },
    { desc: 'LIMPEZA DE ARREFECIMENTO', val: 450 },
    { desc: 'TROCA DE PASTILHAS DE FREIO', val: 380 },
    { desc: 'REVISÃO DE SUSPENSÃO', val: 850 },
    { desc: 'TROCA DE CORREIA DENTADA', val: 950 },
    { desc: 'HIGIENIZAÇÃO DE AR CONDICIONADO', val: 220 }
  ];

  // 3. Gerar 100 Orçamentos
  for (let i = 0; i < 100; i++) {
    const vehicle = vehicles[i % 120];
    const status = statuses[i % statuses.length];
    const service = serviceList[i % serviceList.length];
    
    const items: BudgetItem[] = [
      { id: `i1-${i}`, description: service.desc, quantity: 1, unitValue: service.val, type: 'Serviço' },
      { id: `i2-${i}`, description: 'PEÇAS E LUBRIFICANTES', quantity: 1, unitValue: service.val * 1.5, type: 'Peça' }
    ];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i % 30));

    budgets.push({
      id: `b${i}`,
      number: (i + 1).toString().padStart(4, '0'),
      clientName: vehicle.clientName,
      clientPhone: vehicle.clientPhone,
      vehiclePlate: vehicle.plate,
      km: vehicle.currentKm - Math.floor(Math.random() * 1000),
      status: status,
      items: items,
      professionalId: i % 2 === 0 ? 'p1' : 'p2',
      commissionValue: items[0].unitValue * 0.1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString()
    });

    if (status === 'Pago' && i < 30) {
      reviews.push({
        id: `r${i}`,
        clientName: vehicle.clientName,
        vehiclePlate: vehicle.plate,
        rating: 4 + (i % 2),
        comment: i % 3 === 0 ? 'EXCELENTE SERVIÇO!' : 'MUITO BOM O ATENDIMENTO.',
        date: createdAt.toISOString(),
        budgetId: `b${i}`
      });
    }
  }

  // 4. Gerar alguns agendamentos
  for (let i = 0; i < 15; i++) {
    const vehicle = vehicles[Math.floor(Math.random() * 120)];
    const date = new Date();
    date.setDate(date.getDate() + (i % 7));

    schedules.push({
      id: `s${i}`,
      clientName: vehicle.clientName,
      vehiclePlate: vehicle.plate,
      date: date.toISOString().split('T')[0],
      time: `${9 + (i % 8)}:00`,
      status: i < 5 ? 'Pendente' : 'Confirmado',
      createdAt: new Date().toISOString()
    });
  }

  return { vehicles, budgets, schedules, reviews, clients };
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mock = generateMockData();
  const VERSION = 'v6'; // Incrementado para resetar dados e incluir e-mail

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`mecanica_vehicles_${VERSION}`);
    return saved ? JSON.parse(saved) : mock.vehicles;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`mecanica_budgets_${VERSION}`);
    return saved ? JSON.parse(saved) : mock.budgets;
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem(`mecanica_admins_${VERSION}`);
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com', permission: 'MASTER' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem(`mecanica_schedules_${VERSION}`);
    return saved ? JSON.parse(saved) : mock.schedules;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(`mecanica_professionals_${VERSION}`);
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'DAGOBERTO BRAGA', role: 'MECÂNICO MASTER', commissionRate: 10, permission: 'GRAVAÇÃO' },
      { id: 'p2', name: 'RICARDO SILVA', role: 'AUXILIAR TÉCNICO', commissionRate: 5, permission: 'LEITURA' }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`mecanica_reviews_${VERSION}`);
    return saved ? JSON.parse(saved) : mock.reviews;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`mecanica_clients_${VERSION}`);
    return saved ? JSON.parse(saved) : mock.clients;
  });

  useEffect(() => { localStorage.setItem(`mecanica_vehicles_${VERSION}`, JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem(`mecanica_budgets_${VERSION}`, JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem(`mecanica_admins_${VERSION}`, JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem(`mecanica_schedules_${VERSION}`, JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem(`mecanica_professionals_${VERSION}`, JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { localStorage.setItem(`mecanica_reviews_${VERSION}`, JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem(`mecanica_clients_${VERSION}`, JSON.stringify(clients)); }, [clients]);

  return (
    <StorageContext.Provider value={{ 
      budgets, setBudgets, 
      vehicles, setVehicles, 
      admins, setAdmins, 
      schedules, setSchedules,
      professionals, setProfessionals,
      reviews, setReviews,
      clients, setClients
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