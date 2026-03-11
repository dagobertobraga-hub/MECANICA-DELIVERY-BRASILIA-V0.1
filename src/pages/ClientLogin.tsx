import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toUpperCase } from '@/lib/utils-format';
import { showError } from '@/utils/toast';

const ClientLogin = () => {
  const [plate, setPlate] = useState('');
  const [password, setPassword] = useState('');
  const { vehicles } = useStorage();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (plate === 'ADMIN' && password === 'ADMIN') {
      navigate('/');
      return;
    }

    const vehicle = vehicles.find(v => v.plate === toUpperCase(plate) && v.password === password);
    
    if (vehicle) {
      localStorage.setItem('logged_client_plate', vehicle.plate);
      navigate('/client-dashboard');
    } else {
      showError('Placa ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-blue-700">MECÂNICA DELIVERY</h1>
          <CardTitle className="text-slate-500">Área do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Placa do Veículo</label>
              <Input 
                placeholder="ABC1D23" 
                value={plate} 
                onChange={e => setPlate(toUpperCase(e.target.value))} 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input 
                type="password" 
                placeholder="••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
              <p className="text-xs text-slate-400">A senha padrão são os 4 últimos dígitos da placa.</p>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;