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

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Versão v7: Banco de dados limpo para produção
  const VERSION = 'v7'; 

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`mecanica_vehicles_${VERSION}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`mecanica_budgets_${VERSION}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem(`mecanica_admins_${VERSION}`);
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'DAGOBERTO', email: 'dagoberto.braga@gmail.com', permission: 'MASTER' }];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem(`mecanica_schedules_${VERSION}`);
    return saved ? JSON.parse(saved) : [];
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
    return saved ? JSON.parse(saved) : [];
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