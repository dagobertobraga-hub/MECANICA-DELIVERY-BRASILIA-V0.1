import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, UserCheck, DollarSign } from 'lucide-react';
import { Professional } from '@/lib/types';
import { formatCurrency } from '@/lib/utils-format';
import { showSuccess } from '@/utils/toast';

const Professionals = () => {
  const { professionals, setProfessionals, budgets } = useStorage();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rate, setRate] = useState(10);

  const handleAdd = () => {
    if (name && role) {
      const newProf: Professional = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.toUpperCase(),
        role: role.toUpperCase(),
        commissionRate: rate
      };
      setProfessionals([...professionals, newProf]);
      setName(''); setRole('');
      showSuccess('Profissional cadastrado!');
    }
  };

  const calculateTotalCommission = (profId: string) => {
    return budgets
      .filter(b => b.professionalId === profId && b.status === 'Pago')
      .reduce((acc, b) => acc + (b.commissionValue || 0), 0);
  };

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Profissionais</h2>
        <p className="text-slate-500">Gestão de equipe e comissões de serviços</p>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle className="text-lg">Novo Profissional</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="NOME" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="CARGO" value={role} onChange={e => setRole(e.target.value)} />
          <div className="flex items-center gap-2">
            <Input type="number" placeholder="COMISSÃO %" value={rate} onChange={e => setRate(Number(e.target.value))} />
            <span className="font-bold text-slate-400">%</span>
          </div>
          <Button onClick={handleAdd} className="bg-blue-600"><Plus className="mr-2" /> Adicionar</Button>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Total Comissões (Pagos)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-bold">{p.name}</TableCell>
                <TableCell>{p.role}</TableCell>
                <TableCell>{p.commissionRate}%</TableCell>
                <TableCell className="text-green-600 font-bold">{formatCurrency(calculateTotalCommission(p.id))}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setProfessionals(professionals.filter(x => x.id !== p.id))}>
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Layout>
  );
};

export default Professionals;