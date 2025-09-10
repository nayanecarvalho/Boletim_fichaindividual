import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, Upload, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const StudentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    sexo: '',
    pai: '',
    mae: '',
    naturalidade: '',
    estado: '',
    nacionalidade: 'Brasileira',
    ano: new Date().getFullYear().toString(),
    anoSerie: '',
    minPromocao: '60%',
    diasLetivos: '200',
    chAnual: '833:20',
    moduloAula: '0:50',
    escola: 'ESCOLA MUNICIPAL JOAQUIM DIAS ALMEIDA',
    endereco: 'AV.JOAQUIM PINHEIRO DE ALMEIDA-126',
    cidade: 'Fronteira Dos vales - Minas Gerais',
    cep: '39870-000'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    if (students.length >= 500) {
        toast({
            title: "Limite de alunos atingido",
            description: "O sistema suporta no máximo 500 alunos. Por favor, remova alguns alunos para adicionar novos.",
            variant: "destructive"
        });
        return;
    }

    if (!formData.nome || !formData.dataNascimento || !formData.anoSerie) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha pelo menos o nome, data de nascimento e ano/série.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    
    toast({
      title: "Sucesso!",
      description: "Dados do aluno salvos com sucesso!"
    });
  };

  const handleFileUpload = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-effect p-8 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <User className="text-blue-600" size={32} />
          <h2 className="text-3xl font-bold gradient-text">Cadastro de Novo Aluno</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <select id="sexo" value={formData.sexo} onChange={(e) => handleInputChange('sexo', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none">
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="mae">Nome da Mãe</Label>
              <Input id="mae" value={formData.mae} onChange={(e) => handleInputChange('mae', e.target.value)} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="pai">Nome do Pai</Label>
              <Input id="pai" value={formData.pai} onChange={(e) => handleInputChange('pai', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nacionalidade">Nacionalidade</Label>
              <Input id="nacionalidade" value={formData.nacionalidade} onChange={(e) => handleInputChange('nacionalidade', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="naturalidade">Naturalidade</Label>
              <Input id="naturalidade" value={formData.naturalidade} onChange={(e) => handleInputChange('naturalidade', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano Letivo</Label>
              <Input id="ano" value={formData.ano} onChange={(e) => handleInputChange('ano', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anoSerie">Ano/Série *</Label>
              <select id="anoSerie" value={formData.anoSerie} onChange={(e) => handleInputChange('anoSerie', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" required>
                <option value="">Selecione</option>
                {[...Array(9)].map((_, i) => <option key={i+1} value={`${i+1}º ano`}>{`${i+1}º ano`}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Opções de Preenchimento</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="button" onClick={handleFileUpload} variant="outline" className="flex items-center space-x-2 hover:bg-blue-50">
                <Upload size={20} />
                <span>Importar de Planilha/PDF</span>
              </Button>
              <Button type="submit" className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Save size={20} />
                <span>Salvar Novo Aluno</span>
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default StudentForm;