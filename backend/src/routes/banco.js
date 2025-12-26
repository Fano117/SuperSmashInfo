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

// POST /api/banco/pago - Registrar pago (ahorro o deuda)
router.post('/pago', async (req, res) => {
  try {
    const { usuarioId, monto, descripcion, pagoDeuda } = req.body;

    // Determinar tipo y descripción según si es pago de deuda o ahorro
    const tipoPago = pagoDeuda ? 'pago_deuda' : 'pago';
    const desc = descripcion || (pagoDeuda ? 'Pago de deuda' : 'Pago de ahorro');

    // Crear transaccion
    const transaccion = new Transaccion({
      usuario: usuarioId,
      monto,
      tipo: tipoPago,
      descripcion: desc
    });
    await transaccion.save();

    // Actualizar banco con operación atómica para evitar race conditions
    const banco = await Banco.findOneAndUpdate(
      {},
      { $inc: { total: monto } },
      { new: true, upsert: true }
    );

    // Solo reducir deuda si es pago de deuda
    if (pagoDeuda) {
      await Usuario.findByIdAndUpdate(
        usuarioId,
        { $inc: { deuda: -monto } }
      );
      // Asegurar que la deuda no sea negativa
      await Usuario.updateOne(
        { _id: usuarioId, deuda: { $lt: 0 } },
        { $set: { deuda: 0 } }
      );
    }

    res.status(201).json({
      transaccion,
      bancoTotal: banco.total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/banco/gasto - Registrar gasto/retiro asociado a un usuario
router.post('/gasto', async (req, res) => {
  try {
    const { usuarioId, monto, descripcion } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ message: 'Debe seleccionar un usuario' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es requerida para gastos' });
    }

    // Verificar que hay suficiente saldo
    let banco = await Banco.findOne();
    if (!banco) {
      banco = await Banco.create({ total: 0 });
    }

    if (banco.total < monto) {
      return res.status(400).json({ message: 'Saldo insuficiente en el banco' });
    }

    // Crear transaccion de retiro asociada al usuario
    const transaccion = new Transaccion({
      usuario: usuarioId,
      monto,
      tipo: 'retiro',
      descripcion: descripcion.trim()
    });
    await transaccion.save();

    // Restar del banco
    banco = await Banco.findOneAndUpdate(
      {},
      { $inc: { total: -monto } },
      { new: true }
    );

    // Aumentar deuda del usuario (el gasto se le suma a su deuda)
    await Usuario.findByIdAndUpdate(
      usuarioId,
      { $inc: { deuda: monto } }
    );

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
      .populate('usuario', 'nombre avatar fotoUrl')
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
