const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: { 
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
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
    enum: ["admin", "cliente"], 
    default: "cliente" 
  },
  resetToken: { 
    type: String,
    index: { sparse: true }
  }, 
  resetTokenExpiracao: { 
    type: Date 
  }
}, {
  timestamps: true,
  collection: "usuarios"
});

module.exports = mongoose.model("Usuario", UsuarioSchema);