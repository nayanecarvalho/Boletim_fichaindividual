import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Search } from 'lucide-react';

const StudentList = ({ students, onSelectStudent, setCurrentView }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glass-effect p-6 max-w-6xl mx-auto">
                <CardHeader className="p-0 mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <Users className="text-blue-600" size={32} />
                            <CardTitle className="gradient-text text-3xl">Lista de Alunos ({students.length}/500)</CardTitle>
                        </div>
                        <Button onClick={() => setCurrentView('form')} className="flex items-center space-x-2">
                            <UserPlus size={20} />
                            <span>Adicionar Novo Aluno</span>
                        </Button>
                    </div>
                    <div className="mt-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Pesquisar aluno por nome..."
                            className="pl-10 w-full md:w-1/2 lg:w-1/3"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="table-header">
                                    <th className="p-4 font-semibold">Nome</th>
                                    <th className="p-4 font-semibold hidden sm:table-cell">Ano/Série</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Data de Nascimento</th>
                                    <th className="p-4 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, index) => (
                                        <motion.tr
                                            key={student.id}
                                            className="border-b border-gray-200/50 hover:bg-blue-50/50"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="p-4 font-medium">{student.nome}</td>
                                            <td className="p-4 hidden sm:table-cell">{student.anoSerie}</td>
                                            <td className="p-4 hidden md:table-cell">{new Date(student.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => onSelectStudent(student)}>
                                                    Ver Ficha
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-8 text-gray-500">
                                            {students.length === 0 ? "Nenhum aluno cadastrado ainda." : "Nenhum aluno encontrado com este nome."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StudentList;