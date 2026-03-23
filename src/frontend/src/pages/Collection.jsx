import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera as CameraIcon } from 'lucide-react';

export default function Collection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col bg-background">
      <header className="flex items-center gap-6 mb-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-4 bg-surface-lowest hover:bg-surface-low rounded-2xl transition-all text-primary shadow-sm active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-extrabold text-primary">Captura de Doações (IA)</h1>
      </header>

      <div className="flex-1 bg-surface-low rounded-[40px] border-4 border-surface-lowest flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {/* Placeholder para a Câmera */}
        <div className="flex flex-col items-center text-on-surface-variant z-10 p-8 text-center max-w-sm">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <CameraIcon size={48} className="text-primary opacity-40 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-primary mb-2">Câmera offline</p>
          <p className="text-on-surface-variant font-medium opacity-80 leading-relaxed font-inter">
            A integração com WebSockets e pipeline de Visão Computacional será implementada nas próximas fases.
          </p>
        </div>
        
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]" />
      </div>
    </div>
  );
}

