import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, CheckCircle, XCircle, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { Schedule } from '@/lib/types';
import { showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

const Schedules = () => {
  const { schedules, setSchedules, vehicles } = useStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openSearchVehicle, setOpenSearchVehicle] = useState(false);
  const [formData, setFormData] = useState<Partial<Schedule>>({
    clientName: '',
    vehiclePlate: '',
    date: '',
    time: '',
    status: 'Confirmado'
  });

  const handleStatusChange = (id: string, status: Schedule['status']) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
    showSuccess(`Agendamento ${status.toLowerCase()}!`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este agendamento?')) {
      setSchedules(schedules.filter(s => s.id !== id));
      showSuccess('Agendamento excluído.');
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      setFormData({
        ...formData,
        clientName: v.clientName,
        vehiclePlate: v.plate
      });
      setOpenSearchVehicle(false);
    }
  };

  const handleSave = () => {
    const newSchedule: Schedule = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: formData.clientName?.toUpperCase() || '',
      vehiclePlate: formData.vehiclePlate?.toUpperCase() || '',
      date: formData.date || '',
      time: formData.time || '',
      status: formData.status as any,
      createdAt: new Date().toISOString()
    };
    setSchedules([newSchedule, ...schedules]);
    setIsModalOpen(false);
    setFormData({ status: 'Confirmado', clientName: '', vehiclePlate: '', date: '', time: '' });
    showSuccess('Agendamento criado com sucesso!');
  };

  return (
    <Layout isAdmin={true}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Agendamentos</h2>
          <p className="text-slate-500">Gerencie as solicitações de serviços</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600">
              <Plus className="mr-2" size={20} /> Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Buscar Veículo/Cliente</label>
                <Popover open={openSearchVehicle} onOpenChange={setOpenSearchVehicle}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSearchVehicle}
                      className="w-full justify-between bg-slate-50"
                    >
                      {formData.vehiclePlate ? `${formData.vehiclePlate} - ${formData.clientName}` : "PESQUISAR POR PLACA OU NOME..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Digite a placa ou nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {vehicles.map((v) => (
                            <CommandItem
                              key={v.id}
                              value={`${v.plate} ${v.clientName}`}
                              onSelect={() => handleSelectVehicle(v.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.vehiclePlate === v.plate ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-bold mr-2">{v.plate}</span>
                              <span className="text-slate-500">{v.clientName}</span>
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

              <Input placeholder="NOME DO CLIENTE" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value.toUpperCase()})} />
              <Input placeholder="PLACA" value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value.toUpperCase()})} />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                  <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full bg-blue-600 h-12 font-bold">Salvar Agendamento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedules.length > 0 ? [...schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((s) => (
          <Card key={s.id} className={cn(
            "border-l-4",
            s.status === 'Pendente' ? "border-l-amber-500" : 
            s.status === 'Confirmado' ? "border-l-green-500" : "border-l-red-500"
          )}>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-full">
                  <Calendar className="text-slate-600" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{s.clientName}</h3>
                    <Badge variant={s.status === 'Pendente' ? 'secondary' : 'outline'}>{s.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{s.vehiclePlate} • {new Date(s.date).toLocaleDateString('pt-BR')} às {s.time}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {s.status === 'Pendente' && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(s.id, 'Confirmado')}>
                      <CheckCircle className="mr-2" size={16} /> Confirmar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleStatusChange(s.id, 'Cancelado')}>
                      <XCircle className="mr-2" size={16} /> Recusar
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(s.id)}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-lg border border-dashed">
            <Calendar className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedules;