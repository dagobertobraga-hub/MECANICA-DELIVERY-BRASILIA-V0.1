import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Wrench, MessageSquare, Check, ChevronsUpDown } from 'lucide-react';
import { Vehicle, MaintenanceRecord } from '@/lib/types';
import { formatCurrency, toUpperCase, formatPlate, maskPhone, maskCurrency, parseCurrencyToNumber } from '@/lib/utils-format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { showSuccess } from '@/utils/toast';
import { getNextRevision, calculateUsagePrediction } from '@/lib/maintenance-logic';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Vehicles = () => {
  const { vehicles, setVehicles } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [openSearchClient, setOpenSearchClient] = useState(false);
  const OFFICE_PHONE = "5561991386470";

  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({
    plate: '', model: '', clientName: '', clientPhone: '', currentKm: 0, oilIntervalKm: 10000, avgKmMonth: 1000
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '', km: 0, value: "R$ 0,00", type: 'Outros', date: new Date().toISOString().split('T')[0]
  });

  const uniqueClients = Array.from(new Set(vehicles.map(v => v.clientName))).sort();

  const handleSaveVehicle = () => {
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      plate: formatPlate(vehicleForm.plate || ''),
      model: toUpperCase(vehicleForm.model || ''),
      clientName: toUpperCase(vehicleForm.clientName || ''),
      clientPhone: vehicleForm.clientPhone || '',
      password: '1234',
      currentKm: vehicleForm.currentKm || 0,
      oilIntervalKm: vehicleForm.oilIntervalKm || 10000,
      lastOilChangeKm: 0,
      avgKmMonth: vehicleForm.avgKmMonth || 1000,
      maintenances: []
    };
    setVehicles([...vehicles, newVehicle]);
    setIsVehicleModalOpen(false);
    setVehicleForm({ plate: '', model: '', clientName: '', clientPhone: '', currentKm: 0, oilIntervalKm: 10000, avgKmMonth: 1000 });
    showSuccess('Veículo cadastrado!');
  };

  const handleAddMaintenance = () => {
    if (selectedVehicle) {
      const valueNum = parseCurrencyToNumber(maintenanceForm.value);
      const newRecord: MaintenanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: maintenanceForm.date || new Date().toISOString(),
        km: maintenanceForm.km || 0,
        description: toUpperCase(maintenanceForm.description || ''),
        value: valueNum,
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
      setMaintenanceForm({ description: '', km: 0, value: "R$ 0,00", type: 'Outros', date: new Date().toISOString().split('T')[0] });
      showSuccess('Manutenção registrada!');
    }
  };

  const handleSelectExistingClient = (name: string) => {
    const existing = vehicles.find(v => v.clientName === name);
    if (existing) {
      setVehicleForm({
        ...vehicleForm,
        clientName: existing.clientName,
        clientPhone: maskPhone(existing.clientPhone)
      });
      setOpenSearchClient(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout isAdmin={true}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Veículos</h2>
          <p className="text-slate-500">Gestão de frotas e manutenção preventiva</p>
        </div>
        <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
          <DialogTrigger asChild><Button className="bg-blue-600"><Plus className="mr-2" /> Novo Veículo</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Cadastrar Veículo</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Cliente Existente</label>
                <Popover open={openSearchClient} onOpenChange={setOpenSearchClient}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSearchClient}
                      className="w-full justify-between bg-slate-50 border-blue-100"
                    >
                      {vehicleForm.clientName || "BUSCAR CLIENTE CADASTRADO..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Digite o nome do cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {uniqueClients.map((client) => (
                            <CommandItem
                              key={client}
                              value={client}
                              onSelect={() => handleSelectExistingClient(client)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vehicleForm.clientName === client ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Ou preencha manualmente</span></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Input placeholder="NOME DO CLIENTE" value={vehicleForm.clientName} onChange={e => setVehicleForm({...vehicleForm, clientName: toUpperCase(e.target.value)})} />
                <Input placeholder="WHATSAPP" value={vehicleForm.clientPhone} onChange={e => setVehicleForm({...vehicleForm, clientPhone: maskPhone(e.target.value)})} />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="PLACA" 
                    value={vehicleForm.plate} 
                    onChange={e => setVehicleForm({...vehicleForm, plate: formatPlate(e.target.value)})} 
                    className="font-mono" 
                    maxLength={7}
                  />
                  <Input placeholder="MODELO" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: toUpperCase(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">KM Atual</label>
                    <Input type="number" value={vehicleForm.currentKm} onChange={e => setVehicleForm({...vehicleForm, currentKm: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Média KM/Mês</label>
                    <Input type="number" value={vehicleForm.avgKmMonth} onChange={e => setVehicleForm({...vehicleForm, avgKmMonth: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveVehicle} className="w-full bg-blue-600 h-12 font-bold">Salvar Veículo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input className="pl-10" placeholder="Buscar por placa ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredVehicles.map((vehicle) => {
          const nextRev = getNextRevision(vehicle.currentKm);
          const prediction = calculateUsagePrediction(vehicle.currentKm, vehicle.avgKmMonth);
          const isOverdue = (vehicle.currentKm - vehicle.lastOilChangeKm) >= vehicle.oilIntervalKm;

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
                          <Badge variant={isOverdue ? "destructive" : "outline"}>{isOverdue ? "VENCIDO" : "EM DIA"}</Badge>
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
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Próxima Revisão Sugerida</p>
                        <p className="text-sm font-bold text-slate-800">{nextRev.name}</p>
                        <p className="text-[10px] text-slate-500">Faltam {prediction.remainingKm.toLocaleString()} KM</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Previsão de Data</p>
                        <p className="text-sm font-bold text-slate-800">{prediction.estimatedDate.toLocaleDateString('pt-BR')}</p>
                        <p className="text-[10px] text-slate-500">Baseado em {vehicle.avgKmMonth} KM/mês</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Total Investido</p>
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(vehicle.maintenances.reduce((acc, m) => acc + m.value, 0))}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setIsMaintenanceModalOpen(true); }}>
                            <Wrench className="mr-2" size={16} /> Registrar Manutenção
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Adicionar histórico de serviço</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-200" onClick={() => {
                            const msg = `Olá! Gostaria de tratar sobre a revisão do veículo ${vehicle.model} (${vehicle.plate}) do cliente ${vehicle.clientName}. KM Atual: ${vehicle.currentKm}.`;
                            window.open(`https://wa.me/${OFFICE_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}>
                            <MessageSquare className="mr-2" size={16} /> Enviar para WhatsApp (Oficina)
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Enviar dados do veículo para a oficina</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Excluir veículo?')) setVehicles(vehicles.filter(v => v.id !== vehicle.id)); }}>
                            <Trash2 size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir veículo</TooltipContent>
                      </Tooltip>
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
          <DialogHeader><DialogTitle>Registrar Manutenção - {selectedVehicle?.plate}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} />
              <Input type="number" placeholder="KM" value={maintenanceForm.km} onChange={e => setMaintenanceForm({...maintenanceForm, km: Number(e.target.value)})} />
            </div>
            <Select value={maintenanceForm.type} onValueChange={v => setMaintenanceForm({...maintenanceForm, type: v as any})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Óleo', 'Filtro', 'Correia', 'Suspensão', 'Freios', 'Injeção', 'Elétrica', 'Outros'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="DESCRIÇÃO" value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: toUpperCase(e.target.value)})} />
            <Input placeholder="VALOR R$" value={maintenanceForm.value} onChange={e => setMaintenanceForm({...maintenanceForm, value: maskCurrency(e.target.value)})} />
            <Button onClick={handleAddMaintenance} className="w-full bg-blue-600">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Vehicles;