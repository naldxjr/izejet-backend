import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

export default function EditarJetSki() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produto, setProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [local, setLocal] = useState('');
  const [tag, setTag] = useState('');
  const [imagemNova, setImagemNova] = useState(null);
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarJetSki = async () => {
      try {
        const resposta = await api.get(`/catalogo/${id}`);
        const jetAtual = resposta.data;

        if (jetAtual) {
          setProduto(jetAtual.produto || '');
          setDescricao(jetAtual.descricao || '');
          setPreco(jetAtual.preco || '');
          setLocal(jetAtual.local || '');
          setTag(jetAtual.tag || '');
        } else {
          setErro('Ativo hidro-náutico não localizado.');
        }
      } catch (error) {
        setErro('Falha ao sincronizar dados do ativo.');
      } finally {
        setCarregando(false);
      }
    };
    buscarJetSki();
  }, [id]);

  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (salvando) return;

    setSalvando(true);
    setErro('');

    try {
      const formData = new FormData();
      formData.append('produto', produto.trim());
      formData.append('descricao', descricao.trim());
      formData.append('preco', Number(preco));
      formData.append('local', local.trim());
      formData.append('tag', tag);
      
      if (imagemNova) {
        formData.append('imagem', imagemNova);
      }

      await api.put(`/catalogo/${id}`, formData);
      navigate('/catalogo');
    } catch (error) {
      setErro('Erro ao atualizar o ativo. Verifique os dados inseridos.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <button 
          onClick={() => navigate('/catalogo')} 
          className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-white mb-6 transition group"
        >
          <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-0.5 transition-transform" /> 
          <span>Voltar ao Hangar</span>
        </button>

        <div className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight">Atualizar Cadastro</h1>
            <p className="text-xs text-gray-400 mt-0.5">Modifique os parâmetros técnicos ou operacionais do ativo.</p>
          </div>

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
              <span className="text-xs text-gray-500">Buscando ficha de registro...</span>
            </div>
          ) : (
            <form onSubmit={salvarEdicao} className="space-y-5">
              {erro && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 font-medium">
                  <AlertCircle size={14} />
                  <span>{erro}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Identificação / Modelo</label>
                <input 
                  type="text" 
                  value={produto} 
                  onChange={(e) => setProduto(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={preco} 
                    onChange={(e) => setPreco(e.target.value)} 
                    required 
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Regime Operacional</label>
                  <select 
                    value={tag} 
                    onChange={(e) => setTag(e.target.value)} 
                    required
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Cota">Cota Compartilhada (Fração)</option>
                    <option value="Aluguel">Locação Avulsa (Diária)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marina / Hangar de Origem</label>
                <input 
                  type="text" 
                  value={local} 
                  onChange={(e) => setLocal(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ficha Descritiva</label>
                <textarea 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  rows="4" 
                  required
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 resize-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Substituir Imagem do Ativo</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-800 rounded-xl cursor-pointer bg-[#0b0f19] hover:border-gray-700 transition">
                    <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                      <Upload size={20} className="mb-2 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-300">
                        {imagemNova ? imagemNova.name : 'Clique para selecionar novo arquivo'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setImagemNova(e.target.files[0])} 
                      accept="image/jpeg, image/png, image/webp" 
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">* Mantenha o campo vazio para preservar a imagem em cache no Cloudinary.</p>
              </div>

              <button 
                disabled={salvando} 
                type="submit" 
                className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan-500/10"
              >
                {salvando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Confirmar Alterações</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}