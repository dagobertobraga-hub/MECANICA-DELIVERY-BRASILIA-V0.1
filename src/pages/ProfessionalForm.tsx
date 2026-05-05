"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useStorage } from '@/hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, MapPin, CreditCard, Shield } from 'lucide-react';
import { Professional } from '@/lib/types';
import { toUpperCase } from '@/lib/utils-format';
import { showSuccess, showError } from '@/utils/toast';

const ProfessionalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { professionals, setProfessionals } = useStorage();
  
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '', role: '', commissionRate: 10, permission: 'GRAVAÇÃO',
    cpf: '', rg: '', address: '', city: '', state: '', zipCode: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      const prof = professionals.find(p => p.id === id);
      if (prof) {
        setFormData(prof);
      } else {
        showError('Profissional não encontrado.');
        navigate('/professionals');
      }
    }
  }, [id, professionals, navigate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      showError('Nome e Cargo são obrigatórios.');
      return;
    }

    if (id === 'new') {
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
      showSuccess('Profissional cadastrado com sucesso!');
    } else {
      setProfessionals(professionals.map(p => p.id === id ? { ...p, ...formData } as Professional : p));
      showSuccess('Dados atualizados com sucesso!');
    }
    navigate('/professionals');
  };

  return (
    <Layout isAdmin={true}>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/professionals')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            {id === 'new' ? 'Novo Profissional' : 'Editar Profissional'}
          </h2>
          <p className="text-slate-500">Preencha as informações detalhadas da equipe</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 uppercase">
                  <User size={18} /> Dados Identificadores
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: toUpperCase(e.target.value)})} 
                    placeholder="NOME COMPLETO"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CPF</label>
                  <Input 
                    value={formData.cpf} 
                    onChange={e => setFormData({...formData, cpf: e.target.value})} 
                    placeholder="000.000.000-00" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">RG (Identidade)</label>
                  <Input 
                    value={formData.rg} 
                    onChange={e => setFormData({...formData, rg: e.target.value})} 
                    placeholder="0.000.000" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 uppercase">
                  <MapPin size={18} /> Localização e Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço Residencial</label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: toUpperCase(e.target.value)})} 
                    placeholder="RUA, NÚMERO, BAIRRO" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade</label>
                  <Input 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: toUpperCase(e.target.value)})} 
                    placeholder="CIDADE" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estado (UF)</label>
                    <Input 
                      value={formData.state} 
                      onChange={e => setFormData({...formData, state: toUpperCase(e.target.value)})} 
                      placeholder="DF" 
                      maxLength={2} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">CEP</label>
                    <Input 
                      value={formData.zipCode} 
                      onChange={e => setFormData({...formData, zipCode: e.target.value})} 
                      placeholder="00000-000" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 uppercase">
                  <Shield size={18} /> Configurações de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo / Função</label>
                  <Input 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: toUpperCase(e.target.value)})} 
                    placeholder="EX: MECÂNICO MASTER"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Comissão (%)</label>
                  <Input 
                    type="number" 
                    value={formData.commissionRate} 
                    onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nível de Permissão</label>
                  <Select 
                    value={formData.permission} 
                    onValueChange={(v: any) => setFormData({...formData, permission: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRAVAÇÃO">GRAVAÇÃO (TOTAL)</SelectItem>
                      <SelectItem value="LEITURA">LEITURA (EDIÇÃO)</SelectItem>
                      <SelectItem value="SOMENTE CONSULTA">SOMENTE CONSULTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full bg-blue-600 h-12 font-bold text-lg">
                <Save className="mr-2" /> Salvar Profissional
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-slate-500"
                onClick={() => navigate('/professionals')}
              >
                Cancelar e Voltar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default ProfessionalForm;