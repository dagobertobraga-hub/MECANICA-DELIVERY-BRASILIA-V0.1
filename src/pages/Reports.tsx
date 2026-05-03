import React from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils-format';
import { FileText, Car, Calendar, UserCheck, BarChart3 } from 'lucide-react';

const Reports = () => {
  const { budgets, vehicles, schedules, professionals } = useStorage();

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Relatórios Gerais</h2>
        <p className="text-slate-500">Visão consolidada de todos os dados do sistema</p>
      </div>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="budgets" className="flex gap-2">
            <FileText size={18} /> Orçamentos
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex gap-2">
            <Car size={18} /> Veículos
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex gap-2">
            <Calendar size={18} /> Agendamentos
          </TabsTrigger>
          <TabsTrigger value="professionals" className="flex gap-2">
            <UserCheck size={18} /> Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold">#{b.number}</TableCell>
                      <TableCell>{b.clientName}</TableCell>
                      <TableCell>{b.vehiclePlate}</TableCell>
                      <TableCell>{new Date(b.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{b.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(b.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>KM Atual</TableHead>
                    <TableHead>Última Troca Óleo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold">{v.plate}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell>{v.clientName}</TableCell>
                      <TableCell>{v.currentKm.toLocaleString()} KM</TableCell>
                      <TableCell>{v.lastOilChangeKm.toLocaleString()} KM</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.date).toLocaleDateString('pt-BR')} às {s.time}</TableCell>
                      <TableCell>{s.clientName}</TableCell>
                      <TableCell>{s.vehiclePlate}</TableCell>
                      <TableCell>
                        <Badge>{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Equipe e Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Taxa (%)</TableHead>
                    <TableHead className="text-right">Total Comissões</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((p) => {
                    const totalComm = budgets
                      .filter(b => b.professionalId === p.id && b.status === 'Pago')
                      .reduce((acc, b) => acc + (b.commissionValue || 0), 0);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell>{p.role}</TableCell>
                        <TableCell>{p.commissionRate}%</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">
                          {formatCurrency(totalComm)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;