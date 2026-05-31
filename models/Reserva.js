const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  perfil: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Perfil"
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
    required: true
  },
  status: { 
    type: String, 
    enum: ["pendente", "aprovada", "rejeitada"], 
    default: "pendente" 
  }
}, {
  timestamps: true,
  collection: "reservas"
});

ReservaSchema.index({ produto: 1, data: 1, status: 1 });
ReservaSchema.index({ usuario: 1 });
ReservaSchema.index({ cpf: 1 });

module.exports = mongoose.model("Reserva", ReservaSchema);