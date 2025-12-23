const mongoose = require('mongoose');

const bancoSchema = new mongoose.Schema({
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banco', bancoSchema);
