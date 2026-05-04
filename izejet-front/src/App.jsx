import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- IMPORTAÇÃO NOVA
import Home from './pages/Home';
import Login from './pages/Login';
import Reservas from './pages/Reservas';
import Perfil from './pages/Perfil';
import Perfis from './pages/Perfis';
import Catalogo from './pages/Catalogo';
import Cadastro from './pages/Cadastro';
import Detalhes from './pages/Detalhes';
import AdicionarJetski from './pages/AdicionarJetski';
import RotaProtegida from './components/RotaProtegida';
import UsuariosAdmin from './pages/UsuariosAdmin';

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      {/* O TOASTER FICA AQUI, FORA DAS ROTAS */}
      <Toaster position="top-center" reverseOrder={false} /> 
      
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<RotaProtegida><Home /></RotaProtegida>} />
        <Route path="/jetski/:id" element={<RotaProtegida><Detalhes /></RotaProtegida>} />
        <Route path="/catalogo/novo" element={<RotaProtegida><AdicionarJetski /></RotaProtegida>} />
        <Route path="/catalogo" element={<RotaProtegida><Catalogo /></RotaProtegida>} />
        <Route path="/reservas" element={<RotaProtegida><Reservas /></RotaProtegida>} />
        <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
        <Route path="/perfis" element={<RotaProtegida><Perfis /></RotaProtegida>} />
        <Route path="/gestao-admins" element={<RotaProtegida><UsuariosAdmin /></RotaProtegida>} />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}