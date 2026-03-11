import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, calculateNextMaintenance } from '@/lib/utils-format';
import { Wrench, Clock, CheckCircle2, AlertTriangle, Package, Settings, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ClientDashboard = () => {
  const { vehicles, budgets, schedules, setSchedules } = useStorage();
  const plate = localStorage.getItem('logged_client_plate');
  const vehicle = vehicles.find(v => v.plate === plate);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  if (!vehicle) return <div className="p-8 text-center">Veículo não encontrado.</div>;

  const detailedHistory = budgets
    .filter(b => b.vehiclePlate === plate && ['Aprovado', 'Concluído', 'Pago', 'Em Andamento'].includes(b.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const remaining = calculateNextMaintenance(vehicle.currentKm, vehicle.lastOilChangeKm, vehicle.oilIntervalKm);
  const isOverdue = remaining === 0;

  const handleRequestSchedule = () => {
    if (scheduleDate && scheduleTime) {
      const newRequest = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: vehicle.clientName,
        vehiclePlate: vehicle.plate,
        date: scheduleDate,
        time: scheduleTime,
        status: 'Pendente' as const,
        createdAt: new Date().toISOString()
      };
      setSchedules([newRequest, ...schedules]);
      setIsModalOpen(false);
      setScheduleDate('');
      setScheduleTime('');
      showSuccess('Solicitação enviada! Aguarde a confirmação.');
    }
  };

  return (
    <Layout isAdmin={false}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Olá, {vehicle.clientName}!</h2>
          <p className="text-slate-500">Acompanhe a saúde e o histórico detalhado do seu {vehicle.model}</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              <CalendarPlus className="mr-2" size={20} /> Solicitar Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-slate-500">Escolha a melhor data e horário para sua revisão. Nossa equipe entrará em contato para confirmar.</p>
              <div className="space-y-2">
                <label className="text-sm font-bold">Data Sugerida</label>
                <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Horário Sugerido</label>
                <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
              <Button onClick={handleRequestSchedule} className="w-full bg-blue-600 h-12 font-bold">
                ENVIAR SOLICITAÇÃO
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={cn("border-l-4", isOverdue ? "border-l-red-500" : "border-l-green-500")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Status do Óleo</CardTitle>
            {isOverdue ? <AlertTriangle className="text-red-500" /> : <CheckCircle2 className="text-green-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOverdue ? "VENCIDO" : `Faltam ${remaining.toLocaleString()} KM`}
            </div>
            <p className="text-xs text-slate-400 mt-1">Intervalo de {vehicle.oilIntervalKm} KM</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">KM Atual</CardTitle>
            <Clock className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.currentKm.toLocaleString()} KM</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total de Manutenções</CardTitle>
            <Wrench className="text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedHistory.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {detailedHistory.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {detailedHistory.map((budget) => {
                const total = budget.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
                const parts = budget.items.filter(i => i.type === 'Peça');
                const services = budget.items.filter(i => i.type === 'Serviço');

                return (
                  <AccordionItem key={budget.id} value={budget.id} className="border rounded-lg px-4 bg-slate-50/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-1 items-center justify-between text-left pr-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-white">{budget.status}</Badge>
                            <span className="font-bold text-slate-700">OS #{budget.number}</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {new Date(budget.createdAt).toLocaleDateString('pt-BR')} • {budget.km.toLocaleString()} KM
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-700">{formatCurrency(total)}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Clique para detalhes</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Package size={14} /> Peças Utilizadas
                          </h4>
                          <div className="space-y-2">
                            {parts.length > 0 ? parts.map(item => (
                              <div key={item.id} className="flex justify-between text-sm p-2 bg-white rounded border border-slate-100">
                                <span>{item.quantity}x {item.description}</span>
                                <span className="font-medium">{formatCurrency(item.quantity * item.unitValue)}</span>
                              </div>
                            )) : <p className="text-xs text-slate-400 italic">Nenhuma peça registrada.</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Settings size={14} /> Mão de Obra / Serviços
                          </h4>
                          <div className="space-y-2">
                            {services.length > 0 ? services.map(item => (
                              <div key={item.id} className="flex justify-between text-sm p-2 bg-white rounded border border-slate-100">
                                <span>{item.description}</span>
                                <span className="font-medium">{formatCurrency(item.quantity * item.unitValue)}</span>
                              </div>
                            )) : <p className="text-xs text-slate-400 italic">Nenhum serviço registrado.</p>}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Wrench className="mx-auto mb-2 opacity-20" size={48} />
              <p>Nenhum histórico detalhado encontrado para este veículo.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ClientDashboard;