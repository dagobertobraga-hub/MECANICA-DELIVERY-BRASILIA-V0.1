import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, toUpperCase } from '@/lib/utils-format';
import { FileText, Car, Calendar, UserCheck, DollarSign, Search, FilterX } from 'lucide-react';

const Reports = () => {
  const { budgets, vehicles, schedules, professionals } = useStorage();

  // Estados dos filtros
  const [filterName, setFilterName] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMinKm, setFilterMinKm] = useState('');
  const [filterMaxKm, setFilterMaxKm] = useState('');

  const clearFilters = () => {
    setFilterName('');
    setFilterPlate('');
    setFilterModel('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterMinKm('');
    setFilterMaxKm('');
  };

  // Lógica de filtragem para Faturamento
  const filteredFaturamento = useMemo(() => {
    return budgets.filter(b => {
      if (b.status !== 'Pago') return false;

      const vehicle = vehicles.find(v => v.plate === b.vehiclePlate);
      
      const matchesName = b.clientName.toLowerCase().includes(filterName.toLowerCase());
      const matchesPlate = b.vehiclePlate.toLowerCase().includes(filterPlate.toLowerCase());
      const matchesModel = vehicle ? vehicle.model.toLowerCase().includes(filterModel.toLowerCase()) : true;
      
      const budgetDate = new Date(b.createdAt);
      const matchesDateStart = filterDateStart ? budgetDate >= new Date(filterDateStart) : true;
      const matchesDateEnd = filterDateEnd ? budgetDate <= new Date(filterDateEnd) : true;
      
      const matchesMinKm = filterMinKm ? b.km >= Number(filterMinKm) : true;
      const matchesMaxKm = filterMaxKm ? b.km <= Number(filterMaxKm) : true;

      return matchesName && matchesPlate && matchesModel && matchesDateStart && matchesDateEnd && matchesMinKm && matchesMaxKm;
    });
  }, [budgets, vehicles, filterName, filterPlate, filterModel, filterDateStart, filterDateEnd, filterMinKm, filterMaxKm]);

  const totalFaturado = filteredFaturamento.reduce((acc, b) => 
    acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0
  );

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Relatórios Gerais</h2>
        <p className="text-slate-500">Visão consolidada e filtros de faturamento</p>
      </div>

      <Tabs defaultValue="faturamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
          <TabsTrigger value="faturamento" className="flex gap-2">
            <DollarSign size={18} /> Faturamento
          </TabsTrigger>
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

        <TabsContent value="faturamento">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search size={20} className="text-blue-600" /> Filtros de Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Cliente</label>
                  <Input placeholder="BUSCAR NOME..." value={filterName} onChange={e => setFilterName(toUpperCase(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Placa</label>
                  <Input placeholder="ABC1D23" value={filterPlate} onChange={e => setFilterPlate(toUpperCase(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo</label>
                  <Input placeholder="EX: COROLLA" value={filterModel} onChange={e => setFilterModel(toUpperCase(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Início</label>
                  <Input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Fim</label>
                  <Input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">KM Mínimo</label>
                  <Input type="number" placeholder="0" value={filterMinKm} onChange={e => setFilterMinKm(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">KM Máximo</label>
                  <Input type="number" placeholder="999999" value={filterMaxKm} onChange={e => setFilterMaxKm(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full border-slate-200 text-slate-500">
                    <FilterX className="mr-2" size={16} /> Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase opacity-80">Total Faturado (Filtrado)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{formatCurrency(totalFaturado)}</div>
                <p className="text-[10px] mt-1 opacity-70">{filteredFaturamento.length} orçamentos pagos encontrados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaturamento.length > 0 ? filteredFaturamento.map((b) => {
                    const vehicle = vehicles.find(v => v.plate === b.vehiclePlate);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-bold">#{b.number}</TableCell>
                        <TableCell>{b.clientName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">{b.vehiclePlate}</span>
                            <span className="text-[10px] text-slate-500">{vehicle?.model || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{b.km.toLocaleString()} KM</TableCell>
                        <TableCell>{new Date(b.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(b.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        Nenhum faturamento encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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