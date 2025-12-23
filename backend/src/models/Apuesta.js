const mongoose = require('mongoose');

const apuestaSchema = new mongoose.Schema({
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }],
  tipoPunto: {
    type: String,
    enum: ['dojos', 'pendejos', 'chescos', 'mimidos', 'castitontos'],
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  ganador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  estado: {
    type: String,
    enum: ['pendiente', 'resuelta', 'cancelada'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Apuesta', apuestaSchema);
