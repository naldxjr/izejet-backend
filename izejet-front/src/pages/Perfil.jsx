import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Phone, MapPin, FileText, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; 
import Header from '../components/Header';
import api from '../services/api';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [licenca, setLicenca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem('usuarioId');
  const token = localStorage.getItem('token');
  const emailLocal = localStorage.getItem('usuarioEmail');
  const cpfLocal = localStorage.getItem('usuarioCpf');
  const nomeLocal = localStorage.getItem('usuarioNome');

  useEffect(() => {
    if (!token || !usuarioId) {
      navigate('/login');
      return;
    }

    const buscarPerfil = async () => {
      try {
        const resposta = await api.get(`/perfil/${usuarioId}`);
        setPerfil(resposta.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Erro ao carregar o registro de perfil.'); 
        }
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [navigate, token, usuarioId]);

  const criarPerfil = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Sincronizando dados com o servidor...');
    
    try {
      const resposta = await api.post('/perfil', {
        usuario: usuarioId,
        telefone: telefone.trim(),
        endereco: endereco.trim(),
        licencaMotonauta: licenca.trim()
      });
      setPerfil(resposta.data);
      toast.success('Perfil atualizado com sucesso!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao persistir informações.', { id: toastId });
    }
  };

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioCpf');
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioNome');
    toast.success('Sessão encerrada com sucesso.');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header />
      
      <main className="max-w-md w-full mx-auto px-4 py-8 flex-grow">
        <div className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/5">
              <User size={32} />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">{nomeLocal || emailLocal}</h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">CPF: {cpfLocal || 'Não parametrizado'}</p>
          </div>

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 size={20} className="animate-spin text-cyan-500" />
              <span className="text-xs text-gray-500">Buscando metadados corporativos...</span>
            </div>
          ) : perfil ? (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">Informações Operacionais</h2>
              
              <div className="bg-[#0b0f19]/60 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                <div className="text-cyan-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Telefone de Contato</p>
                  <p className="text-xs text-white font-medium mt-0.5">{perfil.telefone}</p>
                </div>
              </div>

              <div className="bg-[#0b0f19]/60 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                <div className="text-cyan-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Endereço de Registro</p>
                  <p className="text-xs text-white font-medium mt-0.5">{perfil.endereco}</p>
                </div>
              </div>

              <div className="bg-[#0b0f19]/60 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                <div className="text-cyan-400">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Licença / Habilitação Náutica</p>
                  <p className="text-xs text-white font-medium mt-0.5">{perfil.licencaMotonauta}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={criarPerfil} className="space-y-4">
              <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-2.5 text-xs text-cyan-400 text-center font-medium">
                Complete as informações básicas de registro da cota antes de agendar saídas.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Telefone Comercial</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Endereço Completo</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categoria da Licença Náutica</label>
                <input
                  type="text"
                  value={licenca}
                  onChange={(e) => setLicenca(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  placeholder="Ex: Arrais Amador / Motonauta"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan-500/10"
              >
                <Check size={14} />
                <span>Salvar Informações Operacionais</span>
              </button>
            </form>
          )}

          <button
            onClick={fazerLogout}
            className="w-full h-10 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-8"
          >
            <LogOut size={14} />
            <span>Encerrar Sessão Corporativa</span>
          </button>

        </div>
      </main>
    </div>
  );
}