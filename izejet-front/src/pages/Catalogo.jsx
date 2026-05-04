import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ship, AlertCircle } from 'lucide-react';
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
      } catch {
        setErro('Não foi possível carregar o catálogo de jetskis.');
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
      toast.success('Jet ski excluído com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao excluir jet ski.');
    }
  };

  const catalogoFiltrado = catalogo.filter((item) => {
    const termo = busca.toLowerCase();
    return (
      (item.produto || '').toLowerCase().includes(termo) ||
      (item.descricao || '').toLowerCase().includes(termo) ||
      (item.local || '').toLowerCase().includes(termo) ||
      (item.tag || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <section className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Ver Catálogo de Jetskis</h1>
              <p className="mt-1 text-sm text-slate-500">Itens disponíveis da coleção catalogos.</p>
            </div>
            <div className="rounded-2xl bg-[#3B96D2]/10 p-3 text-[#3B96D2]">
              <Ship size={22} />
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
              placeholder="Pesquisar jetskis..."
            />
          </div>

          {erro && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-100 p-3 text-sm font-medium text-red-700">
              <AlertCircle size={18} />
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">Carregando catálogo...</div>
          ) : catalogoFiltrado.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {catalogoFiltrado.map((jet) => (
                <JetSkiCard
                  key={jet._id}
                  id={jet._id}
                  tag={jet.tag || 'Disponível'}
                  titulo={jet.produto}
                  local={jet.local || 'A combinar'}
                  preco={`R$ ${Number(jet.preco).toFixed(2)}`}
                  imagem={jet.imagem || 'https://cdn.paytour.com.br/assets/images/passeios-2000295/adfba342517735e729a50e20eea7bd83/WhatsApp%20Image%202025-02-26%20at%2020.05.02_optimized.webp'}
                  onDelete={handleDeleteJetski}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Nenhum jetski encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
