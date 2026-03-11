import { useState, useEffect } from 'react';
import { Budget, Vehicle, Admin } from '../lib/types';

export function useStorage() {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mecanica_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('mecanica_vehicles');
    return saved ? JSON.parse(saved) : [];
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('mecanica_admins');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'Dagoberto', email: 'dagoberto.braga@gmail.com' }];
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