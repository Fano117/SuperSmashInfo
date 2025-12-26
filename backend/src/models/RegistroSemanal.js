const mongoose = require('mongoose');

// Sub-esquema para historial de modificaciones
const modificacionSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  valoresAnteriores: {
    dojos: Number,
    pendejos: Number,
    mimidos: Number,
    castitontos: Number,
    chescos: Number
  },
  valoresNuevos: {
    dojos: Number,
    pendejos: Number,
    mimidos: Number,
    castitontos: Number,
    chescos: Number
  }
}, { _id: false });

const registroSemanalSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  semana: {
    type: String,
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
  },
  historialModificaciones: {
    type: [modificacionSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RegistroSemanal', registroSemanalSchema);
