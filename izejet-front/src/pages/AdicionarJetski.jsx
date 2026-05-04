import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, MapPin, Tag, FileText, DollarSign, Image } from 'lucide-react';
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
  tag: 'Cota' // O padrão agora é Cota
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
      } catch {
        setErro('Não foi possível carregar o catálogo.');
      } finally {
        setCarregando(false);
      }
    };

    buscarCatalogo();
  }, [navigate]);

  const catalogoFiltrado = catalogo.filter((item) => {
    const termo = busca.toLowerCase();
    return (
      item.produto?.toLowerCase().includes(termo) ||
      item.descricao?.toLowerCase().includes(termo) ||
      item.local?.toLowerCase().includes(termo) ||
      item.tag?.toLowerCase().includes(termo)
    );
  });

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
      formData.append('produto', form.produto);
      formData.append('descricao', form.descricao);
      formData.append('preco', Number(form.preco));
      formData.append('local', form.local);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#3B96D2]/10 p-3 text-[#3B96D2]">
              <PlusCircle size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Novo jetski</h1>
              <p className="text-sm text-slate-500">Cadastre no catálogo com upload de foto.</p>
            </div>
          </div>

          {erro && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {erro}
            </div>
          )}

          <form onSubmit={salvarJetski} className="mt-6 grid gap-4">
            
            <label className="grid gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">Foto do Jet Ski</span>
              <div className={`relative flex flex-col items-center justify-center w-full min-h-[140px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${imagemPreview ? 'border-[#3B96D2] bg-[#3B96D2]/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={lidarComImagem}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!imagemPreview} // Só é obrigatório se não tiver foto ainda
                />
                
                {imagemPreview ? (
                  <div className="flex flex-col items-center w-full h-full p-2">
                    <img src={imagemPreview} alt="Preview" className="h-32 w-auto object-cover rounded-xl shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-sm flex items-center gap-2"><Image size={18} /> Trocar foto</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500 py-6">
                    <Image size={32} className="mb-3 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Clique para selecionar uma foto</span>
                    <span className="text-xs mt-1">Formatos aceitos: JPG, PNG ou WEBP</span>
                  </div>
                )}
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Nome do Modelo</span>
              <input
                type="text"
                value={form.produto}
                onChange={(e) => atualizarCampo('produto', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                placeholder="Ex: Jet Ski Yamaha VX Cruiser"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Descrição</span>
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                placeholder="Detalhe o modelo, regras e o uso..."
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Valor (R$)</span>
                <input
                  type="number"
                  value={form.preco}
                  onChange={(e) => atualizarCampo('preco', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                  placeholder="0.00"
                  required
                />
              </label>

              {/* AQUI ESTÁ A MÁGICA: O SELECT DA TAG */}
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Tipo (Cota ou Aluguel)</span>
                <select
                  value={form.tag}
                  onChange={(e) => atualizarCampo('tag', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10 cursor-pointer"
                  required
                >
                  <option value="Cota">Cota (Fração)</option>
                  <option value="Aluguel">Aluguel (Diária)</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Local da Marina</span>
                <input
                  type="text"
                  value={form.local}
                  onChange={(e) => atualizarCampo('local', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                  placeholder="Ex: Marina Central"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3B96D2] px-5 py-3.5 font-bold text-white shadow-lg shadow-[#3B96D2]/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle size={18} />
              {salvando ? 'Salvando...' : 'Salvar Jet Ski no Catálogo'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Catálogo atual</h2>
            <div className="relative w-full max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                placeholder="Buscar"
              />
            </div>
          </div>

          {carregando ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3B96D2]"></div>
            </div>
          ) : catalogoFiltrado.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {catalogoFiltrado.map((jet) => (
                <JetSkiCard
                  key={jet._id}
                  id={jet._id}
                  tag={jet.tag || 'Cota'}
                  titulo={jet.produto}
                  local={jet.local || 'Local a definir'}
                  preco={`R$ ${Number(jet.preco).toFixed(2)}`}
                  imagem={jet.imagem} 
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Nenhum item encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}