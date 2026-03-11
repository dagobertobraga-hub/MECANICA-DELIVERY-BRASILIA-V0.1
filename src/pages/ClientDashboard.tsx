import React from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, calculateNextMaintenance } from '@/lib/utils-format';
import { Wrench, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const ClientDashboard = () => {
  const { vehicles } = useStorage();
  const plate = localStorage.getItem('logged_client_plate');
  const vehicle = vehicles.find(v => v.plate === plate);

  if (!vehicle) return <div className="p-8 text-center">Veículo não encontrado.</div>;

  const remaining = calculateNextMaintenance(vehicle.currentKm, vehicle.lastOilChangeKm, vehicle.oilIntervalKm);
  const isOverdue = remaining === 0;

  return (
    <Layout isAdmin={false}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Olá, {vehicle.clientName}!</h2>
        <p className="text-slate-500">Acompanhe a saúde do seu {vehicle.model}</p>
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
            <CardTitle className="text-sm font-medium text-slate-500">Última Revisão</CardTitle>
            <Wrench className="text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.maintenances.length > 0 
                ? new Date(vehicle.maintenances[vehicle.maintenances.length - 1].date).toLocaleDateString()
                : "Nenhuma"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Manutenções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicle.maintenances.slice().reverse().map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{m.type}</Badge>
                    <span className="font-bold">{m.description}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Realizado em {new Date(m.date).toLocaleDateString()} com {m.km.toLocaleString()} KM
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">{formatCurrency(m.value)}</p>
                </div>
              </div>
            ))}
            {vehicle.maintenances.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                Nenhum registro de manutenção encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ClientDashboard;