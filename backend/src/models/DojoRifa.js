const mongoose = require('mongoose');

const resultadoSchema = new mongoose.Schema({
  cosa: {
    type: String,
    required: true
  },
  jugador: {
    type: String,
    required: true
  }
});

const dojoRifaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    default: 'Rifa del Dojo'
  },
  resultados: [resultadoSchema],
  totalCosas: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DojoRifa', dojoRifaSchema);
