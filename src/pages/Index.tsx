import React from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils-format';
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Calendar, ArrowRight, Users, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Link } from 'react-router-dom';

const Index = () => {
  const { budgets, vehicles, schedules, reviews } = useStorage();

  const totalRevenue = budgets
    .filter(b => b.status === 'Pago')
    .reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0);

  const monthlyRevenue = budgets
    .filter(b => b.status === 'Pago' && new Date(b.createdAt).getMonth() === new Date().getMonth())
    .reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0);

  const pendingBudgets = budgets.filter(b => ['Aberto', 'Em Negociação'].includes(b.status)).length;
  const overdueMaintenance = vehicles.filter(v => (v.lastOilChangeKm + v.oilIntervalKm) <= v.currentKm).length;
  const pendingSchedules = schedules.filter(s => s.status === 'Pendente');

  const statusData = [
    { name: 'Aberto', value: budgets.filter(b => b.status === 'Aberto').length, color: '#3b82f6' },
    { name: 'Aprovado', value: budgets.filter(b => b.status === 'Aprovado').length, color: '#10b981' },
    { name: 'Pago', value: budgets.filter(b => b.status === 'Pago').length, color: '#8b5cf6' },
    { name: 'Recusado', value: budgets.filter(b => b.status === 'Recusado').length, color: '#ef4444' },
  ];

  const vehicleStats = [
    { name: 'Em Dia', value: vehicles.length - overdueMaintenance, color: '#10b981' },
    { name: 'Vencido', value: overdueMaintenance, color: '#ef4444' },
  ];

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Administrativo</h2>
        <p className="text-slate-500">Mecânica Delivery Brasília - Gestão Geral</p>
      </div>

      {pendingSchedules.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-amber-600" size={20} />
              <CardTitle className="text-lg font-bold text-amber-900">Novas Solicitações</CardTitle>
              <Badge className="bg-amber-500">{pendingSchedules.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-amber-700"><Link to="/schedules">Ver todos <ArrowRight className="ml-1" size={16} /></Link></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingSchedules.slice(0, 3).map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                  <p className="font-bold text-sm">{s.clientName}</p>
                  <p className="text-xs text-slate-500">{s.vehiclePlate} • {new Date(s.date).toLocaleDateString()} às {s.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/reports?tab=faturamento">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Faturamento Total</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent>
          </Card>
        </Link>
        
        <Link to="/reports?tab=faturamento&filter=mes_atual">
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Receita Mensal</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div></CardContent>
          </Card>
        </Link>

        <Link to="/budgets?filter=pendentes">
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Orçamentos Abertos</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingBudgets}</div></CardContent>
          </Card>
        </Link>

        <Link to="/vehicles?filter=vencidos">
          <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-slate-500 uppercase">Manutenções Vencidas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{overdueMaintenance}</div></CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle>Status dos Orçamentos</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Saúde da Frota</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {vehicleStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-bold">{vehicles.length}</p>
              <p className="text-[10px] text-slate-400 uppercase">Veículos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertas Críticos</CardTitle>
            <Badge variant="destructive">{overdueMaintenance} Veículos</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicles.filter(v => (v.lastOilChangeKm + v.oilIntervalKm) <= v.currentKm).slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-bold text-red-700">{v.plate}</p>
                    <p className="text-xs text-red-600">{v.model} - {v.clientName}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-700 border-red-200" asChild>
                    <Link to={`/vehicles?search=${v.plate}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Avaliações</CardTitle>
            <Star className="text-amber-400" fill="currentColor" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.slice(0, 3).map(r => (
                <div key={r.id} className="border-b pb-3 last:border-0">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400" : "text-slate-200"} fill="currentColor" />)}
                  </div>
                  <p className="text-xs font-bold">{r.clientName}</p>
                  <p className="text-[10px] text-slate-500 italic">"{r.comment}"</p>
                </div>
              )) : <p className="text-center text-slate-400 py-8 text-sm">Nenhuma avaliação ainda.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;