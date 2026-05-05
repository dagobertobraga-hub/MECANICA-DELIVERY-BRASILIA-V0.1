import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit2, UserPlus, MapPin, Phone, CreditCard } from 'lucide-react';
import { Client } from '@/lib/types';
import { toUpperCase, maskPhone } from '@/lib/utils-format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess } from '@/utils/toast';

const Clients = () => {
  const { clients, setClients } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '', phone: '', document: '', address: '', complement: '', neighborhood: '', city: '', state: '', zipCode: ''
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

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
          <DialogContent className="max-w-2xl">
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
            <Button onClick={handleSave} className="w-full bg-blue-600 mt-6 h-12 font-bold">Salvar Cliente</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input className="pl-10" placeholder="Buscar por nome ou documento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{client.name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {client.phone}</span>
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
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
    </Layout>
  );
};

export default Clients;