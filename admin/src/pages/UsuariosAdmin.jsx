import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, Trash2, Search, X, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/Header';

export default function UsuariosAdmin() {
  const [admins, setAdmins] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  
  const [mostraFormulario, setMostraFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [excluindoId, setExcluindoId] = useState('');
  
  const navigate = useNavigate();
  const usuarioLogadoId = localStorage.getItem('usuarioId');

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') 
      .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  const buscarAdmins = async () => {
    try {
      const resposta = await api.get('/usuarios/todos');
      const listaAdmins = resposta.data.filter(u => u.cargo === 'admin').reverse();
      setAdmins(listaAdmins);
    } catch (error) {
      setErro('Erro ao carregar os administradores.');
      toast.error('Não foi possível carregar a equipe.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAdmins();
  }, []);

  const cadastrarAdmin = async (e) => {
    e.preventDefault();
    if (!cpf || !email || !senha || !nome) {
      toast.error('Preencha todos os campos.');
      return;
    }
    
    setEnviando(true);
    try {
      await api.post('/usuarios/register-admin', {
        nome: nome.trim(),
        email: String(email).toLowerCase().trim(),
        senha,
        cpf
      });
      toast.success('Novo administrador cadastrado!');
      setNome('');
      setEmail(''); 
      setSenha(''); 
      setCpf('');
      setMostraFormulario(false);
      buscarAdmins();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao cadastrar.');
    } finally {
      setEnviando(false);
    }
  };

  const handleExcluirAdmin = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja revogar o acesso deste administrador?');
    if (!confirmar) return;

    setExcluindoId(id);
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Acesso de administrador revogado!');
      setAdmins(prev => prev.filter(admin => admin._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao excluir administrador.');
    } finally {
      setExcluindoId('');
    }
  };

  const adminsFiltrados = useMemo(() => {
    return admins.filter((admin) => {
      if (!busca) return true;
      const termo = busca.toLowerCase().trim();
      return (
        String(admin.nome || '').toLowerCase().includes(termo) ||
        String(admin.email || '').toLowerCase().includes(termo) ||
        String(admin.cpf || '').toLowerCase().includes(termo)
      );
    });
  }, [admins, busca]);

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      {mostraFormulario && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck size={20} className="text-cyan-400" />
                <h2 className="text-base font-bold tracking-tight">Provisionar Administrador</h2>
              </div>
              <button 
                onClick={() => setMostraFormulario(false)} 
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={cadastrarAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(formatarCPF(e.target.value))}
                  maxLength="14"
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">E-mail Corporativo</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Senha Temporária</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan-500/10"
              >
                {enviando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Criar Credenciais</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Equipe de Administração</h1>
              <p className="text-xs text-gray-400 mt-0.5">Gerenciamento e controle de acessos corporativos ao sistema.</p>
            </div>
            
            <button 
              onClick={() => setMostraFormulario(true)} 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-500 shadow-md shadow-cyan-600/10 self-start sm:self-auto"
            >
              <ShieldCheck size={14} />
              <span>Adicionar Membro</span>
            </button>
          </div>

          <div className="relative w-full mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={14} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
              placeholder="Buscar por nome, CPF ou e-mail corporativo..."
            />
          </div>

          {erro && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 font-medium">
              <AlertCircle size={14} />
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
              <span className="text-xs text-gray-500">Sincronizando privilégios corporativos...</span>
            </div>
          ) : adminsFiltrados.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {adminsFiltrados.map((admin) => (
                <div key={admin._id} className="rounded-xl border border-gray-800/60 bg-[#0b0f19]/40 p-5 hover:border-gray-700/60 transition shadow-xl flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-2.5 text-cyan-400">
                      <ShieldCheck size={18} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {admin.nome || 'Operador Administrativo'}
                      </h3>
                      <div className="mt-2 space-y-1 text-xs text-gray-400">
                        <p><span className="text-gray-500">CPF:</span> {admin.cpf || 'Não informado'}</p>
                        <p className="truncate"><span className="text-gray-500">Chave E-mail:</span> {admin.email || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    {admin._id !== usuarioLogadoId && (
                      <button
                        type="button"
                        onClick={() => handleExcluirAdmin(admin._id)}
                        disabled={excluindoId === admin._id}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-500/20 transition disabled:opacity-30"
                        title="Revogar Privilégios"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-16 text-center flex flex-col items-center justify-center">
              <ShieldCheck size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum operador administrativo foi localizado na base operacional.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}