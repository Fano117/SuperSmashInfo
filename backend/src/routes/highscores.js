const express = require('express');
const router = express.Router();
const { Highscore, Usuario } = require('../models');

// Obtener top 10 highscores de un juego
router.get('/:juego', async (req, res) => {
  try {
    const { juego } = req.params;
    const juegosValidos = ['flappy-yoshi', 'snake', 'tetris', 'pacman'];

    if (!juegosValidos.includes(juego)) {
      return res.status(400).json({ error: 'Juego no valido' });
    }

    const highscores = await Highscore.find({ juego })
      .populate('usuario', 'nombre avatar fotoUrl')
      .sort({ puntuacion: -1 })
      .limit(10);

    res.json(highscores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener highscore de un usuario en un juego especifico
router.get('/:juego/usuario/:usuarioId', async (req, res) => {
  try {
    const { juego, usuarioId } = req.params;

    const highscore = await Highscore.findOne({ juego, usuario: usuarioId })
      .populate('usuario', 'nombre avatar fotoUrl');

    if (!highscore) {
      return res.json({ puntuacion: 0 });
    }

    res.json(highscore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener el highscore global (el mas alto) de un juego
router.get('/:juego/global', async (req, res) => {
  try {
    const { juego } = req.params;

    const highscore = await Highscore.findOne({ juego })
      .populate('usuario', 'nombre avatar fotoUrl')
      .sort({ puntuacion: -1 });

    if (!highscore) {
      return res.json({ puntuacion: 0 });
    }

    res.json(highscore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guardar o actualizar highscore
router.post('/', async (req, res) => {
  try {
    const { juego, usuarioId, puntuacion } = req.body;

    if (!juego || !usuarioId || puntuacion === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar highscore existente
    let highscore = await Highscore.findOne({ juego, usuario: usuarioId });

    if (highscore) {
      // Solo actualizar si la nueva puntuacion es mayor
      if (puntuacion > highscore.puntuacion) {
        highscore.puntuacion = puntuacion;
        await highscore.save();
      }
    } else {
      // Crear nuevo highscore
      highscore = await Highscore.create({
        juego,
        usuario: usuarioId,
        puntuacion
      });
    }

    // Retornar el highscore actualizado con datos del usuario
    const resultado = await Highscore.findById(highscore._id)
      .populate('usuario', 'nombre avatar fotoUrl');

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los highscores de todos los juegos (resumen)
router.get('/', async (req, res) => {
  try {
    const juegos = ['flappy-yoshi', 'snake', 'tetris', 'pacman'];
    const resumen = {};

    for (const juego of juegos) {
      const top = await Highscore.findOne({ juego })
        .populate('usuario', 'nombre avatar fotoUrl')
        .sort({ puntuacion: -1 });

      resumen[juego] = top || { puntuacion: 0 };
    }

    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
