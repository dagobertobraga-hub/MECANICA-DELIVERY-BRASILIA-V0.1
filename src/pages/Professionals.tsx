"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, UserCheck } from 'lucide-react';
import { Professional } from '@/lib/types';
import { formatCurrency } from '@/lib/utils-format';
import { Badge } from '@/components/ui/badge';

const Professionals = () => {
  const { professionals, setProfessionals, budgets } = useStorage();
  const navigate = useNavigate();

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
        <Button onClick={() => navigate('/professionals/new')} className="bg-blue-600">
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
            {professionals.length > 0 ? professionals.map(p => (
              <TableRow key={p.id} className="group hover:bg-slate-50 transition-colors">
                <TableCell>
                  <button 
                    onClick={() => navigate(`/professionals/${p.id}`)}
                    className="font-bold text-blue-600 hover:underline text-left flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <UserCheck size={14} />
                    </div>
                    {p.name}
                  </button>
                </TableCell>
                <TableCell>{p.role}</TableCell>
                <TableCell>{getPermissionBadge(p.permission || 'GRAVAÇÃO')}</TableCell>
                <TableCell>{p.commissionRate}%</TableCell>
                <TableCell className="text-green-600 font-bold">{formatCurrency(calculateTotalCommission(p.id))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/professionals/${p.id}`)}>
                      <Edit2 size={18} className="text-slate-400 group-hover:text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                      if(confirm('Deseja realmente excluir este profissional?')) {
                        setProfessionals(professionals.filter(x => x.id !== p.id));
                      }
                    }}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  Nenhum profissional cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Layout>
  );
};

export default Professionals;