import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-tertiary/5 blur-3xl rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glassmorphism p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-primary mb-3">Bem-vindo</h2>
          <p className="text-on-surface-variant font-medium">MegaVision - FECAP</p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-600 p-4 rounded-2xl text-sm mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-primary" />
              <input
                type="password"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-primary hover:bg-primary-container text-white py-4 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-primary/10 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-10 text-center text-sm font-medium text-on-surface-variant">
          Não tem uma conta?{' '}
          <Link to="/register-individual" className="text-primary hover:underline transition-all">
            Cadastre-se aqui
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

