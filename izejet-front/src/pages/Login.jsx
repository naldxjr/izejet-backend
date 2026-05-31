import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const fazerLogin = async (e) => {
    e.preventDefault();
    if (carregando) return;

    setErro('');
    setCarregando(true);
    
    try {
      const resposta = await api.post('/usuarios/login', {
        email: String(email).toLowerCase().trim(),
        senha
      });

      const usuario = resposta.data.usuario;
      const cargoUsuario = usuario?.cargo || usuario?.role;

      if (cargoUsuario !== 'admin') {
        setErro('Acesso negado. Apenas administradores autorizados.');
        setCarregando(false);
        return; 
      }

      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuarioId', usuario._id);
      localStorage.setItem('usuarioEmail', usuario.email);
      localStorage.setItem('usuarioCpf', usuario.cpf);
      localStorage.setItem('usuarioNome', usuario.nome);
      
      navigate('/', { replace: true });
    } catch (error) {
      setErro(error.response?.data?.msg || 'Email ou senha inválidos.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-md z-10">
        <div className="bg-[#111827]/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800/60 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">IzeJet Admin</h1>
            <p className="text-sm text-gray-400 mt-2">Painel de Controle e Monitoramento Náutico</p>
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium animate-pulse">
              {erro}
            </div>
          )}

          <form onSubmit={fazerLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition disabled:opacity-50 text-sm"
                  placeholder="admin@izejet.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Chave de Segurança</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition disabled:opacity-50 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition flex justify-center items-center gap-2 mt-8 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none text-sm"
            >
              {carregando ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <LogIn size={18} />
                  Acessar Console
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800/50 text-center text-xs text-gray-500">
            Painel interno restrito. IP monitorado por segurança.
          </div>
        </div>
      </main>
    </div>
  );
}