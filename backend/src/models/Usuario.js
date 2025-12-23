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
  }
}, {
  timestamps: true
});

// Virtual para calcular el total de puntos
usuarioSchema.virtual('total').get(function() {
  return this.dojos + this.pendejos + this.mimidos + this.castitontos + this.chescos;
});

usuarioSchema.set('toJSON', { virtuals: true });
usuarioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
