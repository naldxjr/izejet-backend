import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Trash2, ArrowRight, AlertCircle, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import api from '../services/api';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem('usuarioId');

  const buscarReservas = async () => {
    try {
      const resposta = await api.get('/reservas');
      // Inverte o array para mostrar as reservas mais novas primeiro
      setReservas(resposta.data.reverse());
    } catch (error) {
      setErro('Erro ao carregar as reservas.');
      toast.error('Não foi possível carregar as reservas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarReservas();
  }, [usuarioId]);

  const reservasFiltradas = reservas.filter((reserva) => {
    const termo = busca.toLowerCase();
    const nomeProduto = reserva.produto?.produto?.toLowerCase() || '';
    const localProduto = reserva.produto?.local?.toLowerCase() || '';
    const nomePerfil = reserva.perfil?.nome?.toLowerCase() || '';
    const cpfReserva = reserva.cpf?.toLowerCase() || '';

    return nomeProduto.includes(termo) || localProduto.includes(termo) || nomePerfil.includes(termo) || cpfReserva.includes(termo);
  });

  // NOVA FUNÇÃO: Atualiza o status sem deletar do banco
  const mudarStatus = async (id, novoStatus) => {
    const acao = novoStatus === 'aprovada' ? 'aprovar' : 'rejeitar';
    if (!window.confirm(`Deseja realmente ${acao} esta reserva?`)) return;

    const toastId = toast.loading('Atualizando reserva...');

    try {
      await api.put(`/reservas/${id}/status`, { status: novoStatus });
      
      // Atualiza a tela instantaneamente
      setReservas(prev => prev.map(r => r._id === id ? { ...r, status: novoStatus } : r));
      
      toast.success(`Reserva ${novoStatus} com sucesso!`, { id: toastId });
    } catch (error) {
      toast.error('Erro ao atualizar reserva.', { id: toastId });
    }
  };

  const deletarReserva = async (id) => {
    if (!window.confirm('Deseja EXCLUIR definitivamente este registro?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      setReservas(prev => prev.filter(r => r._id !== id));
      toast.success('Registro excluído!');
    } catch (error) {
      toast.error('Erro ao excluir registro.');
    }
  };

  // Função para desenhar a etiqueta (Badge) correta
  const renderBadgeStatus = (status) => {
    switch (status) {
      case 'aprovada':
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full"><CheckCircle size={14}/> Aprovada</span>;
      case 'rejeitada':
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full"><XCircle size={14}/> Rejeitada</span>;
      default:
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full"><Clock size={14}/> Pendente</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />
      
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-10 grow">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Gestão de Reservas</h1>
              <p className="mt-1 text-sm text-slate-500">Aprove ou rejeite as solicitações dos clientes.</p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
                placeholder="Filtrar por cliente ou jetski..."
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
        ) : reservasFiltradas.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {reservasFiltradas.map((reserva) => {
              const dataFormatada = reserva.data 
                ? new Date(reserva.data).toLocaleDateString('pt-BR') 
                : 'A combinar com a marina';

              return (
                <div key={reserva._id} className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold leading-tight text-slate-900">
                          {reserva.produto?.produto || 'Jet Ski reservado'}
                        </h3>
                        {renderBadgeStatus(reserva.status)}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Cliente: {reserva.usuario?.email || reserva.cpf}</p>
                    </div>
                    
                    <button 
                      onClick={() => deletarReserva(reserva._id)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      title="Excluir Registro">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#3B96D2]" />
                      <span className="font-medium">Data desejada:</span>
                      <span>{dataFormatada}</span>
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO - Só aparecem se a reserva estiver pendente */}
                  {(!reserva.status || reserva.status === 'pendente') && (
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => mudarStatus(reserva._id, 'rejeitada')}
                        className="flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition">
                        <XCircle size={18} /> Recusar
                      </button>
                      <button 
                        onClick={() => mudarStatus(reserva._id, 'aprovada')}
                        className="flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition shadow-sm">
                        <CheckCircle size={18} /> Aprovar
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <CalendarDays className="text-gray-400" size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">Nenhuma reserva encontrada</h3>
          </div>
        )}
        </section>
      </main>
    </div>
  );
}