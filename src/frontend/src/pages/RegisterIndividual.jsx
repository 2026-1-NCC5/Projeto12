import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterIndividual() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_type: 'individual'
        }
      }
    });

    if (registerError) {
      setError(registerError.message);
      setLoading(false);
    } else {
      // Automaticamente criado, ir para dashboard ou pedir check de e-mail (depende das config de supabase, por padrão pede confirmação)
      // Se tiver confirmação de e-mail ativada, supabase.auth.signUp não loga direto
      navigate('/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glassmorphism p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <User size={32} />
          </div>
          <h2 className="text-4xl font-extrabold text-primary mb-3">Criar Conta</h2>
          <p className="text-on-surface-variant font-medium">EcoFlow Social Logistics Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-600 p-4 rounded-2xl text-sm mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">Nome Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-primary" />
              <input
                type="email"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-primary" />
              <input
                type="password"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-primary hover:bg-primary-container text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/10 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Criar minha conta'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
          <div className="text-on-surface-variant">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Fazer Login
            </Link>
          </div>
          <div className="text-on-surface-variant">
            É uma organização?{' '}
            <Link to="/register-team" className="text-tertiary hover:underline uppercase text-xs tracking-wider font-bold ml-1">
              Cadastrar Equipe
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

