import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Package, Scale, BarChart3, Download, Filter, Calendar, FileText, FileSpreadsheet, RefreshCcw, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  
  const [teams, setTeams] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  
  // Filtros
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTeams(), fetchAllDonations()]);
    } catch (err) {
      toast.error("Erro ao carregar dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase.from('teams').select('*').order('name');
    if (error) throw error;
    setTeams(data || []);
  };

  const fetchAllDonations = async () => {
    const { data, error } = await supabase.from('donations').select('*, teams(name)');
    if (error) throw error;
    setAllDonations(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Lógica de Filtragem
  const filteredDonations = allDonations.filter(donation => {
    const matchesTeam = selectedTeamId === 'all' || donation.team_id.toString() === selectedTeamId;
    
    const donationDate = new Date(donation.created_at);
    const matchesStartDate = !startDate || donationDate >= new Date(startDate + 'T00:00:00');
    const matchesEndDate = !endDate || donationDate <= new Date(endDate + 'T23:59:59');
    
    return matchesTeam && matchesStartDate && matchesEndDate;
  });

  // Cálculo de Métricas
  const metrics = (() => {
    const totalItems = filteredDonations.reduce((sum, d) => sum + d.quantity, 0);
    const totalWeight = filteredDonations.reduce((sum, d) => sum + Number(d.weight_kg), 0).toFixed(2);
    
    const itemMap = {};
    filteredDonations.forEach(d => {
      itemMap[d.item_type] = (itemMap[d.item_type] || 0) + d.quantity;
    });
    
    const chartData = Object.keys(itemMap).map(key => ({
      name: key,
      quantidade: itemMap[key]
    }));

    return { totalItems, totalWeight, chartData };
  })();

  // Exportação CSV
  const exportCSV = () => {
    setExportingCSV(true);
    const toastId = toast.loading('Preparando seu arquivo CSV...');
    
    try {
      const headers = ['Equipe', 'Item', 'Quantidade', 'Peso (kg)', 'Data'];
      const rows = filteredDonations.map(d => [
        `"${d.teams?.name || 'N/A'}"`,
        `"${d.item_type}"`,
        d.quantity,
        d.weight_kg,
        new Date(d.created_at).toLocaleDateString('pt-BR')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_dashboard_${new Date().getTime()}.csv`;
      link.click();
      
      toast.success('CSV baixado com sucesso!', { id: toastId });
    } catch (err) {
      toast.error('Falha ao gerar CSV.', { id: toastId });
    } finally {
      setExportingCSV(false);
    }
  };

  // Exportação PDF (Capture com html-to-image)
  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    setExportingPDF(true);
    const toastId = toast.loading('Gerando relatório em PDF...');
    
    try {
      // html-to-image é muito mais robusto com CSS moderno (Tailwind 4) e SVGs
      const dataUrl = await toPng(dashboardRef.current, {
        quality: 0.95,
        backgroundColor: '#f8fafc',
        cacheBust: true,
        pixelRatio: 2
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calcular altura proporcional baseada na imagem gerada
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio_dashboard_${new Date().getTime()}.pdf`);
      
      toast.success('Relatório PDF baixado com sucesso!', { id: toastId });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: toastId });
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-low">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-primary font-bold text-lg">Carregando dados do painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-surface-low overflow-x-hidden">
      {/* Header Fixo (Não incluído no PDF para economizar espaço ou estilizado diferente) */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Dashboard Geral
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">MegaVision - FECAP | <span className="text-secondary">{user?.email}</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="p-3 bg-white text-on-surface-variant hover:text-primary rounded-xl transition-all shadow-sm border border-outline-variant"
            title="Atualizar Dados"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all font-bold border-none shadow-sm"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      {/* Barra de Filtros e Ações */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 border border-outline-variant">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Filtro de Equipe */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Users size={16} /> Equipe
            </label>
            <select 
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full p-3 bg-surface-low rounded-xl border border-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            >
              <option value="all">Todas as Equipes</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro Data Início */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Calendar size={16} /> Data Inicial
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-surface-low rounded-xl border border-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>

          {/* Filtro Data Fim */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Calendar size={16} /> Data Final
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-surface-low rounded-xl border border-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>

          {/* Botões de Exportação */}
          <div className="flex gap-3">
            <button 
              onClick={exportPDF}
              disabled={exportingPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingPDF ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {exportingPDF ? 'Gerando...' : 'PDF'}
            </button>
            <button 
              onClick={exportCSV}
              disabled={exportingCSV}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingCSV ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
              {exportingCSV ? 'Baixando...' : 'CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Capturável para o PDF */}
      <div ref={dashboardRef} className="space-y-8 p-2">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Filter size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface">
              {selectedTeamId === 'all' ? 'Visão Consolidada' : teams.find(t => t.id.toString() === selectedTeamId)?.name}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {startDate || endDate ? `Filtrado de ${startDate || 'início'} até ${endDate || 'hoje'}` : 'Exibindo dados de todo o período'}
            </p>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="section-card flex flex-col justify-between items-start h-48 group hover:ring-1 hover:ring-primary/20 transition-all border-l-4 border-l-primary bg-white shadow-sm">
            <div className="flex items-center gap-3 text-primary mb-4 font-bold">
              <div className="p-2 bg-primary/10 rounded-lg"><Package size={24} /></div>
              <span>Total de Itens</span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl font-extrabold text-on-surface">{metrics.totalItems}</span>
              <span className="text-on-surface-variant font-medium text-sm mt-1 uppercase tracking-wider">Unidades Coletadas</span>
            </div>
          </div>

          <div className="section-card flex flex-col justify-between items-start h-48 group hover:ring-1 hover:ring-secondary/20 transition-all border-l-4 border-l-secondary bg-white shadow-sm">
            <div className="flex items-center gap-3 text-secondary mb-4 font-bold">
              <div className="p-2 bg-secondary/10 rounded-lg"><Scale size={24} /></div>
              <span>Massa Total Estimada</span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl font-extrabold text-on-surface">{metrics.totalWeight} <span className="text-2xl text-on-surface-variant">Kg</span></span>
              <span className="text-on-surface-variant font-medium text-sm mt-1 uppercase tracking-wider">Peso total doado</span>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="section-card bg-white shadow-sm">
           <div className="flex items-center gap-3 text-primary mb-8 font-bold">
              <div className="p-2 bg-primary/10 rounded-lg"><BarChart3 size={24} /></div>
              <h3 className="text-xl">Distribuição por Categoria de Alimento</h3>
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
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant italic py-10">
                Nenhum dado encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
