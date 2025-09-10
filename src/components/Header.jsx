import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ onLogout }) => {
  return (
    <motion.header 
      className="school-header py-6 shadow-2xl"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap size={40} className="text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-bold">Sistema Escolar</h1>
            <p className="text-blue-100 text-md">Gestão de Fichas e Boletins</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
                <FileText size={20} className="text-blue-200" />
                <Users size={20} className="text-blue-200" />
            </div>
            <Button onClick={onLogout} variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;