import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Camera, LogIn, Users } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import RegisterIndividual from './pages/RegisterIndividual';
import RegisterTeam from './pages/RegisterTeam';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-8 glassmorphism m-4 md:m-8 rounded-3xl">
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 blur-3xl rounded-full" />
    </div>

    <div className="p-4 bg-primary-500/20 rounded-full z-10 shadow-xl shadow-primary-500/10">
      <Camera className="w-16 h-16 text-primary-400" />
    </div>
    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent z-10">
      FoodVision Connect
    </h1>
    <p className="text-xl text-slate-400 max-w-lg z-10">
      Sistema inteligente de controle de doações com de Visão Computacional. Identifique e conte alimentos em tempo real.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 z-10 mt-8">
      <Link to="/login" className="px-8 py-4 rounded-xl bg-surface/50 hover:bg-surface transition-all font-bold border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md text-black transform hover:scale-105">
        <LogIn size={20} /> Acessar Conta
      </Link>
      <Link to="/register-team" className="px-8 py-4 rounded-xl bg-surface/50 hover:bg-surface transition-all font-bold border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md text-black transform hover:scale-105">
        <Users size={20} /> Sou uma Organização
      </Link>
    </div>
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
          <Route path="/register-team" element={<RegisterTeam />} />

          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <Collection />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
