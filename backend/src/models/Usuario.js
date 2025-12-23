const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    unique: true,
    trim: true
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
  deuda: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: 'mario'
  },
  fotoUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual para calcular el total de puntos
// Dojos suman, pendejos/mimidos/castitontos restan, chescos son neutrales
usuarioSchema.virtual('total').get(function() {
  return this.dojos - this.pendejos - this.mimidos - this.castitontos;
  // chescos no afectan el total
});

usuarioSchema.set('toJSON', { virtuals: true });
usuarioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
