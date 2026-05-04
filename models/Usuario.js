const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: { 
    type: String },
  email: {
    type: String,
    required: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  cargo: { 
    type: String, 
    enum: ['admin', 'cliente'], 
    default: 'cliente' },
}, {
  timestamps: true
});

module.exports = mongoose.model("Usuario", UsuarioSchema);