import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import Dashboard from './pages/Dashboard';
import EditarJetSki from './pages/EditarJetSki';

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/" element={<RotaProtegida requerAdmin><Dashboard /></RotaProtegida>} />
        <Route path="/home" element={<RotaProtegida><Home /></RotaProtegida>} />
        <Route path="/jetski/:id" element={<RotaProtegida><Detalhes /></RotaProtegida>} />
        
        <Route path="/catalogo" element={<RotaProtegida requerAdmin><Catalogo /></RotaProtegida>} />
        <Route path="/catalogo/novo" element={<RotaProtegida requerAdmin><AdicionarJetski /></RotaProtegida>} />
        <Route path="/editar-jetski/:id" element={<RotaProtegida requerAdmin><EditarJetSki /></RotaProtegida>} />
        
        <Route path="/reservas" element={<RotaProtegida requerAdmin><Reservas /></RotaProtegida>} />
        <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
        <Route path="/perfis" element={<RotaProtegida requerAdmin><Perfis /></RotaProtegida>} />
        <Route path="/gestao-admins" element={<RotaProtegida requerAdmin><UsuariosAdmin /></RotaProtegida>} />

        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}