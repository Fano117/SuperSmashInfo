const express = require('express');
const router = express.Router();
const { DojoRifa } = require('../models');

// POST /api/dojo-rifa - Guardar una rifa terminada
router.post('/', async (req, res) => {
  try {
    const { nombre, resultados } = req.body;

    if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
      return res.status(400).json({ error: 'Se requieren resultados para guardar la rifa' });
    }

    const nuevaRifa = new DojoRifa({
      nombre: nombre || `Rifa del Dojo - ${new Date().toLocaleDateString()}`,
      resultados: resultados,
      totalCosas: resultados.length
    });

    await nuevaRifa.save();

    res.status(201).json({
      message: 'Rifa guardada exitosamente',
      rifa: nuevaRifa
    });
  } catch (error) {
    console.error('Error al guardar rifa:', error);
    res.status(500).json({ error: 'Error al guardar la rifa' });
  }
});

// GET /api/dojo-rifa/ultima - Obtener la última rifa guardada
router.get('/ultima', async (req, res) => {
  try {
    const ultimaRifa = await DojoRifa.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    if (!ultimaRifa) {
      return res.status(404).json({ error: 'No hay rifas guardadas' });
    }

    res.json(ultimaRifa);
  } catch (error) {
    console.error('Error al obtener última rifa:', error);
    res.status(500).json({ error: 'Error al obtener la última rifa' });
  }
});

// GET /api/dojo-rifa - Obtener todas las rifas (historial)
router.get('/', async (req, res) => {
  try {
    const rifas = await DojoRifa.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(rifas);
  } catch (error) {
    console.error('Error al obtener rifas:', error);
    res.status(500).json({ error: 'Error al obtener las rifas' });
  }
});

// DELETE /api/dojo-rifa/:id - Eliminar una rifa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await DojoRifa.findByIdAndDelete(id);
    res.json({ message: 'Rifa eliminada' });
  } catch (error) {
    console.error('Error al eliminar rifa:', error);
    res.status(500).json({ error: 'Error al eliminar la rifa' });
  }
});

module.exports = router;
