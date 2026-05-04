import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle, Search, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import api from '../services/api';

export default function Perfis() {
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [mostraFormulario, setMostraFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [excluindoId, setExcluindoId] = useState('');
  const navigate = useNavigate();

  // MÁSCARA DO CPF
  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') 
      .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  useEffect(() => {
    const buscarPerfis = async () => {
      try {
        // CORRIGIDO: Agora busca direto da tabela principal de Usuários
        const resposta = await api.get('/usuarios/todos');
        
        // Inverte para mostrar os cadastros mais recentes primeiro
        setPerfis(resposta.data.reverse());
      } catch (error) {
        setErro('Erro ao carregar os perfis.');
        toast.error('Não foi possível carregar os perfis.');
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfis();
  }, []);

  const handleCriarPerfil = async (e) => {
    e.preventDefault();
    
    if (!cpf || !nome || !email || !senha) {
      toast.error('Preencha nome, CPF, e-mail e senha.');
      return;
    }

    if (cpf.length < 14) {
      toast.error('Por favor, digite um CPF completo.');
      return;
    }

    setEnviando(true);
    try {
      // CORRIGIDO: Agora salva usando a rota oficial de registro
      await api.post('/usuarios/register', {
        nome,
        cpf,
        email,
        senha
      });
      
      toast.success('Perfil criado com sucesso!');
      setNome('');
      setCpf('');
      setEmail('');
      setSenha('');
      setMostraFormulario(false);
      
      // Recarrega a lista
      const resposta = await api.get('/usuarios/todos');
      setPerfis(resposta.data.reverse());
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao criar perfil.');
    } finally {
      setEnviando(false);
    }
  };

  const handleExcluirUsuario = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este usuário definitivamente?');

    if (!confirmar) {
      return;
    }

    setExcluindoId(id);
    try {
      // CORRIGIDO: Agora deleta o usuário da tabela principal
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuário excluído com sucesso!');

      setPerfis(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao excluir perfil.');
    } finally {
      setExcluindoId('');
    }
  };

  const perfisFiltrados = perfis.filter((perfil) => {
    const termo = busca.toLowerCase();
    const nomePerfil = perfil.nome?.toLowerCase() || '';
    const cpfPerfil = perfil.cpf?.toLowerCase() || '';
    const emailPerfil = perfil.email?.toLowerCase() || '';

    return (
      nomePerfil.includes(termo) ||
      cpfPerfil.includes(termo) ||
      emailPerfil.includes(termo)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      {mostraFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Criar novo perfil</h2>
              <button
                onClick={() => setMostraFormulario(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCriarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  maxLength="14"
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Provisória</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha de acesso"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#3B96D2] hover:bg-blue-500 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-xl transition"
              >
                {enviando ? 'Salvando...' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-10 grow">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Gestão de Clientes</h1>
              <p className="mt-1 text-sm text-slate-500">Veja todos os usuários cadastrados na plataforma.</p>
            </div>
            
            <button
              onClick={() => setMostraFormulario(true)}
              className="bg-[#3B96D2] hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition"
            >
              + Criar Cliente
            </button>

            <div className="relative w-full sm:max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                placeholder="Filtrar por nome, cpf ou e-mail..."
              />
            </div>
          </div>

          {erro && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-100 p-3 text-sm font-medium text-red-700">
              <AlertCircle size={18} />
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#3B96D2] rounded-full animate-spin"></div>
            </div>
          ) : perfisFiltrados.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {perfisFiltrados.map((perfil) => (
                <div key={perfil._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-full bg-[#3B96D2]/10 p-3 text-[#3B96D2]">
                      <Users size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {perfil.nome || 'Cliente sem nome'}
                        </h3>
                        {perfil.cargo === 'admin' && (
                          <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span>
                        )}
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold">CPF:</span> {perfil.cpf || 'N/A'}
                        </p>
                        <p>
                          <span className="font-semibold">E-mail:</span> {perfil.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExcluirUsuario(perfil._id)}
                      disabled={excluindoId === perfil._id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
              <Users size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Nenhum cliente encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}