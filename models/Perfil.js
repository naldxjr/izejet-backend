const mongoose = require("mongoose");

const PerfilSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    unique: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  endereco: {
    type: String,
    required: true,
    trim: true
  },
  licencaMotonauta: {
    type: String,
    required: true,
    enum: ["Possui Arrais Amador", "Possui Motonauta", "Não possui"],
    default: "Não possui"
  }
}, {
  timestamps: true,
  collection: "perfis"
});

module.exports = mongoose.model("Perfil", PerfilSchema);