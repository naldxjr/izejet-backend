import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, Search, X, Trash2, CalendarCheck, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import api from "../services/api";

export default function Perfis() {
  const [perfis, setPerfis] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [mostraFormulario, setMostraFormulario] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [excluindoId, setExcluindoId] = useState("");
  const navigate = useNavigate();

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [usuariosResposta, reservasResposta] = await Promise.all([
          api.get("/usuarios/todos"),
          api.get("/reservas")
        ]);

        const usuariosValidos = Array.isArray(usuariosResposta.data) 
          ? usuariosResposta.data.filter(u => u && u._id).reverse() 
          : [];
          
        const reservasValidas = Array.isArray(reservasResposta.data) 
          ? reservasResposta.data.filter(r => r && r._id) 
          : [];

        setPerfis(usuariosValidos);
        setReservas(reservasValidas);
      } catch (error) {
        setErro("Erro ao carregar os dados da página.");
        toast.error("Não foi possível carregar os perfis e históricos.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  const handleCriarPerfil = async (e) => {
    e.preventDefault();

    if (!cpf || !nome || !email || !senha) {
      toast.error("Preencha os dados.");
      return;
    }

    if (cpf.length < 14) {
      toast.error("CPF incompleto.");
      return;
    }

    setEnviando(true);

    try {
      await api.post("/usuarios/register", {
        nome: nome.trim(),
        cpf,
        email: String(email).toLowerCase().trim(),
        senha
      });
      toast.success("Perfil criado com sucesso!");
      setNome("");
      setCpf("");
      setEmail("");
      setSenha("");
      setMostraFormulario(false);

      const resposta = await api.get("/usuarios/todos");
      const perfisAtualizados = Array.isArray(resposta.data) 
        ? resposta.data.filter(u => u && u._id).reverse() 
        : [];
      setPerfis(perfisAtualizados);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Erro ao criar perfil.");
    } finally {
      setEnviando(false);
    }
  };

  const handleExcluirUsuario = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este usuário definitivamente?");
    if (!confirmar) return;

    setExcluindoId(id);

    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso!");
      setPerfis(prev => prev.filter(p => p && p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.msg || "Erro ao excluir perfil.");
    } finally {
      setExcluindoId("");
    }
  };

  const perfisFiltrados = useMemo(() => {
    if (!Array.isArray(perfis)) return [];
    return perfis.filter((perfil) => {
      if (!perfil || !perfil._id) return false;
      if (!busca) return true;
      const termo = busca.toLowerCase().trim();
      return (
        String(perfil.nome || "").toLowerCase().includes(termo) ||
        String(perfil.cpf || "").toLowerCase().includes(termo) ||
        String(perfil.email || "").toLowerCase().includes(termo)
      );
    });
  }, [perfis, busca]);

  const contarReservasDoUsuario = useCallback((perfil) => {
    if (!perfil || !perfil._id || !Array.isArray(reservas)) return 0;
    
    return reservas.filter(r => {
      if (!r || !r.usuario) return false;
      const idNaReserva = r.usuario._id || r.usuario.id || r.usuario;
      const bateuId = String(idNaReserva) === String(perfil._id);

      const cpfReservaLimpo = r.cpf ? r.cpf.replace(/\D/g, "") : "";
      const cpfPerfilLimpo = perfil.cpf ? perfil.cpf.replace(/\D/g, "") : "";
      const bateuCpf = cpfReservaLimpo && cpfPerfilLimpo && cpfReservaLimpo === cpfPerfilLimpo;

      const emailNaReserva = r.usuario?.email || r.email;
      const bateuEmail = emailNaReserva && perfil.email && emailNaReserva.toLowerCase() === perfil.email.toLowerCase();

      return bateuId || bateuCpf || bateuEmail;
    }).length;
  }, [reservas]);

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white overflow-x-hidden flex flex-col">
      <Header mostrarVoltar={true} onVoltar={() => navigate("/")} />

      {mostraFormulario && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white">
                <Users size={20} className="text-cyan-400" />
                <h2 className="text-base font-bold tracking-tight">Vincular Novo Cliente</h2>
              </div>
              <button
                onClick={() => setMostraFormulario(false)}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCriarPerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  maxLength="14"
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Senha de Acesso</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-white outline-none text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan-500/10"
              >
                {enviando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Registrar Membro</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <section className="bg-[#111827]/40 backdrop-blur-md border border-gray-800/60 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Painel de Clientes</h1>
              <p className="text-xs text-gray-400 mt-0.5">Gerenciamento e auditoria de cotistas e usuários da plataforma.</p>
            </div>

            <button 
              onClick={() => setMostraFormulario(true)} 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-500 shadow-md shadow-cyan-600/10 self-start sm:self-auto"
            >
              <UserPlus size={14} />
              <span>Criar Cliente</span>
            </button>
          </div>

          <div className="relative w-full mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={14} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
              placeholder="Filtrar clientes por nome, CPF ou e-mail..."
            />
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
              <span className="text-xs text-gray-500">Sincronizando banco de cotistas...</span>
            </div>
          ) : perfisFiltrados.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {perfisFiltrados.map((perfil) => {
                const totalReservas = contarReservasDoUsuario(perfil);

                return (
                  <div key={perfil._id} className="rounded-xl border border-gray-800/60 bg-[#0b0f19]/40 p-5 hover:border-gray-700/60 transition shadow-xl flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-2.5 text-cyan-400">
                        <Users size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white tracking-tight">
                            {perfil.nome || "Membro do Clube"}
                          </h3>
                          {perfil.cargo === "admin" && (
                            <span className="bg-gray-800 text-cyan-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-gray-700">Admin</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-gray-400">
                          <p><span className="text-gray-500">CPF:</span> {perfil.cpf || "Não informado"}</p>
                          <p className="truncate"><span className="text-gray-500">E-mail:</span> {perfil.email || "Não informado"}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExcluirUsuario(perfil._id)}
                        disabled={excluindoId === perfil._id || perfil.cargo === "admin"}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-500/20 transition disabled:opacity-30"
                        title="Banir/Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarCheck size={14} className={totalReservas > 0 ? "text-emerald-400" : "text-gray-600"} />
                        <span className={totalReservas > 0 ? "font-semibold text-emerald-400" : "font-medium text-gray-500"}>
                          {totalReservas} {totalReservas === 1 ? "Reserva Registrada" : "Reservas Registradas"}
                        </span>
                      </div>

                      {totalReservas > 0 && (
                        <button
                          onClick={() => navigate("/reservas", { state: { buscarPor: perfil.cpf } })}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          Ver Histórico
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0b0f19]/20 py-16 text-center flex flex-col items-center justify-center">
              <Users size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum registro de cliente corresponde aos filtros aplicados.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}