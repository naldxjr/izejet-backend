import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0D253F] text-white py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div>
            <Link to="/" className="text-lg font-black tracking-wider">
              Ize<span className="text-[#3B96D2]">Jet</span>
            </Link>
            <p className="text-gray-400 text-xs mt-1">
              Reservas e catálogo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Phone size={14} className="text-[#3B96D2] flex-shrink-0" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Mail size={14} className="text-[#3B96D2] flex-shrink-0" />
              <span>contato@izejet.com.br</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 pt-3 text-center">
          <p className="text-gray-500 text-xs">
            &copy; 2026 IzeJet - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}