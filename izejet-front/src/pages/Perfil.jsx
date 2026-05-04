import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Phone, MapPin, FileText, Check } from 'lucide-react';
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
          toast.error('Erro ao carregar perfil.'); 
        }
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [navigate, token, usuarioId]);

  const criarPerfil = async (e) => {
    e.preventDefault();
    
    
    const toastId = toast.loading('Salvando informações...');
    
    try {
      const resposta = await api.post('/perfil', {
        usuario: usuarioId,
        telefone,
        endereco,
        licencaMotonauta: licenca
      });
      setPerfil(resposta.data);
      
      
      toast.success('Perfil completo com sucesso!', { id: toastId });
    } catch (error) {
      
      toast.error(error.response?.data?.msg || 'Erro ao salvar informações.', { id: toastId });
    }
  };

  const fazerLogout = () => {
    localStorage.clear();
    toast.success('Você saiu da conta.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="max-w-md w-full mx-auto px-4 mt-8 mb-10 flex-grow">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-[#0D253F] rounded-full flex items-center justify-center mb-4 shadow-md">
              <User size={40} className="text-[#3B96D2]" />
            </div>
            <h1 className="text-2xl font-black text-[#0D253F]">{emailLocal}</h1>
            <p className="text-gray-500 text-sm mt-1">CPF: {cpfLocal}</p>
          </div>

          {carregando ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#3B96D2] rounded-full animate-spin"></div>
            </div>
          ) : perfil ? (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 text-lg border-b pb-2">Informações Adicionais</h2>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <Phone className="text-[#3B96D2]" size={24} />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Telefone</p>
                  <p className="text-gray-800 font-medium">{perfil.telefone}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <MapPin className="text-[#3B96D2]" size={24} />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Endereço</p>
                  <p className="text-gray-800 font-medium">{perfil.endereco}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <FileText className="text-[#3B96D2]" size={24} />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Licença Motonauta</p>
                  <p className="text-gray-800 font-medium">{perfil.licencaMotonauta}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={criarPerfil} className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 text-center">
                Complete seu perfil para poder fazer reservas.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Licença Motonauta</label>
                <input
                  type="text"
                  value={licenca}
                  onChange={(e) => setLicenca(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3B96D2] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 mt-6"
              >
                <Check size={20} />
                Salvar Informações
              </button>
            </form>
          )}

          <button
            onClick={fazerLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 mt-8 border border-red-200"
          >
            <LogOut size={20} />
            Sair da conta
          </button>

        </div>
      </main>
    </div>
  );
}