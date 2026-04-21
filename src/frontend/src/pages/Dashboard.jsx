import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Package, Scale, ArrowLeft, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchDonations(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('teams').select('*').order('name');
    if (error) console.error("Erro ao carregar equipes:", error);
    setTeams(data || []);
    setLoading(false);
  };

  const fetchDonations = async (teamId) => {
    const { data, error } = await supabase.from('donations').select('*').eq('team_id', teamId);
    if (error) console.error("Erro ao carregar doações:", error);
    setDonations(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const metrics = selectedTeam ? (() => {
    const totalItems = donations.reduce((sum, d) => sum + d.quantity, 0);
    const totalWeight = donations.reduce((sum, d) => sum + Number(d.weight_kg), 0).toFixed(2);
    
    const itemMap = {};
    donations.forEach(d => {
      itemMap[d.item_type] = (itemMap[d.item_type] || 0) + d.quantity;
    });
    
    const chartData = Object.keys(itemMap).map(key => ({
      name: key,
      quantidade: itemMap[key]
    }));

    return { totalItems, totalWeight, chartData };
  })() : null;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-surface-low">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Painel do Professor
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">MegaVision - FECAP | <span className="text-secondary">{user?.email}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all font-bold border-none"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </header>

      {!selectedTeam ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-secondary font-bold text-xl ml-2">
            <Users size={24} />
            <h2>Selecione uma Equipe para visualizar o progresso</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="section-card flex flex-col items-center justify-center p-6 gap-3 group hover:ring-2 hover:ring-primary/40 hover:bg-primary/5 transition-all text-center cursor-pointer min-h-[120px]"
                >
                  <span className="font-bold text-on-surface text-lg group-hover:scale-105 transition-transform">{team.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => { setSelectedTeam(null); setDonations([]); }}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Voltar para lista de equipes
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl">
              <Users size={32} />
            </div>
            <h2 className="text-4xl font-extrabold text-on-surface">{selectedTeam.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="section-card flex flex-col justify-between items-start h-48 group hover:ring-1 hover:ring-primary/20 transition-all border-l-4 border-l-primary">
              <div className="flex items-center gap-3 text-primary mb-4 font-bold">
                <div className="p-2 bg-primary/10 rounded-lg"><Package size={24} /></div>
                <span>Itens Coletados</span>
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-extrabold text-on-surface">{metrics.totalItems}</span>
                <span className="text-on-surface-variant font-medium text-sm mt-1 uppercase tracking-wider">Unidades</span>
              </div>
            </div>

            <div className="section-card flex flex-col justify-between items-start h-48 group hover:ring-1 hover:ring-secondary/20 transition-all border-l-4 border-l-secondary">
              <div className="flex items-center gap-3 text-secondary mb-4 font-bold">
                <div className="p-2 bg-secondary/10 rounded-lg"><Scale size={24} /></div>
                <span>Peso Total Estimado</span>
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-extrabold text-on-surface">{metrics.totalWeight} <span className="text-2xl text-on-surface-variant">Kg</span></span>
                <span className="text-on-surface-variant font-medium text-sm mt-1 uppercase tracking-wider">Baseado nos pacotes identificados</span>
              </div>
            </div>
          </div>

          <div className="section-card">
             <div className="flex items-center gap-3 text-primary mb-8 font-bold">
                <div className="p-2 bg-primary/10 rounded-lg"><BarChart3 size={24} /></div>
                <h3 className="text-xl">Distribuição por Tipo de Alimento</h3>
              </div>
            
            <div className="h-80 w-full">
              {metrics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#717a6d" fontSize={14} tickLine={false} axisLine={false} />
                    <YAxis stroke="#717a6d" fontSize={14} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,69,13,0.05)'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {metrics.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00450d' : '#4c616c'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant italic">
                  Nenhuma doação registrada para esta equipe ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
