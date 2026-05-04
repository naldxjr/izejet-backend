import { MapPin, MoreVertical, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function JetSkiCard({ id, tag, titulo, local, preco, imagem, onDelete }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    if (onDelete && window.confirm('Tem certeza que deseja excluir este jet ski?')) {
      onDelete(id);
    }
    setMenuAberto(false);
  };

  return (
    <div className="relative">
    <Link to={`/jetski/${id}`} className="block bg-white rounded-3xl overflow-hidden shadow-sm mb-5 border border-gray-100 hover:shadow-md transition">
      <div className="relative h-48">
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#0D253F] text-xs font-bold px-3 py-1.5 rounded-lg z-10">
          {tag}
        </span>
        <img src={imagem} alt={titulo} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{titulo}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={16} className="mr-1 text-[#3B96D2]" />
          {local}
        </div>
        <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">A partir de</span>
          <span className="text-xl font-black text-[#3B96D2]">{preco}</span>
        </div>
      </div>
    </Link>
    {onDelete && (
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => { e.preventDefault(); setMenuAberto(!menuAberto); }}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition z-20"
          title="Opções"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>
        {menuAberto && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-4 py-2 rounded-lg transition first:rounded-t-lg last:rounded-b-lg"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        )}
      </div>
    )}
    </div>
  );
}