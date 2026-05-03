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
import { generateBudgetPDF } from '@/lib/pdf-generator';
import { 
  FileText, Car, Calendar, UserCheck, DollarSign, 
  Search, FilterX, Users, TrendingUp, FileDown, 
  MessageSquare, Edit2, Trash2, CheckCircle2, XCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Reports = () => {
  const { budgets, setBudgets, vehicles, setVehicles, schedules, setSchedules, professionals } = useStorage();
  const navigate = useNavigate();

  const [filterName, setFilterName] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMinKm, setFilterMinKm] = useState('');
  const [filterMaxKm, setFilterMaxKm] = useState('');

  const clearFilters = () => {
    setFilterName(''); setFilterPlate(''); setFilterModel('');
    setFilterDateStart(''); setFilterDateEnd('');
    setFilterMinKm(''); setFilterMaxKm('');
  };

  const applyFilters = (data: any[], dateKey: string = 'createdAt', plateKey: string = 'vehiclePlate', nameKey: string = 'clientName') => {
    return data.filter(item => {
      const vehicle = vehicles.find(v => v.plate === item[plateKey]);
      const matchesName = item[nameKey]?.toLowerCase().includes(filterName.toLowerCase());
      const matchesPlate = item[plateKey]?.toLowerCase().includes(filterPlate.toLowerCase());
      const matchesModel = vehicle ? vehicle.model.toLowerCase().includes(filterModel.toLowerCase()) : true;
      const itemDate = new Date(item[dateKey]);
      const matchesDateStart = filterDateStart ? itemDate >= new Date(filterDateStart) : true;
      const matchesDateEnd = filterDateEnd ? itemDate <= new Date(filterDateEnd) : true;
      const kmValue = item.km || vehicle?.currentKm || 0;
      const matchesMinKm = filterMinKm ? kmValue >= Number(filterMinKm) : true;
      const matchesMaxKm = filterMaxKm ? kmValue <= Number(filterMaxKm) : true;
      return matchesName && matchesPlate && matchesModel && matchesDateStart && matchesDateEnd && matchesMinKm && matchesMaxKm;
    });
  };

  const filteredBudgets = useMemo(() => applyFilters(budgets), [budgets, vehicles, filterName, filterPlate, filterModel, filterDateStart, filterDateEnd, filterMinKm, filterMaxKm]);
  const filteredVehicles = useMemo(() => applyFilters(vehicles, 'id', 'plate', 'clientName'), [vehicles, filterName, filterPlate, filterModel, filterDateStart, filterDateEnd, filterMinKm, filterMaxKm]);
  const filteredSchedules = useMemo(() => applyFilters(schedules, 'date', 'vehiclePlate', 'clientName'), [schedules, vehicles, filterName, filterPlate, filterModel, filterDateStart, filterDateEnd, filterMinKm, filterMaxKm]);

  const totalFaturado = filteredBudgets.filter(b => b.status === 'Pago').reduce((acc, b) => 
    acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0
  );

  const handleDownloadPDF = (budget: any) => {
    const doc = generateBudgetPDF(budget);
    doc.save(`orcamento_${budget.number}.pdf`);
  };

  const handleWhatsApp = (phone: string, message: string) => {
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Relatórios e Gestão</h2>
        <p className="text-slate-500">Filtre, analise e gerencie todos os dados do sistema</p>
      </div>

      <Card className="mb-8 border-blue-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700 uppercase">
            <Search size={18} /> Filtros de Busca Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cliente</label>
              <Input placeholder="NOME..." value={filterName} onChange={e => setFilterName(toUpperCase(e.target.value))} />
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
              <Button variant="outline" onClick={clearFilters} className="w-full border-slate-200 text-slate-500 hover:bg-slate-50">
                <FilterX className="mr-2" size={16} /> Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faturamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
          <TabsTrigger value="faturamento" className="flex gap-2"><DollarSign size={16} /> Faturamento</TabsTrigger>
          <TabsTrigger value="budgets" className="flex gap-2"><FileText size={16} /> Orçamentos</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex gap-2"><Car size={16} /> Veículos</TabsTrigger>
          <TabsTrigger value="schedules" className="flex gap-2"><Calendar size={16} /> Agendamentos</TabsTrigger>
          <TabsTrigger value="professionals" className="flex gap-2"><UserCheck size={16} /> Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="faturamento">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-blue-600 text-white shadow-lg shadow-blue-100">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase opacity-80">Total Faturado (Filtrado)</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{formatCurrency(totalFaturado)}</div>
                <p className="text-[10px] mt-1 opacity-70">{filteredBudgets.filter(b => b.status === 'Pago').length} orçamentos pagos</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.filter(b => b.status === 'Pago').map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold">#{b.number}</TableCell>
                      <TableCell>{b.clientName}</TableCell>
                      <TableCell>{b.vehiclePlate}</TableCell>
                      <TableCell>{new Date(b.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{formatCurrency(b.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(b)}><FileDown size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Baixar PDF</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Orçamento</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold">#{b.number}</TableCell>
                      <TableCell>{b.clientName}</TableCell>
                      <TableCell>{b.vehiclePlate}</TableCell>
                      <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(b.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(b)}><FileDown size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Baixar PDF</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(b.clientPhone, `Olá ${b.clientName}! Segue seu orçamento #${b.number}.`)} className="text-green-600"><MessageSquare size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Enviar WhatsApp</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Orçamento</TooltipContent>
                          </Tooltip>
                        </div>
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>KM Atual</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold">{v.plate}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell>{v.clientName}</TableCell>
                      <TableCell>{v.currentKm.toLocaleString()} KM</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(v.clientPhone, `Olá ${v.clientName}! Como está seu ${v.model}?`)} className="text-green-600"><MessageSquare size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Enviar WhatsApp</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Veículo</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.date).toLocaleDateString('pt-BR')} às {s.time}</TableCell>
                      <TableCell>{s.clientName}</TableCell>
                      <TableCell>{s.vehiclePlate}</TableCell>
                      <TableCell><Badge>{s.status}</Badge></TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          {s.status === 'Pendente' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-green-600" onClick={() => {
                                  setSchedules(schedules.map(x => x.id === s.id ? {...x, status: 'Confirmado'} : x));
                                  showSuccess('Confirmado!');
                                }}><CheckCircle2 size={16} /></Button>
                              </TooltipTrigger>
                              <TooltipContent>Confirmar Agendamento</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate('/schedules')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Agendamento</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase">Total de Profissionais</CardTitle>
                <Users className="text-blue-500" size={16} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{professionals.length}</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead className="text-right">Comissões Pagas</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((p) => {
                    const totalComm = budgets.filter(b => b.professionalId === p.id && b.status === 'Pago').reduce((acc, b) => acc + (b.commissionValue || 0), 0);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell>{p.role}</TableCell>
                        <TableCell>{p.commissionRate}%</TableCell>
                        <TableCell className="text-right font-bold text-green-600">{formatCurrency(totalComm)}</TableCell>
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate('/professionals')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Profissional</TooltipContent>
                          </Tooltip>
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