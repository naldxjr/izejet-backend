const mongoose = require("mongoose");

const CatalogoSchema = new mongoose.Schema({
  produto: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  imagem: {
    type: String,
    trim: true
  },
  local: {
    type: String,
    trim: true
  },
  tag: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Catalogo", CatalogoSchema);