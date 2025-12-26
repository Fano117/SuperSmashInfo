const express = require('express');
const router = express.Router();

const usuariosRoutes = require('./usuarios');
const conteoSemanalRoutes = require('./conteoSemanal');
const bancoRoutes = require('./banco');
const apuestasRoutes = require('./apuestas');
const tablaGlobalRoutes = require('./tablaGlobal');
const highscoresRoutes = require('./highscores');

router.use('/usuarios', usuariosRoutes);
router.use('/conteo-semanal', conteoSemanalRoutes);
router.use('/banco', bancoRoutes);
router.use('/apuestas', apuestasRoutes);
router.use('/tabla-global', tablaGlobalRoutes);
router.use('/highscores', highscoresRoutes);

module.exports = router;
