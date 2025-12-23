const express = require('express');
const router = express.Router();
const { Apuesta, Usuario } = require('../models');

// GET /api/apuestas - Obtener todas las apuestas
router.get('/', async (req, res) => {
  try {
    const apuestas = await Apuesta.find()
      .populate('participantes', 'nombre')
      .populate('ganador', 'nombre')
      .sort({ createdAt: -1 });
    res.json(apuestas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/apuestas/historial - Obtener historial de apuestas
router.get('/historial', async (req, res) => {
  try {
    const apuestas = await Apuesta.find({ estado: 'resuelta' })
      .populate('participantes', 'nombre')
      .populate('ganador', 'nombre')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(apuestas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/apuestas - Crear nueva apuesta
router.post('/', async (req, res) => {
  try {
    const { participantes, tipoPunto, cantidad } = req.body;

    const apuesta = new Apuesta({
      participantes,
      tipoPunto,
      cantidad,
      estado: 'pendiente'
    });

    await apuesta.save();

    const apuestaPopulada = await Apuesta.findById(apuesta._id)
      .populate('participantes', 'nombre');

    res.status(201).json(apuestaPopulada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/apuestas/:id/resolver - Resolver apuesta
router.post('/:id/resolver', async (req, res) => {
  try {
    const { ganadorId } = req.body;
    const apuesta = await Apuesta.findById(req.params.id);

    if (!apuesta) {
      return res.status(404).json({ message: 'Apuesta no encontrada' });
    }

    if (apuesta.estado !== 'pendiente') {
      return res.status(400).json({ message: 'La apuesta ya fue resuelta' });
    }

    // Verificar que el ganador es participante
    if (!apuesta.participantes.includes(ganadorId)) {
      return res.status(400).json({ message: 'El ganador debe ser un participante' });
    }

    // Calcular puntos a transferir
    const perdedores = apuesta.participantes.filter(
      p => p.toString() !== ganadorId
    );
    const puntosGanados = apuesta.cantidad * perdedores.length;

    // Actualizar puntos de perdedores
    for (const perdedorId of perdedores) {
      const perdedor = await Usuario.findById(perdedorId);
      if (perdedor) {
        perdedor[apuesta.tipoPunto] -= apuesta.cantidad;
        await perdedor.save();
      }
    }

    // Actualizar puntos del ganador
    const ganador = await Usuario.findById(ganadorId);
    if (ganador) {
      ganador[apuesta.tipoPunto] += puntosGanados;
      await ganador.save();
    }

    // Marcar apuesta como resuelta
    apuesta.ganador = ganadorId;
    apuesta.estado = 'resuelta';
    await apuesta.save();

    const apuestaResuelta = await Apuesta.findById(apuesta._id)
      .populate('participantes', 'nombre')
      .populate('ganador', 'nombre');

    res.json(apuestaResuelta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/apuestas/:id - Cancelar apuesta
router.delete('/:id', async (req, res) => {
  try {
    const apuesta = await Apuesta.findById(req.params.id);

    if (!apuesta) {
      return res.status(404).json({ message: 'Apuesta no encontrada' });
    }

    if (apuesta.estado === 'resuelta') {
      return res.status(400).json({ message: 'No se puede cancelar una apuesta resuelta' });
    }

    apuesta.estado = 'cancelada';
    await apuesta.save();

    res.json({ message: 'Apuesta cancelada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
