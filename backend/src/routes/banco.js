const express = require('express');
const router = express.Router();
const { Banco, Transaccion, Usuario } = require('../models');

// GET /api/banco - Obtener total del banco
router.get('/', async (req, res) => {
  try {
    let banco = await Banco.findOne();
    if (!banco) {
      banco = await Banco.create({ total: 0 });
    }
    res.json(banco);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/banco/pago - Registrar pago semanal
router.post('/pago', async (req, res) => {
  try {
    const { usuarioId, monto, descripcion } = req.body;

    // Crear transaccion
    const transaccion = new Transaccion({
      usuario: usuarioId,
      monto,
      tipo: 'pago',
      descripcion: descripcion || 'Pago semanal'
    });
    await transaccion.save();

    // Actualizar banco
    let banco = await Banco.findOne();
    if (!banco) {
      banco = new Banco({ total: 0 });
    }
    banco.total += monto;
    await banco.save();

    // Reducir deuda del usuario
    const usuario = await Usuario.findById(usuarioId);
    if (usuario) {
      usuario.deuda = Math.max(0, usuario.deuda - monto);
      await usuario.save();
    }

    res.status(201).json({
      transaccion,
      bancoTotal: banco.total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/banco/historial - Obtener historial de transacciones
router.get('/historial', async (req, res) => {
  try {
    const transacciones = await Transaccion.find()
      .populate('usuario', 'nombre')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/banco/usuarios - Obtener deudas/saldos por usuario
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('nombre deuda');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
