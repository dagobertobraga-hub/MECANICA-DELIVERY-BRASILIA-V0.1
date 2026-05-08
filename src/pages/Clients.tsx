import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit2, UserPlus, MapPin, Phone, CreditCard, Eye, Car, FileText, Calendar, TrendingUp, Mail } from 'lucide-react';
import { Client } from '@/lib/types';
import { toUpperCase, maskPhone, formatCurrency } from '@/lib/utils-format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Clients = () => {
  const { clients, setClients, vehicles, budgets } = useStorage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '', phone: '', email: '', document: '', address: '', complement: '', neighborhood: '', city: '', state: '', zipCode: ''
  });

  const handleSave = () => {
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...editingClient, ...formData } as Client : c));
      showSuccess('Cliente atualizado!');
    } else {
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        name: toUpperCase(formData.name || ''),
        phone: formData.phone || '',
        email: formData.email?.toLowerCase() || '',
        document: formData.document || '',
        address: toUpperCase(formData.address || ''),
        complement: toUpperCase(formData.complement || ''),
        neighborhood: toUpperCase(formData.neighborhood || ''),
        city: toUpperCase(formData.city || ''),
        state: toUpperCase(formData.state || ''),
        zipCode: formData.zipCode || '',
        createdAt: new Date().toISOString()
      };
      setClients([newClient, ...clients]);
      showSuccess('Cliente cadastrado!');
    }
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({});
  };

  const handleAddVehicle = (client: Client) => {
    const params = new URLSearchParams();
    params.set('action', 'new');
    params.set('clientName', client.name);
    params.set('clientPhone', client.phone);
    navigate(`/vehicles?${params.toString()}`);
  };

  const handleAddBudget = (client: Client) => {
    const params = new URLSearchParams();
    params.set('action', 'new');
    params.set('clientName', client.name);
    params.set('clientPhone', client.phone);
    navigate(`/budgets?${params.toString()}`);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientStats = (clientName: string) => {
    const clientVehicles = vehicles.filter(v => v.clientName === clientName);
    const clientBudgets = budgets.filter(b => b.clientName === clientName);
    const totalSpent = clientBudgets.filter(b => b.status === 'Pago').reduce((acc, b) => 
      acc + b.items.reduce((sum, i) => sum + (i.quantity * i.unitValue), 0), 0
    );
    return { vehicles: clientVehicles, budgets: clientBudgets, totalSpent };
  };

  return (
    <Layout isAdmin={true}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Clientes</h2>
          <p className="text-slate-500">Gestão completa da base de clientes</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) { setEditingClient(null); setFormData({}); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600"><UserPlus className="mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: toUpperCase(e.target.value)})} placeholder="NOME DO CLIENTE" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone / WhatsApp</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="exemplo@email.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">CPF / CNPJ</label>
                <Input value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço</label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: toUpperCase(e.target.value)})} placeholder="RUA, NÚMERO, LOTE" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Complemento</label>
                <Input value={formData.complement} onChange={e => setFormData({...formData, complement: toUpperCase(e.target.value)})} placeholder="APTO, BLOCO, ETC" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Bairro</label>
                <Input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: toUpperCase(e.target.value)})} placeholder="BAIRRO" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade</label>
                <Input value={formData.city} onChange={e => setFormData({...formData, city: toUpperCase(e.target.value)})} placeholder="CIDADE" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Estado (UF)</label>
                <Input value={formData.state} onChange={e => setFormData({...formData, state: toUpperCase(e.target.value)})} placeholder="DF" maxLength={2} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">CEP</label>
                <Input value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} placeholder="00000-000" />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-blue-600 mt-6 h-12 font-bold sticky bottom-0 shadow-lg">Salvar Cliente</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input className="pl-10" placeholder="Buscar por nome, documento ou e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setViewingClient(client); setIsViewModalOpen(true); }}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{client.name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {client.phone}</span>
                    {client.email && <span className="text-[10px] text-blue-500 flex items-center gap-1"><Mail size={10} /> {client.email}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono flex items-center gap-1"><CreditCard size={10} /> {client.document}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {client.address}</span>
                    <span>{client.city} - {client.state}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleAddBudget(client)}>
                          <FileText size={16} className="text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Novo Orçamento</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleAddVehicle(client)}>
                          <Car size={16} className="text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cadastrar Veículo</TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="icon" onClick={() => { setViewingClient(client); setIsViewModalOpen(true); }}>
                      <Eye size={16} className="text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setFormData(client); setIsModalOpen(true); }}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if(confirm('Excluir cliente?')) setClients(clients.filter(c => c.id !== client.id)); }}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Visualização Detalhada */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-blue-700 tracking-tighter uppercase">
                  {viewingClient.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 space-y-6">
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <UserPlus size={14} /> Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Documento</p>
                        <p className="font-bold text-slate-700">{viewingClient.document || 'NÃO INFORMADO'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                        <p className="font-bold text-slate-700">{viewingClient.phone || 'NÃO INFORMADO'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                        <p className="font-bold text-slate-700">{viewingClient.email || 'NÃO INFORMADO'}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <MapPin size={14} /> Endereço Completo
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Logradouro</p>
                        <p className="font-bold text-slate-700">{viewingClient.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Complemento</p>
                          <p className="font-bold text-slate-700">{viewingClient.complement || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Bairro</p>
                          <p className="font-bold text-slate-700">{viewingClient.neighborhood || '-'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Cidade</p>
                          <p className="font-bold text-slate-700">{viewingClient.city}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                          <p className="font-bold text-slate-700">{viewingClient.state}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">CEP</p>
                          <p className="font-bold text-slate-700">{viewingClient.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <TrendingUp size={14} /> Resumo de Atividade
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const stats = getClientStats(viewingClient.name);
                        return (
                          <>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <p className="text-[10px] font-bold text-blue-600 uppercase">Total Investido</p>
                              <p className="text-xl font-black text-blue-700">{formatCurrency(stats.totalSpent)}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Veículos Cadastrados</p>
                              <p className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <Car size={16} /> {stats.vehicles.length}
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Total de Orçamentos</p>
                              <p className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <FileText size={16} /> {stats.budgets.length}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Calendar size={14} /> Cadastro
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cliente desde: <span className="font-bold">{new Date(viewingClient.createdAt).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </section>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Fechar</Button>
                <Button className="bg-blue-600" onClick={() => handleAddBudget(viewingClient)}>
                  <FileText size={16} className="mr-2" /> Novo Orçamento
                </Button>
                <Button className="bg-green-600" onClick={() => handleAddVehicle(viewingClient)}>
                  <Car size={16} className="mr-2" /> Cadastrar Veículo
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600" onClick={() => { 
                  setIsViewModalOpen(false); 
                  setEditingClient(viewingClient); 
                  setFormData(viewingClient); 
                  setIsModalOpen(true); 
                }}>
                  <Edit2 size={16} className="mr-2" /> Editar Dados
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Clients;