import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function RotaProtegida({ children, requerAdmin = false }) {
  const location = useLocation();
  const [estadoAcesso, setEstadoAcesso] = useState({
    carregando: true,
    autorizado: false,
    redirecionarPara: '/login'
  });

  useEffect(() => {
    const validarTokenEAcesso = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setEstadoAcesso({ carregando: false, autorizado: false, redirecionarPara: '/login' });
        return;
      }

      try {
        const tokenDecodificado = jwtDecode(token);
        const tempoAtual = Date.now();

        if (tokenDecodificado.exp * 1000 < tempoAtual) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioId');
          localStorage.removeItem('usuarioCpf');
          localStorage.removeItem('usuarioEmail');
          localStorage.removeItem('usuarioNome');
          setEstadoAcesso({ carregando: false, autorizado: false, redirecionarPara: '/login' });
          return;
        }

        const cargoUsuario = tokenDecodificado.cargo || tokenDecodificado.role;

        if (requerAdmin && cargoUsuario !== 'admin') {
          setEstadoAcesso({ carregando: false, autorizado: false, redirecionarPara: '/catalogo' });
          return;
        }

        setEstadoAcesso({ carregando: false, autorizado: true, redirecionarPara: '' });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioCpf');
        localStorage.removeItem('usuarioEmail');
        localStorage.removeItem('usuarioNome');
        setEstadoAcesso({ carregando: false, autorizado: false, redirecionarPara: '/login' });
      }
    };

    validarTokenEAcesso();
  }, [location.pathname, requerAdmin]);

  if (estadoAcesso.carregando) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!estadoAcesso.autorizado) {
    return <Navigate to={estadoAcesso.redirecionarPara} state={{ from: location }} replace />;
  }

  return children;
}