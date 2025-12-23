const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  tipo: {
    type: String,
    enum: ['pago', 'retiro'],
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaccion', transaccionSchema);
