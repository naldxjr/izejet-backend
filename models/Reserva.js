const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: false
  },
  perfil: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Perfil",
    required: false
  },
  cpf: {
    type: String,
    required: true,
    trim: true
  },
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catalogo",
    required: true
  },
  data: {
    type: Date,
    required: false
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  status: { 
    type: String, 
    enum: ['pendente', 'aprovada', 'rejeitada'], 
    default: 'pendente' },
}, {
  timestamps: true
});

module.exports = mongoose.model("Reserva", ReservaSchema);