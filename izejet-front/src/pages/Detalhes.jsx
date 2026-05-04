import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, ArrowLeft, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    async function buscarDetalhes() {
      try {
        const resposta = await api.get('/catalogo');
        const maquinaEncontrada = resposta.data.find((item) => item._id === id);
        
        if (maquinaEncontrada) {
          setJet(maquinaEncontrada);
        } else {
          setErro('Jet Ski não encontrado no catálogo.');
        }
      } catch (error) {
        setErro('Erro ao carregar detalhes do Jet Ski.');
      } finally {
        setCarregando(false);
      }
    }
    buscarDetalhes();
  }, [id]);

  const fazerReserva = async (e) => {
    e.preventDefault();
    setErro('');

    const cpfLimpo = cpfReserva.replace(/\D/g, '');

    if (!cpfLimpo) {
      setErro('Por favor, informe o CPF do perfil do cliente para a reserva.');
      return;
    }

    if (!dataSelecionada) {
      setErro('Por favor, selecione uma data para a reserva.');
      return;
    }

    try {
      await api.post('/reservas', {
        cpf: cpfLimpo,
        produto: id,
        data: dataSelecionada 
      });
      setSucesso(true);
    } catch (error) {
      setErro(error.response?.data?.msg || 'Erro ao realizar reserva.');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#3B96D2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!jet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <p>{erro || 'Máquina não encontrada.'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#3B96D2] font-bold">Voltar</button>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-black text-[#0D253F] mb-2 text-center">Reserva registrada!</h1>
        <p className="text-gray-500 text-center mb-8">Data solicitada: {dataSelecionada?.toLocaleDateString('pt-BR')}</p>
        <button onClick={() => navigate('/reservas')} className="bg-[#3B96D2] text-white font-bold py-3 px-8 rounded-xl w-full max-w-xs transition hover:bg-blue-500">
          Ir para reservas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-64 bg-gray-200">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full backdrop-blur-sm text-[#0D253F] shadow-sm hover:bg-white transition">
          <ArrowLeft size={24} />
        </button>
        <img src={jet.imagem || "https://cdn.paytour.com.br/assets/images/passeios-2000295/adfba342517735e729a50e20eea7bd83/WhatsApp%20Image%202025-02-26%20at%2020.05.02_optimized.webp"} alt={jet.produto} className="w-full h-full object-cover" />
      </div>
      
      <main className="max-w-md mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#3B96D2] text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
            {jet.tag || 'Aluguel'}
          </span>
          <h1 className="text-2xl font-black text-[#0D253F] leading-tight mb-2">{jet.produto}</h1>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin size={16} className="mr-1 text-[#3B96D2]" />
            {jet.local || 'Local a combinar'}
          </div>
          <p className="text-sm leading-6 text-gray-600 mb-4">
            {jet.descricao || 'O catálogo exibe as informações diretamente do banco.'}
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Valor base</span>
            <span className="text-2xl font-black text-[#3B96D2]">R$ {jet.preco}</span>
          </div>
        </div>

        {erro && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 text-center font-medium">{erro}</div>}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Quando você deseja reservar?</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">CPF do perfil do cliente</label>
            <input
              type="text"
              value={cpfReserva}
              onChange={(e) => setCpfReserva(e.target.value)}
              placeholder="Digite o CPF do cliente"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none text-gray-700 font-medium"
            />
            <p className="text-xs text-gray-400 mt-2">
              A reserva será vinculada ao perfil de cliente cadastrado com esse CPF.
            </p>
          </div>
          
          <div className="relative z-30">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <CalendarDays size={20} className="text-gray-400" />
            </div>
            
            <DatePicker
              selected={dataSelecionada}
              onChange={(date) => setDataSelecionada(date)}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()} 
              placeholderText="Clique para abrir o calendário"
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] outline-none text-gray-700 font-medium cursor-pointer"
              wrapperClassName="w-full"
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-3 text-center">
            *A solicitação será registrada no banco e a equipe poderá confirmar a disponibilidade.
          </p>
        </div>

        <button onClick={fazerReserva} className="w-full bg-[#3B96D2] hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-md">
          Confirmar reserva
        </button>
      </main>
    </div>
  );
}