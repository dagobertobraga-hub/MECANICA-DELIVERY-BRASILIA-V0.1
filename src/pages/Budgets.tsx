import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileDown, MessageSquare, Edit2, Trash2, Check, ChevronsUpDown, FilterX, User, Activity, Calendar, Save } from 'lucide-react';
import { Budget, BudgetItem, BudgetStatus, Vehicle } from '@/lib/types';
import { formatCurrency, toUpperCase, formatPlate, maskPhone, maskCurrency, parseCurrencyToNumber } from '@/lib/utils-format';
import { generateBudgetPDF } from '@/lib/pdf-generator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { showError, showSuccess } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

const Budgets = () => {
  const { budgets, setBudgets, professionals, vehicles, setVehicles } = useStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const filterParam = searchParams.get('filter');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const OFFICE_PHONE = "5561991386470";

  const initialFormData: Partial<Budget> = {
    clientName: '', 
    clientPhone: '', 
    vehiclePlate: '', 
    km: 0, 
    status: 'Aberto', 
    items: [], 
    professionalId: '',
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Budget>>(initialFormData);

  const [newItem, setNewItem] = useState({
    description: '', quantity: 1, unitValue: "R$ 0,00", type: 'Peça'
  });

  const calculateTotals = (items: BudgetItem[]) => {
    const parts = items.filter(i => i.type === 'Peça').reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    const services = items.filter(i => i.type === 'Serviço').reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    return { parts, services, total: parts + services };
  };

  const handleSave = () => {
    const cleanPlate = formatPlate(formData.vehiclePlate || '');
    if (!cleanPlate) {
      showError('A placa é obrigatória.');
      return;
    }

    const existingVehicle = vehicles.find(v => v.plate === cleanPlate);
    
    if (existingVehicle && (formData.km || 0) < existingVehicle.currentKm) {
      showError(`A quilometragem não pode ser inferior à atual do veículo (${existingVehicle.currentKm.toLocaleString()} KM).`);
      return;
    }

    if (!existingVehicle) {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        plate: cleanPlate,
        model: 'NÃO INFORMADO',
        clientName: toUpperCase(formData.clientName || 'CLIENTE NOVO'),
        clientPhone: formData.clientPhone || '',
        password: '1234',
        currentKm: formData.km || 0,
        oilIntervalKm: 10000,
        lastOilChangeKm: 0,
        avgKmMonth: 1000,
        maintenances: []
      };
      setVehicles([...vehicles, newVehicle]);
      showSuccess('Novo veículo cadastrado automaticamente!');
    } else if (formData.km && formData.km > existingVehicle.currentKm) {
      setVehicles(vehicles.map(v => v.plate === cleanPlate ? { ...v, currentKm: formData.km || v.currentKm } : v));
    }

    const totals = calculateTotals(formData.items || []);
    const prof = professionals.find(p => p.id === formData.professionalId);
    const commission = prof ? (totals.services * (prof.commissionRate / 100)) : 0;

    const budgetData = { 
      ...formData, 
      vehiclePlate: cleanPlate, 
      commissionValue: commission, 
      updatedAt: new Date().toISOString(),
      date: formData.date || new Date().toISOString().split('T')[0]
    };

    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...editingBudget, ...budgetData } as Budget : b));
    } else {
      const newBudget: Budget = {
        id: Math.random().toString(36).substr(2, 9),
        number: (budgets.length + 1).toString().padStart(4, '0'),
        clientName: formData.clientName || '',
        clientPhone: formData.clientPhone || '',
        vehiclePlate: cleanPlate,
        km: formData.km || 0,
        status: formData.status as BudgetStatus,
        items: formData.items || [],
        professionalId: formData.professionalId,
        commissionValue: commission,
        date: formData.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBudgets([newBudget, ...budgets]);
    }
    setIsModalOpen(false);
    setEditingBudget(null);
    setFormData(initialFormData);
    setEditingItemId(null);
    showSuccess('Orçamento salvo!');
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      setFormData(prev => ({ ...prev, clientName: v.clientName, clientPhone: maskPhone(v.clientPhone), vehiclePlate: v.plate, km: v.currentKm }));
      setOpenSearch(false);
      showSuccess('Dados carregados!');
    }
  };

  const addItem = () => {
    if (newItem.description && newItem.unitValue) {
      const unitValueNum = parseCurrencyToNumber(newItem.unitValue);
      const itemData = { 
        id: editingItemId || Math.random().toString(36).substr(2, 9),
        description: newItem.description,
        quantity: newItem.quantity,
        unitValue: unitValueNum,
        type: newItem.type as any
      };

      if (editingItemId) {
        setFormData(prev => ({
          ...prev,
          items: prev.items?.map(i => i.id === editingItemId ? itemData : i)
        }));
        setEditingItemId(null);
        showSuccess('Item atualizado!');
      } else {
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), itemData] }));
        showSuccess('Item adicionado!');
      }
      
      setNewItem({ description: '', quantity: 1, unitValue: "R$ 0,00", type: 'Peça' });
    }
  };

  const editItem = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setNewItem({
      description: item.description,
      quantity: item.quantity,
      unitValue: maskCurrency(item.unitValue),
      type: item.type
    });
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== id) }));
    if (editingItemId === id) {
      setEditingItemId(null);
      setNewItem({ description: '', quantity: 1, unitValue: "R$ 0,00", type: 'Peça' });
    }
  };

  const handleDownloadPDF = (budget: Budget) => {
    const doc = generateBudgetPDF(budget);
    doc.save(`orcamento_${budget.number}.pdf`);
  };

  const handleWhatsAppOffice = (budget: Budget) => {
    const total = budget.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    const message = `Olá! Segue o orçamento #${budget.number} da Mecânica Delivery Brasília.\nVeículo: ${budget.vehiclePlate.toUpperCase()}\nTotal: ${formatCurrency(total)}`;
    window.open(`https://wa.me/${OFFICE_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.number.includes(searchTerm);
    
    if (filterParam === 'pendentes') {
      return matchesSearch && ['Aberto', 'Em Negociação'].includes(b.status);
    }
    
    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const getStatusColor = (status: BudgetStatus) => {
    const colors: Record<BudgetStatus, string> = { 'Rascunho': 'bg-slate-100 text-slate-600', 'Aberto': 'bg-blue-100 text-blue-600', 'Em Negociação': 'bg-amber-100 text-amber-600', 'Em Andamento': 'bg-indigo-100 text-indigo-600', 'Aprovado': 'bg-green-100 text-green-700', 'Concluído': 'bg-emerald-100 text-emerald-700', 'Pago': 'bg-purple-100 text-purple-600', 'Recusado': 'bg-red-100 text-red-600' };
    return colors[status];
  };

  const budgetStatuses: BudgetStatus[] = ['Rascunho', 'Aberto', 'Em Negociação', 'Em Andamento', 'Aprovado', 'Concluído', 'Pago', 'Recusado'];

  return (
    <Layout isAdmin={true}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Orçamentos</h2>
          <p className="text-slate-500">Gestão de orçamentos de peças e serviços</p>
        </div>
        <div className="flex gap-2">
          {filterParam && (
            <Button variant="outline" onClick={clearFilters} className="border-amber-200 text-amber-600 hover:bg-amber-50">
              <FilterX className="mr-2" size={18} /> Limpar Filtro
            </Button>
          )}
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) { setEditingBudget(null); setFormData(initialFormData); setEditingItemId(null); } }}>
            <DialogTrigger asChild><Button className="bg-blue-600"><Plus className="mr-2" /> Novo Orçamento</Button></DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle></DialogHeader>
              {!editingBudget && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">Buscar Veículo/Cliente (Digite para filtrar)</label>
                  <Popover open={openSearch} onOpenChange={setOpenSearch}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSearch}
                        className="w-full justify-between bg-white"
                      >
                        {formData.vehiclePlate ? `${formData.vehiclePlate} - ${formData.clientName}` : "PESQUISAR POR PLACA OU NOME..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Digite a placa ou nome..." />
                        <CommandList>
                          <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                          <CommandGroup>
                            {vehicles.map((v) => (
                              <CommandItem
                                key={v.id}
                                value={`${v.plate} ${v.clientName}`}
                                onSelect={() => handleSelectVehicle(v.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.vehiclePlate === v.plate ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="font-bold mr-2">{v.plate}</span>
                                <span className="text-slate-500">{v.clientName}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Data do Orçamento</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Cliente</label>
                  <Input value={formData.clientName} onChange={e => setFormData(prev => ({...prev, clientName: toUpperCase(e.target.value)}))} placeholder="NOME COMPLETO" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone / WhatsApp</label>
                  <Input value={formData.clientPhone} onChange={e => setFormData(prev => ({...prev, clientPhone: maskPhone(e.target.value)}))} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Placa do Veículo</label>
                  <Input 
                    value={formData.vehiclePlate} 
                    onChange={e => setFormData(prev => ({...prev, vehiclePlate: formatPlate(e.target.value)}))} 
                    placeholder="ABC1D23" 
                    maxLength={7}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Quilometragem (KM)</label>
                  <Input 
                    type="text" 
                    inputMode="numeric"
                    value={formData.km === 0 ? '' : formData.km} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({...prev, km: val === '' ? 0 : Number(val)}));
                    }} 
                    placeholder="0" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <User size={14} /> Profissional Responsável
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {professionals.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, professionalId: p.id}))}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-xs font-bold transition-all",
                          formData.professionalId === p.id 
                            ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                        )}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Activity size={14} /> Status do Orçamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {budgetStatuses.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, status: s}))}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-[10px] font-bold transition-all text-center",
                          formData.status === s 
                            ? "bg-slate-800 border-slate-800 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="font-bold mb-4 text-slate-800 flex items-center justify-between">
                  <span>Itens do Orçamento</span>
                  {editingItemId && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                      EDITANDO ITEM
                    </Badge>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 items-end">
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição da Peça/Serviço</label>
                    <Input placeholder="EX: TROCA DE ÓLEO" value={newItem.description} onChange={e => setNewItem({...newItem, description: toUpperCase(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Qtd</label>
                    <Input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="1" 
                      value={newItem.quantity} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewItem({...newItem, quantity: val === '' ? 1 : Number(val)});
                      }} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vlr. Unit</label>
                    <Input placeholder="R$ 0,00" value={newItem.unitValue} onChange={e => setNewItem({...newItem, unitValue: maskCurrency(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                    <div className="flex gap-1">
                      {['Peça', 'Serviço'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewItem({...newItem, type: t as any})}
                          className={cn(
                            "flex-1 py-2 rounded-md border text-[10px] font-bold transition-all",
                            newItem.type === t 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "bg-white border-slate-200 text-slate-600"
                          )}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Button onClick={addItem} className={cn("w-full", editingItemId ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-800")}>
                      {editingItemId ? <Save size={18} /> : <Plus size={18} />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {formData.items?.map(item => (
                    <div key={item.id} className={cn(
                      "flex items-center justify-between p-2 rounded-lg border text-sm transition-colors",
                      editingItemId === item.id ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                        <span className="col-span-6 font-bold truncate">{item.description}</span>
                        <span className="col-span-2 text-slate-500 text-xs">{item.type}</span>
                        <span className="col-span-2 text-center">{item.quantity}x {formatCurrency(item.unitValue)}</span>
                        <span className="col-span-2 text-right font-black text-blue-700">{formatCurrency(item.quantity * item.unitValue)}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => editItem(item)} className="text-blue-600 h-8 w-8">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 h-8 w-8">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-8 border-t pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-blue-600 px-8">Salvar Orçamento</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><Input className="pl-10" placeholder="Buscar por cliente, placa ou número..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>

      {filterParam === 'pendentes' && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
          <p className="text-sm font-bold text-amber-700">Exibindo apenas orçamentos em aberto ou negociação</p>
          <Badge className="bg-amber-500">{filteredBudgets.length} Orçamentos</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredBudgets.map(budget => (
          <Card key={budget.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{budget.number}</span>
                    <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(budget.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{budget.clientName}</h3>
                  <p className="text-sm text-slate-500">{budget.vehiclePlate} • {budget.km} KM</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(budget.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}</p>
                  <div className="flex gap-2">
                    <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => { setEditingBudget(budget); setFormData(budget); setIsModalOpen(true); }}><Edit2 size={18} /></Button></TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleDownloadPDF(budget)}><FileDown size={18} /></Button></TooltipTrigger><TooltipContent>Baixar PDF</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleWhatsAppOffice(budget)} className="text-green-600"><MessageSquare size={18} /></Button></TooltipTrigger><TooltipContent>Enviar para WhatsApp (Oficina)</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => { if(confirm('Excluir?')) setBudgets(budgets.filter(b => b.id !== budget.id)); }} className="text-red-500"><Trash2 size={18} /></Button></TooltipTrigger><TooltipContent>Excluir</TooltipContent></Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Budgets;