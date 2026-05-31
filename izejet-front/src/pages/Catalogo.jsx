import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ship, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import JetSkiCard from '../components/JetSkiCard';
import api from '../services/api';

export default function Catalogo() {
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const buscarCatalogo = async () => {
      try {
        const resposta = await api.get('/catalogo');
        setCatalogo(resposta.data);
      } catch (error) {
        setErro('Não foi possível carregar o catálogo de ativos náuticos.');
      } finally {
        setCarregando(false);
      }
    };

    buscarCatalogo();
  }, []);

  const handleDeleteJetski = async (id) => {
    try {
      await api.delete(`/catalogo/${id}`);
      setCatalogo(prev => prev.filter(item => item._id !== id));
      toast.success('Ativo removido do inventário com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro na exclusão do item.');
    }
  };

  const catalogoFiltrado = useMemo(() => {
    return catalogo.filter((item) => {
      if (!busca) return true;
      const termo = busca.toLowerCase().trim();
      return (
        String(item.produto || '').toLowerCase().includes(termo) ||
        String(item.descricao || '').toLowerCase().includes(termo) ||
        String(item.local || '').toLowerCase().includes(termo) ||
        String(item.tag || '').toLowerCase().includes(termo)
      );
    });
  }, [catalogo, busca]);

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Controle de Ativos e Frota</h1>
              <p className="text-xs text-gray-400 mt-0.5">Gerenciamento de embarcações e cotas integradas.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 self-start sm:self-auto">
              <Ship size={18} />
            </div>
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
              placeholder="Buscar por modelo, especificações ou hangar..."
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
              <span className="text-xs text-gray-500">Sincronizando hangar...</span>
            </div>
          ) : catalogoFiltrado.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {catalogoFiltrado.map((jet) => (
                <JetSkiCard
                  key={jet._id}
                  id={jet._id}
                  tag={jet.tag || 'Disponível'}
                  titulo={jet.produto}
                  local={jet.local || 'Hangar Principal'}
                  preco={`R$ ${Number(jet.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  imagem={jet.imagem}
                  onDelete={handleDeleteJetski}
                  onEdit={() => navigate(`/editar-jetski/${jet._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-16 text-center flex flex-col items-center justify-center">
              <Search size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum ativo náutico corresponde aos filtros aplicados.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}