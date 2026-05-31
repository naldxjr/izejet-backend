import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, Trash2, AlertCircle, Search, CheckCircle, XCircle, Clock, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import api from '../services/api';

export default function Reservas() {
  const location = useLocation();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem('usuarioId');

  const buscarReservas = async () => {
    try {
      const resposta = await api.get('/reservas');
      setReservas(resposta.data.reverse());
    } catch (error) {
      setErro('Erro ao carregar o histórico de agendamentos.');
      toast.error('Não foi possível sincronizar as reservas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarReservas();
  }, [usuarioId]);

  useEffect(() => {
    if (location.state && location.state.buscarPor) {
      setBusca(location.state.buscarPor);
    }
  }, [location]);

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva) => {
      if (!busca) return true;
      const termo = busca.toLowerCase().trim();
      const nomeProduto = String(reserva.produto?.produto || '').toLowerCase();
      const localProduto = String(reserva.produto?.local || '').toLowerCase();
      const nomePerfil = String(reserva.usuario?.nome || reserva.perfil?.nome || '').toLowerCase();
      const cpfReserva = String(reserva.cpf || reserva.usuario?.cpf || '').toLowerCase();
      const emailReserva = String(reserva.usuario?.email || '').toLowerCase();

      return (
        nomeProduto.includes(termo) || 
        localProduto.includes(termo) || 
        nomePerfil.includes(termo) || 
        cpfReserva.includes(termo) ||
        emailReserva.includes(termo)
      );
    });
  }, [reservas, busca]);

  const mudarStatus = async (id, novoStatus) => {
    const acao = novoStatus === 'aprovada' ? 'aprovar' : 'rejeitar';
    if (!window.confirm(`Deseja realmente ${acao} esta reserva?`)) return;

    const toastId = toast.loading('Atualizando status no sistema...');

    try {
      await api.put(`/reservas/${id}/status`, { status: novoStatus });
      setReservas(prev => prev.map(r => r._id === id ? { ...r, status: novoStatus } : r));
      toast.success(`Agendamento atualizado para: ${novoStatus}!`, { id: toastId });
    } catch (error) {
      toast.error('Erro ao atualizar status da reserva.', { id: toastId });
    }
  };

  const deletarReserva = async (id) => {
    if (!window.confirm('Deseja EXCLUIR definitivamente este registro do sistema?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      setReservas(prev => prev.filter(r => r._id !== id));
      toast.success('Registro removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir registro do banco.');
    }
  };

  const renderBadgeStatus = (status) => {
    switch (status) {
      case 'aprovada':
        return <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-md"><CheckCircle size={14} /> Aprovada</span>;
      case 'rejeitada':
        return <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-md"><XCircle size={14} /> Rejeitada</span>;
      default:
        return <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-md"><Clock size={14} /> Pendente</span>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate('/')} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gestão de Agendamentos</h1>
              <p className="text-xs text-gray-400 mt-0.5">Aprovação de saídas e monitoramento de fluxo da frota.</p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] py-2 pl-9 pr-8 text-xs text-white placeholder-gray-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                placeholder="Filtrar por capitão, CPF ou jet ski..."
              />
              {busca && (
                <button onClick={() => setBusca('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500 hover:text-gray-300">
                  <X size={14} />
                </button>
              )}
            </div>
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
              <span className="text-xs text-gray-500">Buscando registros náuticos...</span>
            </div>
          ) : reservasFiltradas.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {reservasFiltradas.map((reserva) => {
                const dataFormatada = reserva.data
                  ? new Date(reserva.data).toLocaleDateString('pt-BR')
                  : 'Pendente de confirmação';

                return (
                  <div key={reserva._id} className="flex flex-col rounded-xl border border-gray-800/60 bg-[#0b0f19]/40 p-5 hover:border-gray-700/60 transition shadow-xl">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-sm font-semibold text-white tracking-tight">
                            {reserva.produto?.produto || 'Ativo Hidro-Náutico'}
                          </h3>
                          {renderBadgeStatus(reserva.status)}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[250px] sm:max-w-md">
                          <span className="text-gray-500">Capitão:</span> {reserva.usuario?.nome || reserva.usuario?.email || reserva.cpf}
                        </p>
                      </div>

                      <button
                        onClick={() => deletarReserva(reserva._id)}
                        className="rounded-xl p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 shrink-0"
                        title="Remover Registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 rounded-xl border border-gray-800/60 bg-[#0b0f19]/80 p-4 text-xs text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-cyan-400" />
                        <span className="text-gray-500 font-medium">Data solicitada:</span>
                        <span>{dataFormatada}</span>
                      </div>
                    </div>

                    {(!reserva.status || reserva.status === 'pendente') && (
                      <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => mudarStatus(reserva._id, 'rejeitada')}
                          className="flex justify-center items-center gap-2 h-10 rounded-xl font-semibold text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
                        >
                          <XCircle size={14} />
                          <span>Recusar</span>
                        </button>
                        <button
                          onClick={() => mudarStatus(reserva._id, 'aprovada')}
                          className="flex justify-center items-center gap-2 h-10 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/10 transition"
                        >
                          <CheckCircle size={14} />
                          <span>Aprovar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-16 text-center flex flex-col items-center justify-center">
              <CalendarDays size={24} className="mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum registro de reserva localizado para os parâmetros indicados.</p>
              <button onClick={() => setBusca('')} className="mt-3 text-xs font-bold text-cyan-400 hover:underline">
                Limpar Filtros
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}