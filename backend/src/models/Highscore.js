const mongoose = require('mongoose');

const highscoreSchema = new mongoose.Schema({
  juego: {
    type: String,
    required: [true, 'El nombre del juego es requerido'],
    enum: ['flappy-yoshi', 'snake', 'tetris', 'pacman']
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es requerido']
  },
  puntuacion: {
    type: Number,
    required: [true, 'La puntuacion es requerida'],
    min: 0
  }
}, {
  timestamps: true
});

// Indice compuesto para busquedas eficientes
highscoreSchema.index({ juego: 1, puntuacion: -1 });
highscoreSchema.index({ juego: 1, usuario: 1 }, { unique: true });

highscoreSchema.set('toJSON', { virtuals: true });
highscoreSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Highscore', highscoreSchema);
