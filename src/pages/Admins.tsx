import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, User } from 'lucide-react';
import { Admin } from '@/lib/types';
import { showSuccess } from '@/utils/toast';

const Admins = () => {
  const { admins, setAdmins } = useStorage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (name && email) {
      const newAdmin: Admin = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email
      };
      setAdmins([...admins, newAdmin]);
      setName('');
      setEmail('');
      showSuccess('Administrador adicionado!');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Administradores</h2>
        <p className="text-slate-500">Gerencie quem tem acesso ao painel administrativo</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="NOME" value={name} onChange={e => setName(e.target.value.toUpperCase())} />
            <Input placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
            <Button onClick={handleAdd} className="bg-blue-600">
              <Plus className="mr-2" size={20} /> Adicionar Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map(admin => (
          <Card key={admin.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold">{admin.name}</p>
                  <p className="text-sm text-slate-500">{admin.email}</p>
                </div>
              </div>
              {admin.id !== '1' && (
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setAdmins(admins.filter(a => a.id !== admin.id))}>
                  <Trash2 size={18} />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Admins;