import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils-format';
import { Wrench, Clock, CheckCircle2, AlertTriangle, CalendarPlus, Calendar, Star, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Schedule, Review } from '@/lib/types';
import { getNextRevision, calculateUsagePrediction } from '@/lib/maintenance-logic';

const ClientDashboard = () => {
  const { vehicles, budgets, schedules, setSchedules, reviews, setReviews } = useStorage();
  const plate = localStorage.getItem('logged_client_plate');
  const vehicle = vehicles.find(v => v.plate === plate);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  if (!vehicle) return <div className="p-8 text-center">Veículo não encontrado.</div>;

  const clientSchedules = schedules.filter(s => s.vehiclePlate === plate);
  const clientBudgets = budgets.filter(b => b.vehiclePlate === plate && b.status === 'Pago');
  const nextRev = getNextRevision(vehicle.currentKm);
  const prediction = calculateUsagePrediction(vehicle.currentKm, vehicle.avgKmMonth);
  const isOverdue = (vehicle.currentKm - vehicle.lastOilChangeKm) >= vehicle.oilIntervalKm;

  const handleSaveSchedule = () => {
    const newRequest: Schedule = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: vehicle.clientName,
      vehiclePlate: vehicle.plate,
      date: scheduleDate,
      time: scheduleTime,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };
    setSchedules([newRequest, ...schedules]);
    showSuccess('Solicitação enviada!');
    setIsModalOpen(false);
  };

  const handleSaveReview = () => {
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: vehicle.clientName,
      vehiclePlate: vehicle.plate,
      rating,
      comment: comment.toUpperCase(),
      date: new Date().toISOString(),
      budgetId: selectedBudgetId
    };
    setReviews([...reviews, newReview]);
    showSuccess('Obrigado pela sua avaliação!');
    setIsReviewModalOpen(false);
    setComment('');
    setRating(5);
  };

  const handleContactWhatsApp = () => {
    const msg = `Olá! Sou ${vehicle.clientName}, proprietário do veículo ${vehicle.model} (${vehicle.plate}). Gostaria de tirar uma dúvida.`;
    window.open(`https://wa.me/5561991386470?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Layout isAdmin={false}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Olá, {vehicle.clientName}!</h2>
          <p className="text-slate-500">Acompanhe seu {vehicle.model} ({vehicle.plate})</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-green-600 text-green-600 hover:bg-green-50" onClick={handleContactWhatsApp}>
            <MessageSquare className="mr-2" size={18} /> Falar no WhatsApp
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none bg-blue-600">
                <CalendarPlus className="mr-2" /> Agendar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Solicitar Agendamento</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">DATA DESEJADA</label>
                  <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">HORÁRIO</label>
                  <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                </div>
                <Button onClick={handleSaveSchedule} className="w-full bg-blue-600 h-12 font-bold">Enviar Solicitação</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={cn("border-l-4", isOverdue ? "border-l-red-500" : "border-l-green-500")}>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Status de Manutenção</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isOverdue ? "VENCIDO" : "EM DIA"}</div>
            <p className="text-xs text-slate-400 mt-1">Próxima: {nextRev.name}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">KM Atual</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{vehicle.currentKm.toLocaleString()} KM</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Previsão de Revisão</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prediction.estimatedDate.toLocaleDateString('pt-BR')}</div>
            <p className="text-xs text-slate-400 mt-1">Faltam {prediction.remainingKm.toLocaleString()} KM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="text-blue-600" /> Meus Agendamentos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientSchedules.length > 0 ? clientSchedules.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">{new Date(s.date).toLocaleDateString()} às {s.time}</p>
                    <Badge className={cn(
                      "mt-1",
                      s.status === 'Pendente' ? "bg-amber-100 text-amber-700" : 
                      s.status === 'Confirmado' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )} variant="outline">{s.status}</Badge>
                  </div>
                  {s.status === 'Pendente' && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setSchedules(schedules.filter(x => x.id !== s.id))}>Cancelar</Button>
                  )}
                </div>
              )) : <p className="text-center text-slate-400 py-8 text-sm">Nenhum agendamento ativo.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="text-amber-500" /> Avaliar Serviços Realizados</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientBudgets.length > 0 ? clientBudgets.map(b => {
                const review = reviews.find(r => r.budgetId === b.id);
                return (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-800">OS #{b.number}</p>
                        <p className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!review && (
                        <Button size="sm" className="bg-blue-600" onClick={() => { setSelectedBudgetId(b.id); setIsReviewModalOpen(true); }}>Avaliar</Button>
                      )}
                    </div>
                    
                    {review && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? "text-amber-400" : "text-slate-200"} fill="currentColor" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 italic">"{review.comment}"</p>
                      </div>
                    )}
                  </div>
                );
              }) : <p className="text-center text-slate-400 py-8 text-sm">Nenhum serviço concluído para avaliar.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-black text-slate-800">AVALIAR SERVIÇO</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-bold text-slate-500 uppercase">Sua nota para o serviço:</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={40} 
                    className={cn("cursor-pointer transition-all hover:scale-110", star <= rating ? "text-amber-400" : "text-slate-200")} 
                    fill="currentColor" 
                    onClick={() => setRating(star)} 
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase">Seu Comentário:</label>
              <Textarea 
                placeholder="CONTE-NOS O QUE ACHOU DO SERVIÇO, ATENDIMENTO E QUALIDADE..." 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="min-h-[120px] uppercase"
              />
            </div>
            
            <Button onClick={handleSaveReview} className="w-full bg-blue-600 h-12 text-lg font-bold shadow-lg shadow-blue-100">
              ENVIAR AVALIAÇÃO
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClientDashboard;