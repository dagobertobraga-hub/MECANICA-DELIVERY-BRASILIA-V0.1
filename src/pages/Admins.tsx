import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, User, Shield } from 'lucide-react';
import { Admin } from '@/lib/types';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const Admins = () => {
  const { admins, setAdmins } = useStorage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Admin['permission']>('EDITOR');

  const handleAdd = () => {
    if (name && email) {
      const newAdmin: Admin = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.toUpperCase(),
        email,
        permission
      };
      setAdmins([...admins, newAdmin]);
      setName('');
      setEmail('');
      setPermission('EDITOR');
      showSuccess('Administrador adicionado!');
    }
  };

  const getPermissionColor = (perm: Admin['permission']) => {
    switch (perm) {
      case 'MASTER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EDITOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'VISUALIZADOR': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return '';
    }
  };

  return (
    <Layout isAdmin={true}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Administradores</h2>
        <p className="text-slate-500">Gerencie quem tem acesso ao painel administrativo e seus níveis de permissão</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome</label>
              <Input placeholder="NOME" value={name} onChange={e => setName(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
              <Input placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Permissão</label>
              <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASTER">MASTER</SelectItem>
                  <SelectItem value="EDITOR">EDITOR</SelectItem>
                  <SelectItem value="VISUALIZADOR">VISUALIZADOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="bg-blue-600 h-10">
              <Plus className="mr-2" size={20} /> Adicionar
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
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{admin.name}</p>
                    <Badge variant="outline" className={getPermissionColor(admin.permission)}>
                      {admin.permission}
                    </Badge>
                  </div>
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