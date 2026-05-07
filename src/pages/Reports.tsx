import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, toUpperCase } from '@/lib/utils-format';
import { generateBudgetPDF } from '@/lib/pdf-generator';
import { 
  FileText, Car, Calendar, UserCheck, DollarSign, 
  Search, FilterX, Users, TrendingUp, FileDown, 
  MessageSquare, Edit2, Trash2, CheckCircle2, Star, Plus, Info
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

const Reports = () => {
  const { budgets, setBudgets, vehicles, setVehicles, schedules, setSchedules, professionals, reviews, setReviews } = useStorage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const OFFICE_PHONE = "5561991386470";

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'faturamento');
  const [filterName, setFilterName] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterDateStart, setFilterDateStart] = useState(searchParams.get('filter') === 'mes_atual' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] : '');
  const [filterDateEnd, setFilterDateEnd] = useState(searchParams.get('filter') === 'mes_atual' ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] : '');
  const [filterMinKm, setFilterMinKm] = useState('');
  const [filterMaxKm, setFilterMaxKm] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    
    if (searchParams.get('filter') === 'mes_atual') {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
      setFilterDateStart(firstDay);
      setFilterDateEnd(lastDay);
    }
  }, [searchParams]);

  const clearFilters = () => {
    setFilterName(''); setFilterPlate(''); setFilterModel('');
    setFilterDateStart(''); setFilterDateEnd('');
    setFilterMinKm(''); setFilterMaxKm('');
    setSearchParams({});
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
  const filteredReviews = useMemo(() => applyFilters(reviews, 'date', 'vehiclePlate', 'clientName'), [reviews, filterName, filterPlate, filterModel, filterDateStart, filterDateEnd, filterMinKm, filterMaxKm]);

  const totalFaturado = filteredBudgets.filter(b => b.status === 'Pago').reduce((acc, b) => 
    acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    clientName: '',
    vehiclePlate: '',
    rating: 5,
    comment: ''
  });

  const handleSaveManualReview = () => {
    const review = {
      id: Math.random().toString(36).substr(2, 9),
      ...newReview,
      clientName: newReview.clientName.toUpperCase(),
      vehiclePlate: newReview.vehiclePlate.toUpperCase(),
      comment: newReview.comment.toUpperCase(),
      date: new Date().toISOString(),
      budgetId: 'manual'
    };
    setReviews([review, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReview({ clientName: '', vehiclePlate: '', rating: 5, comment: '' });
    showSuccess('Avaliação registrada com sucesso!');
  };

  const handleDownloadPDF = (budget: any) => {
    const doc = generateBudgetPDF(budget);
    doc.save(`orcamento_${budget.number}.pdf`);
  };

  const handleWhatsAppOffice = (message: string) => {
    window.open(`https://wa.me/${OFFICE_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Button variant="outline" onClick={clearFilters} className="w-full border-slate-200 text-slate-500 hover:bg-slate-50 h-10">
                <FilterX className="mr-2" size={16} /> Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
          <TabsTrigger value="faturamento" className="flex gap-2"><DollarSign size={16} /> Faturamento</TabsTrigger>
          <TabsTrigger value="budgets" className="flex gap-2"><FileText size={16} /> Orçamentos</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex gap-2"><Car size={16} /> Veículos</TabsTrigger>
          <TabsTrigger value="schedules" className="flex gap-2"><Calendar size={16} /> Agendamentos</TabsTrigger>
          <TabsTrigger value="reviews" className="flex gap-2"><Star size={16} /> Avaliações</TabsTrigger>
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-blue-600">
                                <Info size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-bold text-sm border-b pb-1">Itens do Orçamento #{b.number}</h4>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {b.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-[10px] p-1 bg-slate-50 rounded">
                                      <span className="truncate flex-1 mr-2">{item.quantity}x {item.description}</span>
                                      <span className="font-bold">{formatCurrency(item.quantity * item.unitValue)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-2 border-t flex justify-between text-xs font-bold">
                                  <span>TOTAL:</span>
                                  <span className="text-blue-700">{formatCurrency(b.items.reduce((acc: number, i: any) => acc + (i.quantity * i.unitValue), 0))}</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(b)}><FileDown size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Baixar PDF</TooltipContent>
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
                    <TableHead>Veículo</TableHead>
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
                              <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}><Edit2 size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Orçamento</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(b)}><FileDown size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Baixar PDF</TooltipContent>
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

        <TabsContent value="reviews">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 uppercase text-sm">Histórico de Avaliações</h3>
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                  <Plus size={16} className="mr-2" /> Inserir Manualmente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Avaliação Manual</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="NOME DO CLIENTE" value={newReview.clientName} onChange={e => setNewReview({...newReview, clientName: e.target.value})} />
                  <Input placeholder="PLACA DO VEÍCULO" value={newReview.vehiclePlate} onChange={e => setNewReview({...newReview, vehiclePlate: e.target.value})} />
                  <div className="flex flex-col items-center gap-2 py-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Nota:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={32} 
                          className={cn("cursor-pointer", star <= newReview.rating ? "text-amber-400" : "text-slate-200")} 
                          fill="currentColor" 
                          onClick={() => setNewReview({...newReview, rating: star})} 
                        />
                      ))}
                    </div>
                  </div>
                  <Textarea placeholder="COMENTÁRIO DO CLIENTE..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="uppercase" />
                  <Button onClick={handleSaveManualReview} className="w-full bg-blue-600">Salvar Avaliação</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{new Date(r.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-bold">{r.clientName}</TableCell>
                      <TableCell>{r.vehiclePlate}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400" : "text-slate-200"} fill="currentColor" />)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs italic max-w-xs truncate">"{r.comment}"</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setReviews(reviews.filter(x => x.id !== r.id))}>
                          <Trash2 size={16} />
                        </Button>
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
                              <Button variant="ghost" size="icon" onClick={() => handleWhatsAppOffice(`Olá! Gostaria de tratar sobre o veículo ${v.model} (${v.plate}) do cliente ${v.clientName}.`)} className="text-green-600"><MessageSquare size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Enviar para WhatsApp (Oficina)</TooltipContent>
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