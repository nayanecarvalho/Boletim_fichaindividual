import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, ClipboardList } from 'lucide-react';

const Navigation = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'list', label: 'Lista de Alunos', icon: Users },
    { id: 'form', label: 'Novo Aluno', icon: UserPlus },
    { id: 'record', label: 'Ficha Individual', icon: FileText },
    { id: 'report', label: 'Boletim Escolar', icon: ClipboardList }
  ];

  return (
    <motion.nav 
      className="flex justify-center flex-wrap gap-4 mb-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setCurrentView(item.id)}
              variant={currentView === item.id ? 'default' : 'outline'}
              className={`flex items-center space-x-2 px-6 py-3 ${
                currentView === item.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </motion.nav>
  );
};

export default Navigation;