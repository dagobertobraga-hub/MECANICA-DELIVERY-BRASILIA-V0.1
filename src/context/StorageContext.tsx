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

const getInitialData = () => {
  const clients: Client[] = [
    {
      id: 'c1',
      name: 'DAGOBERTO BRAGA',
      phone: '(61) 99138-6470',
      email: 'dagoberto.braga@gmail.com',
      document: '123.456.789-00',
      address: 'SDE QUADRA 02 CONJUNTO A LOTE 06',
      city: 'BRASÍLIA',
      state: 'DF',
      zipCode: '72145-201',
      createdAt: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'MARIA SILVA',
      phone: '(61) 98888-7777',
      email: 'maria.silva@email.com',
      document: '987.654.321-11',
      address: 'SQN 205 BLOCO J',
      city: 'BRASÍLIA',
      state: 'DF',
      zipCode: '70735-100',
      createdAt: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'CARLOS OLIVEIRA',
      phone: '(61) 97777-6666',
      email: 'carlos.oliveira@email.com',
      document: '111.222.333-44',
      address: 'ÁGUAS CLARAS RUA 25 SUL',
      city: 'BRASÍLIA',
      state: 'DF',
      zipCode: '71927-180',
      createdAt: new Date().toISOString()
    }
  ];

  const vehicles: Vehicle[] = [
    {
      id: 'v1',
      plate: 'BRA1X23',
      model: 'TOYOTA COROLLA 2022',
      clientName: 'DAGOBERTO BRAGA',
      clientPhone: '(61) 99138-6470',
      password: '1234',
      currentKm: 45000,
      oilIntervalKm: 10000,
      lastOilChangeKm: 40000,
      avgKmMonth: 1200,
      maintenances: []
    },
    {
      id: 'v2',
      plate: 'BRA2X45',
      model: 'HONDA CIVIC 2020',
      clientName: 'MARIA SILVA',
      clientPhone: '(61) 98888-7777',
      password: '1234',
      currentKm: 62000,
      oilIntervalKm: 10000,
      lastOilChangeKm: 61500,
      avgKmMonth: 800,
      maintenances: []
    },
    {
      id: 'v3',
      plate: 'BRA3X67',
      model: 'VW GOL 2018',
      clientName: 'CARLOS OLIVEIRA',
      clientPhone: '(61) 97777-6666',
      password: '1234',
      currentKm: 88000,
      oilIntervalKm: 10000,
      lastOilChangeKm: 75000, // Vencido
      avgKmMonth: 1500,
      maintenances: []
    },
    {
      id: 'v4',
      plate: 'BRA4X89',
      model: 'FIAT TORO 2021',
      clientName: 'DAGOBERTO BRAGA',
      clientPhone: '(61) 99138-6470',
      password: '1234',
      currentKm: 35000,
      oilIntervalKm: 10000,
      lastOilChangeKm: 30000,
      avgKmMonth: 2000,
      maintenances: []
    },
    {
      id: 'v5',
      plate: 'BRA5X01',
      model: 'JEEP COMPASS 2023',
      clientName: 'MARIA SILVA',
      clientPhone: '(61) 98888-7777',
      password: '1234',
      currentKm: 12000,
      oilIntervalKm: 10000,
      lastOilChangeKm: 10000,
      avgKmMonth: 1000,
      maintenances: []
    }
  ];

  const budgets: Budget[] = [
    {
      id: 'b1',
      number: '0001',
      clientName: 'DAGOBERTO BRAGA',
      clientPhone: '(61) 99138-6470',
      vehiclePlate: 'BRA1X23',
      km: 45000,
      status: 'Pago',
      items: [
        { id: 'i1', description: 'TROCA DE ÓLEO E FILTRO', quantity: 1, unitValue: 350, type: 'Serviço' },
        { id: 'i2', description: 'ÓLEO 5W30 SINTÉTICO', quantity: 4, unitValue: 65, type: 'Peça' }
      ],
      professionalId: 'p1',
      commissionValue: 35,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const schedules: Schedule[] = [
    {
      id: 's1',
      clientName: 'CARLOS OLIVEIRA',
      vehiclePlate: 'BRA3X67',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '09:00',
      status: 'Pendente',
      createdAt: new Date().toISOString()
    }
  ];

  return { clients, vehicles, budgets, schedules };
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const VERSION = 'v8'; // Nova versão para carregar os dados iniciais reais
  const initial = getInitialData();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`mecanica_vehicles_${VERSION}`);
    return saved ? JSON.parse(saved) : initial.vehicles;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`mecanica_budgets_${VERSION}`);
    return saved ? JSON.parse(saved) : initial.budgets;
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem(`mecanica_admins_${VERSION}`);
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com', permission: 'MASTER' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem(`mecanica_schedules_${VERSION}`);
    return saved ? JSON.parse(saved) : initial.schedules;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(`mecanica_professionals_${VERSION}`);
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'DAGOBERTO BRAGA', role: 'MECÂNICO MASTER', commissionRate: 10, permission: 'GRAVAÇÃO' }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`mecanica_reviews_${VERSION}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`mecanica_clients_${VERSION}`);
    return saved ? JSON.parse(saved) : initial.clients;
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