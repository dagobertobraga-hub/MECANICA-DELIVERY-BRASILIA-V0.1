import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileDown, MessageSquare, Edit2, Trash2, UserCheck, Car } from 'lucide-react';
import { Budget, BudgetItem, BudgetStatus } from '@/lib/types';
import { formatCurrency, toUpperCase } from '@/lib/utils-format';
import { generateBudgetPDF } from '@/lib/pdf-generator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import PDFImportDialog from '@/components/PDFImportDialog';

const Budgets = () => {
  const { budgets, setBudgets, professionals, vehicles } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [formData, setFormData] = useState<Partial<Budget>>({
    clientName: '',
    clientPhone: '',
    vehiclePlate: '',
    km: 0,
    status: 'Rascunho',
    items: [],
    professionalId: ''
  });

  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    description: '',
    quantity: 1,
    unitValue: 0,
    type: 'Peça'
  });

  const calculateTotals = (items: BudgetItem[]) => {
    const parts = items.filter(i => i.type === 'Peça').reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    const services = items.filter(i => i.type === 'Serviço').reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    return { parts, services, total: parts + services };
  };

  const handleSave = () => {
    const totals = calculateTotals(formData.items || []);
    const prof = professionals.find(p => p.id === formData.professionalId);
    const commission = prof ? (totals.services * (prof.commissionRate / 100)) : 0;

    const budgetData = {
      ...formData,
      commissionValue: commission,
      updatedAt: new Date().toISOString()
    };

    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...editingBudget, ...budgetData } as Budget : b));
    } else {
      const newBudget: Budget = {
        id: Math.random().toString(36).substr(2, 9),
        number: (budgets.length + 1).toString().padStart(4, '0'),
        clientName: formData.clientName || '',
        clientPhone: formData.clientPhone || '',
        vehiclePlate: formData.vehiclePlate || '',
        km: formData.km || 0,
        status: formData.status as BudgetStatus,
        items: formData.items || [],
        professionalId: formData.professionalId,
        commissionValue: commission,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBudgets([newBudget, ...budgets]);
    }
    setIsModalOpen(false);
    setEditingBudget(null);
    setFormData({ items: [] });
    showSuccess('Orçamento salvo com sucesso!');
  };

  const handleImportPDF = (data: any) => {
    setFormData({
      ...formData,
      clientName: data.clientName || formData.clientName,
      vehiclePlate: data.vehiclePlate || formData.vehiclePlate,
      km: data.km || formData.km,
      items: data.items && data.items.length > 0 ? data.items : formData.items
    });
    setIsModalOpen(true);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      setFormData({
        ...formData,
        clientName: v.clientName,
        clientPhone: v.clientPhone,
        vehiclePlate: v.plate,
        km: v.currentKm
      });
      showSuccess('Dados do veículo carregados!');
    }
  };

  const addItem = () => {
    if (newItem.description && newItem.unitValue) {
      setFormData({
        ...formData,
        items: [...(formData.items || []), { ...newItem, id: Math.random().toString(36).substr(2, 9) } as BudgetItem]
      });
      setNewItem({ description: '', quantity: 1, unitValue: 0, type: 'Peça' });
    }
  };

  const removeItem = (id: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== id) });
  };

  const handleDownloadPDF = (budget: Budget) => {
    const doc = generateBudgetPDF(budget);
    doc.save(`orcamento_${budget.number}.pdf`);
  };

  const handleWhatsApp = (budget: Budget) => {
    const total = budget.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
    const message = `Olá! Segue o orçamento da Mecânica Delivery Brasília.\n\nOrçamento: ${budget.number}\nVeículo: ${budget.vehiclePlate.toUpperCase()}\nTotal: ${formatCurrency(total)}\nStatus: ${budget.status}\n\nPara ver os detalhes, entre em contato conosco.`;
    window.open(`https://wa.me/55${budget.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredBudgets = budgets.filter(b => 
    b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.number.includes(searchTerm)
  );

  const getStatusColor = (status: BudgetStatus) => {
    const colors: Record<BudgetStatus, string> = {
      'Rascunho': 'bg-slate-100 text-slate-600',
      'Aberto': 'bg-blue-100 text-blue-600',
      'Em Negociação': 'bg-amber-100 text-amber-600',
      'Em Andamento': 'bg-indigo-100 text-indigo-600',
      'Aprovado': 'bg-green-100 text-green-600',
      'Concluído': 'bg-emerald-100 text-emerald-600',
      'Pago': 'bg-purple-100 text-purple-600',
      'Recusado': 'bg-red-100 text-red-600',
    };
    return colors[status];
  };

  return (
    <Layout isAdmin={true}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Orçamentos</h2>
          <p className="text-slate-500">Gestão de orçamentos de peças e serviços</p>
        </div>
        <div className="flex gap-2">
          <PDFImportDialog onImport={handleImportPDF} />
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) { setEditingBudget(null); setFormData({ items: [] }); }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2" size={20} /> Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
              </DialogHeader>
              
              {!editingBudget && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">Buscar Veículo/Cliente Existente</label>
                  <Select onValueChange={handleSelectVehicle}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="PESQUISAR POR PLACA OU NOME..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.plate} - {v.clientName} ({v.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Cliente</label>
                  <Input value={formData.clientName} onChange={e => setFormData({...formData, clientName: toUpperCase(e.target.value)})} placeholder="NOME COMPLETO" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} placeholder="(61) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placa do Veículo</label>
                  <Input value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: toUpperCase(e.target.value)})} placeholder="ABC1D23" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quilometragem</label>
                  <Input type="number" value={formData.km} onChange={e => setFormData({...formData, km: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissional Responsável</label>
                  <Select value={formData.professionalId} onValueChange={v => setFormData({...formData, professionalId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
                    <SelectContent>
                      {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as BudgetStatus})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Rascunho', 'Aberto', 'Em Negociação', 'Em Andamento', 'Aprovado', 'Concluído', 'Pago', 'Recusado'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="font-bold mb-4">Itens do Orçamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição do Item</label>
                    <Input placeholder="EX: TROCA DE ÓLEO" value={newItem.description} onChange={e => setNewItem({...newItem, description: toUpperCase(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Qtd</label>
                    <Input type="number" placeholder="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Unit.</label>
                    <Input type="number" placeholder="0.00" value={newItem.unitValue} onChange={e => setNewItem({...newItem, unitValue: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                      <Select value={newItem.type} onValueChange={v => setNewItem({...newItem, type: v as 'Peça' | 'Serviço'})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Peça">Peça</SelectItem>
                          <SelectItem value="Serviço">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addItem} className="w-full bg-slate-800">Adicionar</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-slate-500">{item.type} | {item.quantity}x {formatCurrency(item.unitValue)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">{formatCurrency(item.quantity * item.unitValue)}</p>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 size={18} /></Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-right">
                  <div className="col-start-2 space-y-1">
                    <p className="text-sm text-slate-500">Peças: {formatCurrency(calculateTotals(formData.items || []).parts)}</p>
                    <p className="text-sm text-slate-500">Serviços: {formatCurrency(calculateTotals(formData.items || []).services)}</p>
                    <p className="text-xl font-bold text-blue-700">Total: {formatCurrency(calculateTotals(formData.items || []).total)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-8">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-blue-600">Salvar Orçamento</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input className="pl-10" placeholder="Buscar por cliente, placa ou número..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBudgets.map((budget) => (
          <Card key={budget.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{budget.number}</span>
                    <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                  </div>
                  <h3 className="text-lg font-bold">{budget.clientName}</h3>
                  <p className="text-sm text-slate-500">{budget.vehiclePlate} • {budget.km} KM</p>
                </div>
                
                <div className="flex flex-col items-end justify-between gap-2">
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(budget.items.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0))}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingBudget(budget); setFormData(budget); setIsModalOpen(true); }}><Edit2 size={18} /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownloadPDF(budget)}><FileDown size={18} /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleWhatsApp(budget)} className="text-green-600"><MessageSquare size={18} /></Button>
                    <Button variant="outline" size="icon" onClick={() => { if(confirm('Deseja excluir este orçamento?')) setBudgets(budgets.filter(b => b.id !== budget.id)); }} className="text-red-500"><Trash2 size={18} /></Button>
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