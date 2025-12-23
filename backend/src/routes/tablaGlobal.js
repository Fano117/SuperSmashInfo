const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { Usuario, RegistroSemanal } = require('../models');

// GET /api/tabla-global - Obtener tabla con todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nombre: 1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tabla-global/resumen - Obtener resumen ultimas 2 semanas
router.get('/resumen', async (req, res) => {
  try {
    const dosSemanasAtras = new Date();
    dosSemanasAtras.setDate(dosSemanasAtras.getDate() - 14);

    const usuarios = await Usuario.find().sort({ nombre: 1 });
    const registros = await RegistroSemanal.find({
      semana: { $gte: dosSemanasAtras }
    }).populate('usuario', 'nombre');

    // Agrupar registros por usuario
    const resumen = usuarios.map(usuario => {
      const registrosUsuario = registros.filter(
        r => r.usuario._id.toString() === usuario._id.toString()
      );

      const sumaReciente = registrosUsuario.reduce((acc, r) => ({
        dojos: acc.dojos + r.dojos,
        pendejos: acc.pendejos + r.pendejos,
        mimidos: acc.mimidos + r.mimidos,
        castitontos: acc.castitontos + r.castitontos,
        chescos: acc.chescos + r.chescos
      }), { dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0 });

      return {
        usuario: usuario.nombre,
        totales: {
          dojos: usuario.dojos,
          pendejos: usuario.pendejos,
          mimidos: usuario.mimidos,
          castitontos: usuario.castitontos,
          chescos: usuario.chescos,
          total: usuario.total
        },
        ultimasDosSemanas: sumaReciente
      };
    });

    res.json(resumen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tabla-global/exportar - Exportar a Excel
router.get('/exportar', async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nombre: 1 });

    // Crear datos para Excel
    const data = [
      ['DOJO SMASH 2025'],
      [],
      ['', 'PENDEJOS', '', '', 'CHESCOS', '', '', 'MIMIDOS', '', '', 'CASTITONTOS', '', '', 'DOJOS', '', '', ''],
      ['', 'ACTUAL', 'TOTAL', '', 'ACTUAL', 'TOTAL', '', 'ACTUAL', 'TOTAL', '', 'ACTUAL', 'TOTAL', '', 'ACTUAL', 'TOTAL', '', '']
    ];

    usuarios.forEach(u => {
      data.push([
        u.nombre,
        u.pendejos, u.pendejos, '',
        u.chescos, u.chescos, '',
        u.mimidos, u.mimidos, '',
        u.castitontos, u.castitontos, '',
        u.dojos, u.dojos, '', ''
      ]);
    });

    data.push([]);
    data.push(['TOTAL']);
    usuarios.forEach(u => {
      data.push([u.nombre, u.total]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'SMASH 2025');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=SMASH_2025.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
