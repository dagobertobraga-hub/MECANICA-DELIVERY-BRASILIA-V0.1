import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Schedule } from '@/lib/types';
import { showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Schedules = () => {
  const { schedules, setSchedules } = useStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setFormData({ status: 'Confirmado' });
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
              <Input placeholder="NOME DO CLIENTE" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              <Input placeholder="PLACA" value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <Button onClick={handleSave} className="w-full bg-blue-600">Salvar Agendamento</Button>
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