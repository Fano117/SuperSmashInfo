const express = require('express');
const router = express.Router();
const { Usuario, RegistroSemanal } = require('../models');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nombre: 1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    const nuevoUsuario = await usuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/usuarios/:id/puntos - Actualizar puntos de usuario
router.put('/:id/puntos', async (req, res) => {
  try {
    const { dojos, pendejos, mimidos, castitontos, chescos } = req.body;
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (dojos !== undefined) usuario.dojos += dojos;
    if (pendejos !== undefined) usuario.pendejos += pendejos;
    if (mimidos !== undefined) usuario.mimidos += mimidos;
    if (castitontos !== undefined) usuario.castitontos += castitontos;
    if (chescos !== undefined) usuario.chescos += chescos;

    await usuario.save();
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/usuarios/:id/historial - Obtener historial de un usuario
router.get('/:id/historial', async (req, res) => {
  try {
    const registros = await RegistroSemanal.find({ usuario: req.params.id })
      .sort({ semana: -1 })
      .limit(10);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
