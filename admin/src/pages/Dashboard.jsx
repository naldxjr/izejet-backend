import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, X, Anchor, CalendarCheck, Clock, TrendingUp,
  Search, CalendarDays, LayoutGrid, Ship, PlusCircle, ShieldCheck
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    totalJetskis: 0,
    reservasPendentes: 0,
    totalReservas: 0
  });

  const [reservas, setReservas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const buscarDados = async () => {
      setCarregando(true);
      setErro("");

      try {
        const resultados = await Promise.allSettled([
          api.get("/usuarios/todos"),
          api.get("/catalogo"),
          api.get("/reservas")
        ]);

        let totalClientes = 0;
        let totalJetskis = 0;
        let reservasPendentes = 0;
        let totalReservas = 0;
        let listaReservas = [];

        if (resultados[0].status === "fulfilled" && resultados[0].value?.data && Array.isArray(resultados[0].value.data)) {
          totalClientes = resultados[0].value.data.filter(u => u && u.cargo !== "admin").length;
        }
        if (resultados[1].status === "fulfilled" && resultados[1].value?.data && Array.isArray(resultados[1].value.data)) {
          totalJetskis = resultados[1].value.data.length;
        }
        if (resultados[2].status === "fulfilled" && resultados[2].value?.data && Array.isArray(resultados[2].value.data)) {
          const dadosReservas = resultados[2].value.data;
          reservasPendentes = dadosReservas.filter(r => r && r.status === "pendente").length;
          totalReservas = dadosReservas.length;
          listaReservas = dadosReservas;
        }

        if (resultados.every(r => r.status === "rejected")) {
          setErro("Falha crítica ao obter dados da infraestrutura.");
        }

        setMetricas({ totalClientes, totalJetskis, reservasPendentes, totalReservas });
        setReservas(listaReservas);
      } catch (error) {
        setErro("Erro interno ao processar painel operacional.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  const reservasFiltradas = useMemo(() => {
    if (!Array.isArray(reservas)) return [];
    return reservas.filter((reserva) => {
      if (!reserva) return false;
      if (!busca) return true;

      const termo = busca.toLowerCase().trim();
      const nomeJetSki = String(reserva.produto?.produto || "").toLowerCase();
      const emailCliente = String(reserva.usuario?.email || "").toLowerCase();
      const nomeCliente = String(reserva.usuario?.nome || "").toLowerCase();

      const cpfReservaLimpo = String(reserva.cpf || reserva.usuario?.cpf || "").replace(/\D/g, "");
      const buscaCpfLimpo = termo.replace(/\D/g, "");

      return (
        nomeJetSki.includes(termo) ||
        emailCliente.includes(termo) ||
        nomeCliente.includes(termo) ||
        (buscaCpfLimpo && cpfReservaLimpo.includes(buscaCpfLimpo)) ||
        String(reserva.status || "pendente").toLowerCase().includes(termo)
      );
    });
  }, [reservas, busca]);

  const cardsMetricas = [
    { titulo: "Clientes Ativos", valor: metricas.totalClientes, icone: <Users size={18} />, bgIcone: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', rota: '/perfis' },
    { titulo: "Frota Cadastrada", valor: metricas.totalJetskis, icone: <Anchor size={18} />, bgIcone: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', rota: '/catalogo' },
    { titulo: "Agendamentos Pendentes", valor: metricas.reservasPendentes, icone: <Clock size={18} />, bgIcone: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', rota: '/reservas' },
    { titulo: "Total de Saídas", valor: metricas.totalReservas, icone: <CalendarCheck size={18} />, bgIcone: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', rota: '/reservas' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Console de Operações</h1>
            <p className="text-sm text-gray-400 mt-1">Monitoramento de ativos e controle de cotas em tempo real.</p>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 bg-[#111827] border border-gray-800 rounded-lg text-cyan-400 self-start md:self-auto">
            Ambiente Seguro Admin
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cardsMetricas.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.rota)}
              className="bg-[#111827]/60 backdrop-blur-md p-5 rounded-xl border border-gray-800/80 shadow-xl hover:border-gray-700/80 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className={`p-2.5 rounded-lg ${card.bgIcone}`}>
                  {card.icone}
                </div>
                <TrendingUp size={16} className="text-gray-700 group-hover:text-cyan-500 transition" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.titulo}</p>
                <h2 className="text-2xl font-bold mt-1 text-white tracking-tight">
                  {carregando ? <div className="w-12 h-6 bg-gray-800 rounded animate-pulse mt-1" /> : card.valor}
                </h2>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Ações Operacionais Rápidas</h2>
              <p className="text-xs text-gray-400 mt-0.5">Atalhos de gerenciamento do ecossistema.</p>
            </div>
            <Link to="/catalogo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 shadow-md shadow-cyan-600/10">
              <LayoutGrid size={14} />
              Gerenciar Catálogo
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { to: '/catalogo', icone: <CalendarDays size={18} />, label: 'Criar Reserva' },
              { to: '/reservas', icone: <Clock size={18} />, label: 'Ver Reservas' },
              { to: '/catalogo', icone: <Ship size={18} />, label: 'Frota Ativa' },
              { to: token ? '/catalogo/novo' : '/login', icone: <PlusCircle size={18} />, label: 'Adicionar Jet' },
              { to: '/perfis', icone: <Users size={18} />, label: 'Lista Clientes' },
              { to: '/gestao-admins', icone: <ShieldCheck size={18} />, label: 'Segurança/Admins' }
            ].map((item, idx) => (
              <Link key={idx} to={item.to} className="rounded-xl border border-gray-800/60 bg-[#0b0f19]/60 p-4 transition hover:border-gray-700 hover:bg-[#0b0f19] flex flex-col items-center text-center group">
                <div className="text-gray-400 group-hover:text-cyan-400 transition mb-2">
                  {item.icone}
                </div>
                <p className="text-xs font-medium text-gray-300 group-hover:text-white transition">{item.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-base font-bold text-white tracking-tight">Painel Consolidado de Reservas</h2>
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] py-2 pl-9 pr-8 text-xs text-white placeholder-gray-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                placeholder="Buscar cliente, CPF ou Jet Ski..."
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500 hover:text-gray-300">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {erro && <div className="mb-5 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 text-center font-medium">{erro}</div>}

          {carregando ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-800 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : reservasFiltradas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reservasFiltradas
                .filter((reserva) => reserva && reserva._id)
                .slice(0, 9)
                .map((reserva) => (
                  <div key={reserva._id} className="rounded-xl border border-gray-800/60 bg-[#0b0f19]/40 p-4 hover:border-gray-700/60 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          reserva.status === "aprovada" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          reserva.status === "rejeitada" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {reserva.status || "Pendente"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                        {reserva.produto?.produto || "Ativo Hidro-Náutico"}
                      </h3>
                      <div className="mt-3 space-y-1 text-xs text-gray-400">
                        <p className="truncate"><span className="text-gray-500 font-medium">Capitão:</span> {reserva.usuario?.nome || reserva.usuario?.email || reserva.cpf}</p>
                        <p><span className="text-gray-500 font-medium">Data de Saída:</span> {reserva.data ? new Date(reserva.data).toLocaleDateString("pt-BR") : "Pendente"}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-12 text-center flex flex-col items-center justify-center">
              <Search size={24} className="mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum registro localizado para os critérios aplicados.</p>
              <button onClick={() => setBusca("")} className="mt-3 text-xs font-bold text-cyan-400 hover:underline">
                Limpar Filtros
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}