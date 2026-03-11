import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toUpperCase } from '@/lib/utils-format';
import { showError, showSuccess } from '@/utils/toast';
import { ShieldCheck, UserCircle } from 'lucide-react';

const ClientLogin = () => {
  const [plate, setPlate] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  const { vehicles, admins } = useStorage();
  const navigate = useNavigate();

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find(v => v.plate === toUpperCase(plate) && v.password === password);
    
    if (vehicle) {
      localStorage.setItem('user_role', 'client');
      localStorage.setItem('logged_client_plate', vehicle.plate);
      showSuccess(`Bem-vindo, ${vehicle.clientName}!`);
      navigate('/client-dashboard');
    } else {
      showError('Placa ou senha incorretos.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login mestre ou admin cadastrado
    const isAdmin = (adminEmail === 'admin' && adminPass === 'admin') || 
                    admins.find(a => a.email === adminEmail);

    if (isAdmin) {
      localStorage.setItem('user_role', 'admin');
      showSuccess('Acesso administrativo concedido.');
      navigate('/');
    } else {
      showError('Credenciais administrativas inválidas.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-black text-blue-700 tracking-tighter">MECÂNICA DELIVERY</h1>
          <p className="text-slate-500 text-sm">Brasília - DF</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="flex gap-2">
                <UserCircle size={18} /> Cliente
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex gap-2">
                <ShieldCheck size={18} /> Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">PLACA DO VEÍCULO</label>
                  <Input 
                    placeholder="ABC1D23" 
                    value={plate} 
                    onChange={e => setPlate(toUpperCase(e.target.value))} 
                    className="uppercase font-mono text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">SENHA (4 ÚLTIMOS DÍGITOS DA PLACA)</label>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold">
                  CONSULTAR MEU VEÍCULO
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">USUÁRIO / EMAIL</label>
                  <Input 
                    placeholder="admin" 
                    value={adminEmail} 
                    onChange={e => setAdminEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">SENHA</label>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 h-12 text-lg font-bold">
                  ACESSAR PAINEL
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;