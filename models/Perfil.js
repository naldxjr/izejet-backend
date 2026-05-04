const mongoose = require('mongoose');

const PerfilSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  nome: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  senha: {
    type: String
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telefone: {
    type: String
  },
  endereco: {
    type: String
  },
  licencaMotonauta: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'perfils'
});

PerfilSchema.index(
  { usuario: 1 },
  {
    unique: true,
    partialFilterExpression: { usuario: { $type: 'objectId' } }
  }
);

module.exports = mongoose.model('Perfil', PerfilSchema);