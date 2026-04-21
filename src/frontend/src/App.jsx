import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Camera, LogIn, Users } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { motion } from 'framer-motion';

// Páginas
import Login from './pages/Login';
import RegisterIndividual from './pages/RegisterIndividual';
import Dashboard from './pages/Dashboard';

const Home = () => (
  <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
    {/* Efeitos de Fundo */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-tertiary/5 blur-3xl rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 blur-[120px] rounded-full" />
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-16 space-y-10 glassmorphism relative z-10 max-w-4xl mx-auto shadow-2xl"
    >
      <div className="p-5 bg-primary/10 rounded-3xl shadow-inner border border-primary/20">
        <Camera className="w-12 h-12 text-primary" />
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight">
          MegaVision <span className="text-secondary/80">Platform</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
          Plataforma inteligente de logística social para o controle de doações com Visão Computacional de ponta.
        </p>
      </div>

      <div className="flex flex-col gap-5 w-full sm:w-auto items-center">
        <Link 
          to="/login" 
          className="group relative px-10 py-5 rounded-2xl bg-primary hover:bg-primary-container text-white transition-all font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transform hover:scale-[1.02] active:scale-[0.98] w-full"
        >
          <LogIn size={22} className="group-hover:translate-x-1 transition-transform" /> 
          Acessar Conta do Professor
        </Link>
      </div>


      <div className="pt-4 flex items-center gap-2 text-sm text-secondary font-semibold uppercase tracking-widest opacity-60">
        <div className="h-px w-8 bg-current" />
        MegaVision - FECAP
        <div className="h-px w-8 bg-current" />
      </div>
    </motion.div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-individual" element={<RegisterIndividual />} />

          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
