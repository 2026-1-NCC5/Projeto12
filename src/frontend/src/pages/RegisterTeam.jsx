import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Building, Users, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterTeam() {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Cria a conta do gestor que vai ser o proprietário da equipe
    const { data, error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          team_name: teamName,
          user_type: 'team_leader'
        }
      }
    });

    if (registerError) {
      setError(registerError.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-tertiary/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glassmorphism p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6 text-tertiary">
            <Building size={32} />
          </div>
          <h2 className="text-4xl font-extrabold text-tertiary mb-3">Conta de Equipe</h2>
          <p className="text-on-surface-variant font-medium">Cadastre sua instituição ou grupo</p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-600 p-4 rounded-2xl text-sm mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">Instituição / Equipe</label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-tertiary" />
              <input
                type="text"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="Associação Beneficente"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">E-mail do Gestor</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-tertiary" />
              <input
                type="email"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="gestor@instituicao.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-on-surface-variant ml-1">Senha Segura</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary transition-colors group-focus-within:text-tertiary" />
              <input
                type="password"
                required
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary/20 transition-all placeholder-secondary/50 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-tertiary hover:bg-tertiary/90 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-tertiary/10 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Registrar Equipe'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-10 text-center text-sm font-medium text-on-surface-variant">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline transition-all">
            Fazer Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

