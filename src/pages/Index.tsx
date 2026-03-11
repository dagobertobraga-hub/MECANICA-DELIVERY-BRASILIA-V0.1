import React from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils-format';
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Index = () => {
  const { budgets, vehicles } = useStorage();

  const totalRevenue = budgets
    .filter(b => b.status === 'Pago')
    .reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0);

  const pendingBudgets = budgets.filter(b => ['Aberto', 'Em Negociação'].includes(b.status)).length;
  const overdueMaintenance = vehicles.filter(v => (v.lastOilChangeKm + v.oilIntervalKm) <= v.currentKm).length;

  const statusData = [
    { name: 'Aberto', value: budgets.filter(b => b.status === 'Aberto').length, color: '#3b82f6' },
    { name: 'Aprovado', value: budgets.filter(b => b.status === 'Aprovado').length, color: '#10b981' },
    { name: 'Pago', value: budgets.filter(b => b.status === 'Pago').length, color: '#8b5cf6' },
    { name: 'Recusado', value: budgets.filter(b => b.status === 'Recusado').length, color: '#ef4444' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Bem-vindo, Dagoberto Cardoso Braga</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Faturamento Total</CardTitle>
            <DollarSign className="text-blue-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Orçamentos Pendentes</CardTitle>
            <TrendingUp className="text-amber-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBudgets}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Manutenções Vencidas</CardTitle>
            <AlertTriangle className="text-red-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueMaintenance}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Veículos em Dia</CardTitle>
            <CheckCircle2 className="text-green-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length - overdueMaintenance}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.filter(v => (v.lastOilChangeKm + v.oilIntervalKm) <= v.currentKm).slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-bold text-red-700">{v.plate}</p>
                    <p className="text-sm text-red-600">{v.model} - {v.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-red-500 uppercase">Troca de Óleo Vencida</p>
                    <p className="text-sm font-bold text-red-700">{v.currentKm - (v.lastOilChangeKm + v.oilIntervalKm)} km atrás</p>
                  </div>
                </div>
              ))}
              {overdueMaintenance === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="mx-auto mb-2 opacity-20" size={48} />
                  <p>Todos os veículos estão com a manutenção em dia!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;