const mongoose = require('mongoose');

const registroSemanalSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  semana: {
    type: Date,
    required: true
  },
  dojos: {
    type: Number,
    default: 0
  },
  pendejos: {
    type: Number,
    default: 0
  },
  mimidos: {
    type: Number,
    default: 0
  },
  castitontos: {
    type: Number,
    default: 0
  },
  chescos: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RegistroSemanal', registroSemanalSchema);
