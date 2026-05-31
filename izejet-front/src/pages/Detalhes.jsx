import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css'; 
import api from '../services/api';

registerLocale('pt-BR', ptBR);

export default function Detalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jet, setJet] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [cpfReserva, setCpfReserva] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [solicitando, setSolicitando] = useState(false);

  useEffect(() => {
    async function buscarDetalhes() {
      try {
        const resposta = await api.get(`/catalogo/${id}`);
        if (resposta.data) {
          setJet(resposta.data);
        } else {
          setErro('Ativo hidro-náutico não localizado no catálogo.');
        }
      } catch (error) {
        setErro('Erro ao carregar detalhes do ativo selecionado.');
      } finally {
        setCarregando(false);
      }
    }
    buscarDetalhes();
  }, [id]);

  const fazerReserva = async (e) => {
    e.preventDefault();
    if (solicitando) return;

    setErro('');
    const cpfLimpo = cpfReserva.replace(/\D/g, '');

    if (!cpfLimpo) {
      setErro('Informe o CPF associado ao cliente para efetuar o agendamento.');
      return;
    }

    if (!dataSelecionada) {
      setErro('Selecione uma data disponível no calendário.');
      return;
    }

    setSolicitando(true);

    try {
      await api.post('/reservas', {
        cpf: cpfLimpo,
        produto: id,
        data: dataSelecionada 
      });
      setSucesso(true);
    } catch (error) {
      setErro(error.response?.data?.msg || 'Falha operacional ao registrar agendamento.');
    } finally {
      setSolicitando(false);
    }
  };

  if (carregando) {
    return (
      <div className="w-full min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-cyan-500" />
        <span className="text-xs text-gray-500">Carregando especificações náuticas...</span>
      </div>
    );
  }

  if (!jet) {
    return (
      <div className="w-full min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-gray-400 p-4">
        <AlertCircle size={32} className="text-red-400 mb-2" />
        <p className="text-xs">{erro || 'Registro não localizado.'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 text-xs font-semibold text-cyan-400 hover:underline"
        >
          Retornar ao Painel
        </button>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="w-full min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-[#111827]/60 backdrop-blur-md border border-gray-800/60 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col items-center">
          <CheckCircle size={48} className="text-emerald-400 mb-4" />
          <h1 className="text-lg font-bold tracking-tight">Solicitação de Reserva Registrada</h1>
          <p className="text-xs text-gray-400 mt-1 mb-6">Janela de saída pré-agendada para: {dataSelecionada?.toLocaleDateString('pt-BR')}</p>
          <button 
            onClick={() => navigate('/reservas')} 
            className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-cyan-500/10"
          >
            Visualizar no Controle de Fluxo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <div className="relative h-64 w-full bg-[#0b0f19] border-b border-gray-800/60">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 Regal z-30 bg-[#111827]/80 p-2.5 rounded-full border border-gray-800/60 text-gray-400 hover:text-white backdrop-blur-sm transition shadow-lg"
        >
          <ArrowLeft size={16} />
        </button>
        <img 
          src={jet.imagem} 
          alt={jet.produto} 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent" />
      </div>
      
      <main className="max-w-xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-16">
        <div className="bg-[#111827]/60 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl mb-5">
          <span className="inline-block px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded-md mb-4">
            {jet.tag || 'Cota'}
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight mb-2">{jet.produto}</h1>
          <div className="flex items-center text-gray-400 text-xs mb-4">
            <MapPin size={14} className="mr-1.5 text-cyan-400" />
            <span>{jet.local || 'Hangar Principal'}</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400 mb-6">
            {jet.descricao}
          </p>
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avaliação Base Cota</span>
            <span className="text-lg font-bold text-cyan-400">R$ {Number(jet.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {erro && (
          <div className="mb-5 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 text-center font-medium">
            {erro}
          </div>
        )}

        <div className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl mb-6">
          <h3 className="text-sm font-bold text-white tracking-tight mb-5">Parametrizar Período de Saída</h3>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">CPF do Titular da Cota</label>
            <input
              type="text"
              value={cpfReserva}
              onChange={(e) => setCpfReserva(e.target.value)}
              placeholder="000.000.000-00"
              disabled={solicitando}
              className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 transition disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data de Lançamento</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                <CalendarDays size={14} className="text-gray-500" />
              </div>
              
              <DatePicker
                selected={dataSelecionada}
                onChange={(date) => setDataSelecionada(date)}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()} 
                disabled={solicitando}
                placeholderText="Clique para expandir o calendário corporativo"
                className="w-full pl-9 pr-4 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500 transition cursor-pointer disabled:opacity-50"
                wrapperClassName="w-full"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={fazerReserva} 
          disabled={solicitando}
          className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          {solicitando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <span>Confirmar Agendamento Operacional</span>
          )}
        </button>
      </main>
    </div>
  );
}