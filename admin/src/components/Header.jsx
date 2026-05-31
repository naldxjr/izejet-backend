import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, User } from 'lucide-react';

export default function Header({ mostrarLogout = true, mostrarVoltar = false, onVoltar, alto = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioCpf');
    localStorage.removeItem('usuarioNome');
    navigate('/login');
  };

  return (
    <header className={`bg-[#111827]/40 backdrop-blur-md border-b border-gray-800/60 text-white px-4 ${alto ? 'py-5' : 'py-3'} sticky top-0 z-50`}>
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto relative gap-4">

        <div className="flex-1 flex justify-start">
          {mostrarVoltar && (
            <button
              onClick={onVoltar || (() => navigate('/'))}
              className="flex items-center gap-2 rounded-xl bg-[#0b0f19] border border-gray-800 text-gray-400 hover:text-white px-3 py-2 text-xs font-semibold transition"
              title="Voltar"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}
        </div>

        <Link to="/" className="text-lg font-bold tracking-tight shrink-0 text-center">
          IzeJet<span className="text-cyan-400 font-black">Admin</span>
        </Link>

        <div className="flex-1 flex justify-end items-center gap-2">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center justify-center rounded-xl bg-[#0b0f19] border border-gray-800 text-gray-400 hover:text-white p-2"
            title="Meu Perfil"
          >
            <User size={14} />
          </button>

          {mostrarLogout && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-3 py-2 text-xs font-semibold transition"
              title="Encerrar Sessão"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}