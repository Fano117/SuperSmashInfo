const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Usuario, RegistroSemanal } = require('../models');

// Configurar almacenamiento de multer para fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nombre único: usuarioId-timestamp.extension
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

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

// POST /api/usuarios/:id/foto - Subir foto de perfil
router.post('/:id/foto', upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna foto' });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      // Eliminar archivo subido si el usuario no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar foto anterior si existe
    if (usuario.fotoUrl) {
      const oldPhotoPath = path.join(__dirname, '../../uploads/avatars', path.basename(usuario.fotoUrl));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Guardar la URL relativa de la foto
    const fotoUrl = `/uploads/avatars/${req.file.filename}`;
    usuario.fotoUrl = fotoUrl;
    await usuario.save();

    res.json({
      message: 'Foto subida correctamente',
      fotoUrl: fotoUrl,
      usuario
    });
  } catch (error) {
    // Eliminar archivo en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/usuarios/:id/foto - Eliminar foto de perfil
router.delete('/:id/foto', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.fotoUrl) {
      const photoPath = path.join(__dirname, '../../uploads/avatars', path.basename(usuario.fotoUrl));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      usuario.fotoUrl = null;
      await usuario.save();
    }

    res.json({ message: 'Foto eliminada', usuario });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
