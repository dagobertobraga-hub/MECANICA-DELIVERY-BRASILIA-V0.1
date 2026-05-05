"use client";

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, User, MapPin, CreditCard, Shield, Edit2 } from 'lucide-react';
import { Professional } from '@/lib/types';
import { formatCurrency, toUpperCase } from '@/lib/utils-format';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Professionals = () => {
  const { professionals, setProfessionals, budgets } = useStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '', role: '', commissionRate: 10, permission: 'GRAVAÇÃO',
    cpf: '', rg: '', address: '', city: '', state: '', zipCode: ''
  });

  const handleOpenModal = (prof?: Professional) => {
    if (prof) {
      setEditingProf(prof);
      setFormData(prof);
    } else {
      setEditingProf(null);
      setFormData({
        name: '', role: '', commissionRate: 10, permission: 'GRAVAÇÃO',
        cpf: '', rg: '', address: '', city: '', state: '', zipCode: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (formData.name && formData.role) {
      if (editingProf) {
        setProfessionals(professionals.map(p => p.id === editingProf.id ? { ...editingProf, ...formData } as Professional : p));
        showSuccess('Profissional atualizado!');
      } else {
        const newProf: Professional = {
          id: Math.random().toString(36).substr(2, 9),
          name: toUpperCase(formData.name || ''),
          role: toUpperCase(formData.role || ''),
          commissionRate: formData.commissionRate || 10,
          permission: formData.permission || 'GRAVAÇÃO',
          cpf: formData.cpf,
          rg: formData.rg,
          address: toUpperCase(formData.address || ''),
          city: toUpperCase(formData.city || ''),
          state: toUpperCase(formData.state || ''),
          zipCode: formData.zipCode
        };
        setProfessionals([...professionals, newProf]);
        showSuccess('Profissional cadastrado!');
      }
      setIsModalOpen(false);
    }
  };

  const calculateTotalCommission = (profId: string) => {
    return budgets
      .filter(b => b.professionalId === profId && b.status === 'Pago')
      .reduce((acc, b) => acc + (b.commissionValue || 0), 0);
  };

  const getPermissionBadge = (perm: Professional['permission']) => {
    switch (perm) {
      case 'GRAVAÇÃO': return <Badge className="bg-green-100 text-green-700 border-green-200">GRAVAÇÃO</Badge>;
      case 'LEITURA': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">LEITURA</Badge>;
      case 'SOMENTE CONSULTA': return <Badge className="bg-slate-100 text-slate-700 border-slate-200">CONSULTA</Badge>;
      default: return null;
    }
  };

  return (
    <Layout isAdmin={true}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Profissionais</h2>
          <p className="text-slate-500">Gestão de equipe, permissões e comissões</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600">
          <Plus className="mr-2" /> Novo Profissional
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Total Comissões</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map(p => (
              <TableRow key={p.id} className="group">
                <TableCell>
                  <button 
                    onClick={() => handleOpenModal(p)}
                    className="font-bold text-blue-600 hover:underline text-left"
                  >
                    {p.name}
                  </button>
                </TableCell>
                <TableCell>{p.role}</TableCell>
                <TableCell>{getPermissionBadge(p.permission || 'GRAVAÇÃO')}</TableCell>
                <TableCell>{p.commissionRate}%</TableCell>
                <TableCell className="text-green-600 font-bold">{formatCurrency(calculateTotalCommission(p.id))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                      <Edit2 size={18} className="text-slate-400 group-hover:text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setProfessionals(professionals.filter(x => x.id !== p.id))}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProf ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: toUpperCase(e.target.value)})} placeholder="NOME" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">CPF</label>
              <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">RG (Identidade)</label>
              <Input value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} placeholder="0.000.000" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo</label>
              <Input value={formData.role} onChange={e => setFormData({...formData, role: toUpperCase(e.target.value)})} placeholder="EX: MECÂNICO" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Comissão %</label>
              <Input type="number" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço</label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: toUpperCase(e.target.value)})} placeholder="RUA, NÚMERO, BAIRRO" />
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
              <label className="text-[10px] font-bold text-slate-400 uppercase">Permissão de Acesso</label>
              <Select value={formData.permission} onValueChange={(v: any) => setFormData({...formData, permission: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRAVAÇÃO">GRAVAÇÃO</SelectItem>
                  <SelectItem value="LEITURA">LEITURA</SelectItem>
                  <SelectItem value="SOMENTE CONSULTA">SOMENTE CONSULTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 px-8">Salvar Dados</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Professionals;