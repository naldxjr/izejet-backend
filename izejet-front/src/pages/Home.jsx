import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, PlusCircle, LayoutGrid, Ship, Users, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

export default function Home() {
  const [reservas, setReservas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const buscarReservas = async () => {
      setCarregando(true);
      setErro('');

      try {
        const resposta = await api.get('/reservas');
        const termo = busca.trim().toLowerCase();

        if (!termo) {
          setReservas(resposta.data);
          return;
        }

        const filtradas = resposta.data.filter((reserva) => {
          const nomeProduto = reserva.produto?.produto?.toLowerCase() || '';
          const localProduto = reserva.produto?.local?.toLowerCase() || '';
          const emailUsuario = reserva.usuario?.email?.toLowerCase() || '';
          const cpfReserva = reserva.cpf?.toLowerCase() || '';

          return (
            nomeProduto.includes(termo) ||
            localProduto.includes(termo) ||
            emailUsuario.includes(termo) ||
            cpfReserva.includes(termo)
          );
        });

        setReservas(filtradas);
      } catch {
        setErro('Não foi possível carregar as reservas.');
      } finally {
        setCarregando(false);
      }
    };

    buscarReservas();
  }, [busca]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <section className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Painel rápido</h1>
              <p className="mt-1 text-sm text-slate-500">Ações principais do sistema.</p>
            </div>
            <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-2xl bg-[#0D253F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <LayoutGrid size={18} />
              Ir para catálogo
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link to="/catalogo" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <CalendarDays size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Criar Reserva</p>
              <p className="mt-1 text-sm text-slate-500">Escolha um jetski no catálogo.</p>
            </Link>
            <Link to="/reservas" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <CalendarDays size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Ver Reservas</p>
              <p className="mt-1 text-sm text-slate-500">Acompanhe as solicitações.</p>
            </Link>
            <Link to="/catalogo" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <Ship size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Ver Catálogo de Jetskis</p>
              <p className="mt-1 text-sm text-slate-500">Veja e pesquise os jetskis disponíveis.</p>
            </Link>
            <Link to={token ? '/catalogo/novo' : '/login'} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <PlusCircle size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Criar Jetskis</p>
              <p className="mt-1 text-sm text-slate-500">Cadastre no catálogo.</p>
            </Link>
            <Link to="/perfis" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <Users size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Ver Perfis</p>
              <p className="mt-1 text-sm text-slate-500">Perfis de clientes.</p>
            </Link>
            
            <Link to="/gestao-admins" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              <ShieldCheck size={20} className="text-[#3B96D2]" />
              <p className="mt-3 font-semibold text-slate-900">Gestão de Admins</p>
              <p className="mt-1 text-sm text-slate-500">Gerencie a equipe do sistema.</p>
            </Link>
          </div>

          <div id="catalogo" className="mt-6 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B96D2] focus:bg-white focus:ring-4 focus:ring-[#3B96D2]/10"
              placeholder="Buscar reservas..."
            />
          </div>

          {erro && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{erro}</div>}

          {carregando ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">Carregando reservas...</div>
          ) : reservas.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reservas.map((reserva) => (
                <div key={reserva._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Reserva</p>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {reserva.produto?.produto || 'Jet ski reservado'}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold">Cliente:</span> {reserva.usuario?.email || reserva.cpf || 'Não informado'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Local:</span> {reserva.produto?.local || 'A combinar'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Data:</span>{' '}
                    {reserva.data ? new Date(reserva.data).toLocaleDateString('pt-BR') : 'A definir'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Nenhuma reserva encontrada.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}