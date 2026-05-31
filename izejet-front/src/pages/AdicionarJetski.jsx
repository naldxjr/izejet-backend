import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Image, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import JetSkiCard from '../components/JetSkiCard';
import api from '../services/api';

const estadoInicial = {
  produto: '',
  descricao: '',
  preco: '',
  imagem: null,
  local: '',
  tag: 'Cota'
};

export default function AdicionarJetski() {
  const [form, setForm] = useState(estadoInicial);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const buscarCatalogo = async () => {
      try {
        const resposta = await api.get('/catalogo');
        setCatalogo(resposta.data.reverse()); 
      } catch (error) {
        setErro('Não foi possível carregar o catálogo.');
      } finally {
        setCarregando(false);
      }
    };

    buscarCatalogo();
  }, [navigate]);

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

  const atualizarCampo = (campo, valor) => {
    setForm((atual) => ({
      ...atual,
      [campo]: valor
    }));
  };

  const lidarComImagem = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      atualizarCampo('imagem', arquivo);
      setImagemPreview(URL.createObjectURL(arquivo));
    }
  };

  const salvarJetski = async (e) => {
    e.preventDefault();
    
    if (!form.imagem) {
      toast.error('Por favor, selecione a foto do Jet Ski.');
      return;
    }

    setErro('');
    setSalvando(true);
    const toastId = toast.loading('Fazendo upload da imagem e salvando...');

    try {
      const formData = new FormData();
      formData.append('produto', form.produto.trim());
      formData.append('descricao', form.descricao.trim());
      formData.append('preco', Number(form.preco));
      formData.append('local', form.local.trim() || 'Hangar Principal');
      formData.append('tag', form.tag);
      formData.append('imagem', form.imagem);

      const resposta = await api.post('/catalogo', formData); 
      
      setCatalogo((atual) => [resposta.data, ...atual]);
      setForm(estadoInicial);
      setImagemPreview(null);
      
      toast.success('Jet ski adicionado com sucesso!', { id: toastId });
    } catch (error) {
      setErro(error.response?.data?.msg || 'Erro ao adicionar jet ski.');
      toast.error('Não foi possível salvar o jetski.', { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PlusCircle size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Provisionar Embarcação</h1>
              <p className="text-xs text-gray-400 mt-0.5">Cadastre um novo ativo no hangar e distribua as cotas de frações.</p>
            </div>
          </div>

          {erro && (
            <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 font-medium">
              {erro}
            </div>
          )}

          <form onSubmit={salvarJetski} className="grid gap-5">
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Foto da Embarcação</span>
              <div className={`relative flex flex-col items-center justify-center w-full min-h-[140px] rounded-xl border border-gray-800 bg-[#0b0f19] transition cursor-pointer overflow-hidden group ${imagemPreview ? 'border-cyan-500' : 'hover:border-gray-700'}`}>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={lidarComImagem}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!imagemPreview}
                />
                
                {imagemPreview ? (
                  <div className="flex flex-col items-center w-full h-full p-2 relative">
                    <img src={imagemPreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg shadow-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <span className="text-white font-semibold text-xs flex items-center gap-2"><Image size={14} /> Substituir Mídia</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 py-6 text-center">
                    <Image size={24} className="mb-2 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-300">Carregar arquivo de imagem</span>
                    <span className="text-[10px] text-gray-500 mt-1">Formatos aceitos: JPG, PNG ou WEBP (Máx: 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nome do Modelo / Identificação</label>
              <input
                type="text"
                value={form.produto}
                onChange={(e) => atualizarCampo('produto', e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                placeholder="Ex: Yamaha VX Cruiser HO"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descrição e Especificações Técnicas</label>
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 resize-none"
                placeholder="Descreva a motorização, capacidade, regras internas do condomínio e gerenciamento..."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preço da Fração / Diária (R$)</label>
                <input
                  type="number"
                  value={form.preco}
                  onChange={(e) => atualizarCampo('preco', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Modalidade Operacional</label>
                <select
                  value={form.tag}
                  onChange={(e) => atualizarCampo('tag', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 cursor-pointer"
                  required
                >
                  <option value="Cota">Cota Compartilhada (Fração)</option>
                  <option value="Aluguel">Locação Avulsa (Diária)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Localização da Marina / Ponto de Coleta</label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => atualizarCampo('local', e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                placeholder="Ex: Marina Pier 54 - Hangar B"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-cyan-500/10"
            >
              {salvando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <PlusCircle size={14} />
                  <span>Cadastrar Ativo e Liberar Vendas</span>
                </>
              )}
            </button>
          </form>
        </section>

        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-base font-bold text-white tracking-tight">Hangar de Ativos Cadastrados</h2>
            <div className="relative w-full sm:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={14} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                placeholder="Filtrar catálogo..."
              />
            </div>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-800 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : catalogoFiltrado.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {catalogoFiltrado.map((jet) => (
                <JetSkiCard
                  key={jet._id}
                  id={jet._id}
                  tag={jet.tag || 'Cota'}
                  titulo={jet.produto}
                  local={jet.local || 'Hangar Principal'}
                  preco={`R$ ${Number(jet.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  imagem={jet.imagem} 
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-12 text-center flex flex-col items-center justify-center">
              <Search size={24} className="mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum ativo hidro-náutico foi localizado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}