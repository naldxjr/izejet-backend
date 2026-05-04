import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Contact, Mail, Lock, UserPlus } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

export default function Cadastro() {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const fazerCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      await api.post('/usuarios/register', {
        email,
        senha,
        cpf
      });
      
      navigate('/login');
    } catch (error) {
      setErro(error.response?.data?.msg || 'Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />
      <main className="max-w-md mx-auto px-4 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-[#0D253F]">Crie sua conta</h1>
            <p className="text-sm text-gray-500 mt-1">Junte-se à IzeJet</p>
          </div>

          {erro && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {erro}
            </div>
          )}

          <form onSubmit={fazerCadastro} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Contact size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B96D2] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3B96D2] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 mt-6"
            >
              <UserPlus size={20} />
              Cadastrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#3B96D2] font-bold hover:underline">
              Faça login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}