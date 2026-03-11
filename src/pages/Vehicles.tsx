import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, History, Wrench, MessageSquare, TrendingUp } from 'lucide-react';
import { Vehicle, MaintenanceRecord } from '@/lib/types';
import { formatCurrency, toUpperCase, calculateNextMaintenance } from '@/lib/utils-format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const Vehicles = () => {
  const { vehicles, setVehicles } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({
    plate: '',
    model: '',
    clientName: '',
    clientPhone: '',
    password: '',
    currentKm: 0,
    oilIntervalKm: 10000,
    lastOilChangeKm: 0,
    maintenances: []
  });

  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceRecord>>({
    description: '',
    km: 0,
    value: 0,
    type: 'Outros',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSaveVehicle = () => {
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      plate: toUpperCase(vehicleForm.plate || ''),
      model: toUpperCase(vehicleForm.model || ''),
      clientName: toUpperCase(vehicleForm.clientName || ''),
      clientPhone: vehicleForm.clientPhone || '',
      password: vehicleForm.password || vehicleForm.plate?.slice(-4),
      currentKm: vehicleForm.currentKm || 0,
      oilIntervalKm: vehicleForm.oilIntervalKm || 10000,
      lastOilChangeKm: vehicleForm.lastOilChangeKm || 0,
      maintenances: []
    };
    setVehicles([...vehicles, newVehicle]);
    setIsVehicleModalOpen(false);
    showSuccess('Veículo cadastrado com sucesso!');
  };

  const handleAddMaintenance = () => {
    if (selectedVehicle) {
      const newRecord: MaintenanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: maintenanceForm.date || new Date().toISOString(),
        km: maintenanceForm.km || 0,
        description: toUpperCase(maintenanceForm.description || ''),
        value: maintenanceForm.value || 0,
        type: maintenanceForm.type as any
      };

      const updatedVehicle = {
        ...selectedVehicle,
        currentKm: Math.max(selectedVehicle.currentKm, newRecord.km),
        lastOilChangeKm: newRecord.type === 'Óleo' ? newRecord.km : selectedVehicle.lastOilChangeKm,
        maintenances: [...selectedVehicle.maintenances, newRecord]
      };

      setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? updatedVehicle : v));
      setIsMaintenanceModalOpen(false);
      showSuccess('Manutenção registrada!');
    }
  };

  const sendMaintenanceSuggestion = (vehicle: Vehicle) => {
    const remaining = calculateNextMaintenance(vehicle.currentKm, vehicle.lastOilChangeKm, vehicle.oilIntervalKm);
    let message = `Olá ${vehicle.clientName}! Aqui é da Mecânica Delivery Brasília.\n\nNotamos que seu veículo ${vehicle.model} (Placa: ${vehicle.plate}) está com ${vehicle.currentKm} KM.`;
    
    if (remaining <= 500) {
      message += `\n\n⚠️ ALERTA: Sua troca de óleo está próxima ou vencida! Faltam apenas ${remaining} KM para o intervalo de ${vehicle.oilIntervalKm} KM.`;
    } else {
      message += `\n\nSua próxima troca de óleo está prevista para daqui a ${remaining} KM.`;
    }
    
    message += `\n\nDeseja agendar uma revisão?`;
    window.open(`https://wa.me/55${vehicle.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Veículos</h2>
          <p className="text-slate-500">Gestão de frotas e manutenção preventiva</p>
        </div>
        <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2" size={20} /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Veículo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="PLACA (MERC0SUL)" value={vehicleForm.plate} onChange={e => setVehicleForm({...vehicleForm, plate: toUpperCase(e.target.value)})} />
              <Input placeholder="MODELO DO VEÍCULO" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: toUpperCase(e.target.value)})} />
              <Input placeholder="NOME DO CLIENTE" value={vehicleForm.clientName} onChange={e => setVehicleForm({...vehicleForm, clientName: toUpperCase(e.target.value)})} />
              <Input placeholder="WHATSAPP" value={vehicleForm.clientPhone} onChange={e => setVehicleForm({...vehicleForm, clientPhone: e.target.value})} />
              <Input placeholder="SENHA DE ACESSO (OPCIONAL)" value={vehicleForm.password} onChange={e => setVehicleForm({...vehicleForm, password: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">KM Atual</label>
                  <Input type="number" value={vehicleForm.currentKm} onChange={e => setVehicleForm({...vehicleForm, currentKm: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Intervalo Óleo (KM)</label>
                  <Input type="number" value={vehicleForm.oilIntervalKm} onChange={e => setVehicleForm({...vehicleForm, oilIntervalKm: Number(e.target.value)})} />
                </div>
              </div>
              <Button onClick={handleSaveVehicle} className="w-full bg-blue-600">Salvar Veículo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input 
          className="pl-10" 
          placeholder="Buscar por placa ou cliente..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredVehicles.map((vehicle) => {
          const remaining = calculateNextMaintenance(vehicle.currentKm, vehicle.lastOilChangeKm, vehicle.oilIntervalKm);
          const isOverdue = remaining === 0;

          return (
            <Card key={vehicle.id} className="overflow-hidden">
              <div className={cn("h-2 w-full", isOverdue ? "bg-red-500" : "bg-green-500")} />
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black tracking-tighter text-slate-800">{vehicle.plate}</span>
                          <Badge variant={isOverdue ? "destructive" : "outline"}>
                            {isOverdue ? "MANUTENÇÃO VENCIDA" : "EM DIA"}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">{vehicle.model}</h3>
                        <p className="text-sm text-slate-400">{vehicle.clientName} • {vehicle.clientPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">KM Atual</p>
                        <p className="text-2xl font-bold text-blue-600">{vehicle.currentKm.toLocaleString()} km</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs font-medium text-slate-500 uppercase">Próxima Troca de Óleo</p>
                        <p className={cn("text-lg font-bold", isOverdue ? "text-red-600" : "text-slate-800")}>
                          {isOverdue ? "VENCIDO" : `EM ${remaining.toLocaleString()} KM`}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Investido</p>
                        <p className="text-lg font-bold text-slate-800">
                          {formatCurrency(vehicle.maintenances.reduce((acc, m) => acc + m.value, 0))}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-xs font-medium text-slate-500 uppercase">Registros</p>
                        <p className="text-lg font-bold text-slate-800">{vehicle.maintenances.length}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedVehicle(vehicle);
                        setIsMaintenanceModalOpen(true);
                      }}>
                        <Wrench className="mr-2" size={16} /> Nova Manutenção
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => sendMaintenanceSuggestion(vehicle)} className="text-green-600 border-green-200 hover:bg-green-50">
                        <MessageSquare className="mr-2" size={16} /> Sugerir Revisão
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => {
                        if(confirm('Excluir veículo e todo o histórico?')) {
                          setVehicles(vehicles.filter(v => v.id !== vehicle.id));
                        }
                      }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/3 space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <TrendingUp size={16} /> Evolução de KM
                    </h4>
                    <div className="h-[150px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...vehicle.maintenances].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                          <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                      {vehicle.maintenances.slice().reverse().map(m => (
                        <div key={m.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border">
                          <div>
                            <p className="font-bold">{m.description}</p>
                            <p className="text-slate-400">{new Date(m.date).toLocaleDateString()} • {m.km} KM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(m.value)}</p>
                            <button onClick={() => {
                              const updated = vehicle.maintenances.filter(x => x.id !== m.id);
                              setVehicles(vehicles.map(v => v.id === vehicle.id ? {...v, maintenances: updated} : v));
                            }} className="text-red-400 hover:text-red-600">Remover</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Manutenção - {selectedVehicle?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Data</label>
                <Input type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">KM no Serviço</label>
                <Input type="number" value={maintenanceForm.km} onChange={e => setMaintenanceForm({...maintenanceForm, km: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tipo de Serviço</label>
              <span className="text-xs text-slate-400 block mb-1">Selecione o tipo de manutenção realizada</span>
              <Select value={maintenanceForm.type} onValueChange={v => setMaintenanceForm({...maintenanceForm, type: v as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Óleo', 'Filtro', 'Correia', 'Suspensão', 'Freios', 'Outros'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="DESCRIÇÃO DETALHADA" value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: toUpperCase(e.target.value)})} />
            <Input type="number" placeholder="VALOR DO SERVIÇO (R$)" value={maintenanceForm.value} onChange={e => setMaintenanceForm({...maintenanceForm, value: Number(e.target.value)})} />
            <Button onClick={handleAddMaintenance} className="w-full bg-blue-600">Registrar Serviço</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Vehicles;