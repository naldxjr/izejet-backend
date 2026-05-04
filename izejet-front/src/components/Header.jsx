import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';

export default function Header({ mostrarLogout = true, mostrarVoltar = false, onVoltar, alto = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioCpf');
    navigate('/login');
  };

  return (
    <header className={`bg-[#0D253F] text-white px-4 ${alto ? 'py-7' : 'py-5'} shadow-md sticky top-0 z-50`}>
      <div className="flex items-center justify-center w-full">
        <Link to="/" className="text-[2rem] font-black tracking-wider leading-none absolute left-1/2 transform -translate-x-1/2">
          IzeJet<span className="text-[#3B96D2]">Administração</span>
        </Link>

        {mostrarVoltar && (
          <button
            onClick={onVoltar || (() => navigate('/'))}
            className="absolute left-4 flex items-center gap-2 rounded-lg bg-[#0D4A7D] hover:bg-[#0A3556] px-4 py-2 transition-colors duration-200"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {mostrarLogout && (
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 rounded-lg bg-[#0D4A7D] hover:bg-[#0A3556] px-4 py-2 transition-colors duration-200"
            title="Sair da conta"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
}