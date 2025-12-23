const express = require('express');
const router = express.Router();
const { RegistroSemanal, Usuario } = require('../models');

// GET /api/conteo-semanal - Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const registros = await RegistroSemanal.find()
      .populate('usuario', 'nombre')
      .sort({ semana: -1 });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/conteo-semanal/ultimas-dos-semanas - Obtener ultimas 2 semanas
router.get('/ultimas-dos-semanas', async (req, res) => {
  try {
    const dosSemanasAtras = new Date();
    dosSemanasAtras.setDate(dosSemanasAtras.getDate() - 14);

    const registros = await RegistroSemanal.find({
      semana: { $gte: dosSemanasAtras }
    })
      .populate('usuario', 'nombre')
      .sort({ semana: -1 });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/conteo-semanal - Registrar conteo semanal
router.post('/', async (req, res) => {
  try {
    const { usuarioId, semana, dojos, pendejos, mimidos, castitontos, chescos } = req.body;

    // Crear registro semanal
    const registro = new RegistroSemanal({
      usuario: usuarioId,
      semana: semana || new Date(),
      dojos: dojos || 0,
      pendejos: pendejos || 0,
      mimidos: mimidos || 0,
      castitontos: castitontos || 0,
      chescos: chescos || 0
    });

    await registro.save();

    // Actualizar totales del usuario
    const usuario = await Usuario.findById(usuarioId);
    if (usuario) {
      usuario.dojos += dojos || 0;
      usuario.pendejos += pendejos || 0;
      usuario.mimidos += mimidos || 0;
      usuario.castitontos += castitontos || 0;
      usuario.chescos += chescos || 0;
      await usuario.save();
    }

    const registroPopulado = await RegistroSemanal.findById(registro._id)
      .populate('usuario', 'nombre');

    res.status(201).json(registroPopulado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/conteo-semanal/batch - Registrar conteo para multiples usuarios
router.post('/batch', async (req, res) => {
  try {
    const { semana, registros } = req.body;
    const resultados = [];

    for (const reg of registros) {
      const registro = new RegistroSemanal({
        usuario: reg.usuarioId,
        semana: semana || new Date(),
        dojos: reg.dojos || 0,
        pendejos: reg.pendejos || 0,
        mimidos: reg.mimidos || 0,
        castitontos: reg.castitontos || 0,
        chescos: reg.chescos || 0
      });

      await registro.save();

      // Actualizar totales del usuario
      const usuario = await Usuario.findById(reg.usuarioId);
      if (usuario) {
        usuario.dojos += reg.dojos || 0;
        usuario.pendejos += reg.pendejos || 0;
        usuario.mimidos += reg.mimidos || 0;
        usuario.castitontos += reg.castitontos || 0;
        usuario.chescos += reg.chescos || 0;
        await usuario.save();
      }

      resultados.push(registro);
    }

    res.status(201).json(resultados);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
