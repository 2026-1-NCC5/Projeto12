import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-10 bg-surface-low">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-extrabold text-primary mb-2">
            Dashboard
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">Bem-vindo(a), <span className="text-secondary">{user?.email}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all font-bold border-none"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="section-card flex flex-col justify-between items-start h-56 group hover:ring-2 hover:ring-primary/5 transition-all">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 font-bold">
            01
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-semibold text-sm mb-1 uppercase tracking-wider">Total Doado (Kg)</span>
            <span className="text-6xl font-extrabold text-primary">0.0</span>
          </div>
        </div>

        <div className="section-card flex flex-col justify-between items-start h-56 group hover:ring-2 hover:ring-secondary/5 transition-all">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4 font-bold">
            02
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant font-semibold text-sm mb-1 uppercase tracking-wider">Itens Contados</span>
            <span className="text-6xl font-extrabold text-secondary">0</span>
          </div>
        </div>

        <div className="section-card flex flex-col justify-between items-start h-56 bg-gradient-to-br from-tertiary to-tertiary/90 text-white h-56 shadow-lg shadow-tertiary/20">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4 font-bold">
            03
          </div>
          <div className="flex flex-col">
            <span className="text-white/70 font-semibold text-sm mb-1 uppercase tracking-wider">Sessões de Coleta</span>
            <span className="text-6xl font-extrabold">0</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex justify-start">
        <button 
          onClick={() => navigate('/collection')}
          className="px-10 py-5 bg-primary hover:bg-primary-container rounded-2xl font-black text-white shadow-2xl shadow-primary/10 transition-all w-full md:w-auto transform hover:-translate-y-1"
        >
          Iniciar Nova Coleta Automática
        </button>
      </div>
    </div>
  );
}

