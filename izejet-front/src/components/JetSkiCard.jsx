import { MapPin, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function JetSkiCard({ id, tag, titulo, local, preco, imagem, onDelete, onEdit }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
    setMenuAberto(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (onEdit) {
      onEdit();
    }
    setMenuAberto(false);
  };

  return (
    <div className="relative group">
      <Link to={`/jetski/${id}`} className="block bg-[#111827]/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800/60 hover:border-gray-700/80 transition shadow-xl h-full flex flex-col justify-between">
        <div>
          <div className="relative h-44 w-full bg-[#0b0f19]">
            <span className="absolute top-3 left-3 bg-[#111827]/90 border border-gray-800 text-cyan-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md z-10 backdrop-blur-sm">
              {tag}
            </span>
            <img 
              src={imagem || "https://cdn.paytour.com.br/assets/images/passeios-2000295/adfba342517735e729a50e20eea7bd83/WhatsApp%20Image%202025-02-26%20at%2020.05.02_optimized.webp"} 
              alt={titulo} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1 mb-1">{titulo}</h3>
            <div className="flex items-center text-gray-400 text-xs">
              <MapPin size={12} className="mr-1 text-cyan-400" />
              <span className="truncate">{local || 'Hangar Principal'}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-center pt-3 border-t border-gray-800/60">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Avaliação Fração</span>
            <span className="text-sm font-bold text-cyan-400">{preco}</span>
          </div>
        </div>
      </Link>

      {(onDelete || onEdit) && (
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={(e) => { e.preventDefault(); setMenuAberto(!menuAberto); }}
            className="bg-[#111827]/90 border border-gray-800 p-1.5 rounded-lg text-gray-400 hover:text-white backdrop-blur-sm transition shadow-md"
            title="Opções Administrativas"
          >
            <MoreVertical size={14} />
          </button>
          
          {menuAberto && (
            <div className="absolute top-full right-0 mt-1 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl z-40 w-32 overflow-hidden animate-fade-in">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 text-gray-300 hover:bg-gray-800/60 w-full px-3 py-2.5 transition border-b border-gray-800 text-left text-xs font-medium"
                >
                  <Edit size={12} className="text-cyan-400" />
                  <span>Editar Ativo</span>
                </button>
              )}

              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 w-full px-3 py-2.5 transition text-left text-xs font-medium"
                >
                  <Trash2 size={12} />
                  <span>Excluir Ativo</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}