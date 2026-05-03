import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toUpperCase, formatPlate } from '@/lib/utils-format';
import { showError, showSuccess } from '@/utils/toast';
import { ShieldCheck, UserCircle, Eye, EyeOff, Info } from 'lucide-react';

const ClientLogin = () => {
  const [plate, setPlate] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  const [showClientPass, setShowClientPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  
  const { vehicles, admins } = useStorage();
  const navigate = useNavigate();

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = formatPlate(plate).trim();
    const cleanPass = password.trim();
    
    const vehicle = vehicles.find(v => v.plate === cleanPlate && v.password === cleanPass);
    
    if (vehicle) {
      localStorage.setItem('user_role', 'client');
      localStorage.setItem('logged_client_plate', vehicle.plate);
      showSuccess(`BEM-VINDO, ${vehicle.clientName}!`);
      navigate('/client-dashboard');
    } else {
      showError('PLACA OU SENHA INCORRETOS.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = adminEmail.trim();
    const pass = adminPass.trim();

    // Login mestre ou admin cadastrado
    const isAdmin = (email === 'admin' && pass === 'admin') || 
                    admins.find(a => a.email === email);

    if (isAdmin) {
      localStorage.setItem('user_role', 'admin');
      showSuccess('ACESSO ADMINISTRATIVO CONCEDIDO.');
      navigate('/');
    } else {
      showError('CREDENCIAIS ADMINISTRATIVAS INVÁLIDAS.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-black text-blue-700 tracking-tighter">MECÂNICA DELIVERY</h1>
          <p className="text-slate-500 text-sm">BRASÍLIA - DF</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="flex gap-2">
                <UserCircle size={18} /> CLIENTE
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex gap-2">
                <ShieldCheck size={18} /> ADMIN
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">PLACA DO VEÍCULO</label>
                  <Input 
                    placeholder="ABC1D23" 
                    value={plate} 
                    onChange={e => setPlate(formatPlate(e.target.value))} 
                    className="uppercase font-mono text-lg"
                    maxLength={7}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">SENHA</label>
                  <div className="relative">
                    <Input 
                      type={showClientPass ? "text" : "password"} 
                      placeholder="••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientPass(!showClientPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showClientPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info size={12} /> A SENHA SÃO OS 4 ÚLTIMOS DÍGITOS DA PLACA.
                  </p>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold">
                  CONSULTAR MEU VEÍCULO
                </Button>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-700 mb-1">DICA PARA TESTE:</p>
                  <p className="text-[10px] text-blue-600">PLACA: <span className="font-bold">BRA0X45</span> | SENHA: <span className="font-bold">0X45</span></p>
                </div>
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
                  <div className="relative">
                    <Input 
                      type={showAdminPass ? "text" : "password"} 
                      placeholder="••••" 
                      value={adminPass} 
                      onChange={e => setAdminPass(e.target.value)} 
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 h-12 text-lg font-bold">
                  ACESSAR PAINEL
                </Button>
                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-700 mb-1">DICA PARA TESTE:</p>
                  <p className="text-[10px] text-slate-600">USUÁRIO: <span className="font-bold">admin</span> | SENHA: <span className="font-bold">admin</span></p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;