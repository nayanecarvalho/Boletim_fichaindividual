import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { GraduationCap, LogIn } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Helmet } from 'react-helmet';

const Login = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'Nayane Carvalho' && password === 'Admin') {
      onLogin();
    } else {
      toast({
        title: "Erro de Autenticação",
        description: "Login ou senha incorretos. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Sistema Escolar</title>
        <meta name="description" content="Página de login para o sistema escolar." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md glass-effect">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <GraduationCap className="w-16 h-16 text-blue-600" />
              </motion.div>
              <CardTitle className="text-3xl font-bold gradient-text">
                Sistema Escolar
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="Digite seu login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
        <Toaster />
      </div>
    </>
  );
};

export default Login;