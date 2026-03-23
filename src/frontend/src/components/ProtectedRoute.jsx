import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redireciona para o login se não estiver logado
    return <Navigate to="/login" replace />;
  }

  return children;
};
