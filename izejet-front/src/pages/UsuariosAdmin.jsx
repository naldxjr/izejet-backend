import { useState } from 'react';
import { UserPlus, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UsuariosAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);

  const cadastrarAdmin = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      await api.post('/usuarios/register-admin', { email, senha, cpf });
      toast.success('Novo administrador cadastrado!');
      setEmail(''); setSenha(''); setCpf('');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao cadastrar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={32} className="text-[#3B96D2]" />
        <h1 className="text-2xl font-bold text-[#0D253F]">Gestão de Administradores</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm mb-6">
          Use este formulário para criar novos acessos administrativos para sua equipe.
        </p>

        <form onSubmit={cadastrarAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">E-mail Corporativo</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">CPF</label>
            <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full p-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Senha Temporária</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} className="w-full p-3 border rounded-xl" required />
          </div>

          <button 
            disabled={carregando}
            className="w-full bg-[#0D253F] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition"
          >
            <UserPlus size={18} />
            {carregando ? 'Cadastrando...' : 'Criar Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}