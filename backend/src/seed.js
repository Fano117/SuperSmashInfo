require('dotenv').config();
const mongoose = require('mongoose');
const { Usuario, Banco } = require('../models');

const USUARIOS_INICIALES = [
  { nombre: 'CHINO', dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0, deuda: 0 },
  { nombre: 'M.N', dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0, deuda: 0 },
  { nombre: 'M.B', dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0, deuda: 0 },
  { nombre: 'FANO', dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0, deuda: 0 },
];

async function seed() {
  try {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supersmashinfo';
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    console.log('Limpiando colecciones...');
    await Usuario.deleteMany({});
    await Banco.deleteMany({});

    // Crear usuarios iniciales
    console.log('Creando usuarios iniciales...');
    const usuarios = await Usuario.insertMany(USUARIOS_INICIALES);
    console.log(`✅ Creados ${usuarios.length} usuarios`);

    // Crear banco inicial
    console.log('Creando banco inicial...');
    const banco = await Banco.create({ total: 0 });
    console.log(`✅ Banco creado con total: $${banco.total}`);

    console.log('\n🎮 ¡Seed completado exitosamente!');
    console.log('\nUsuarios creados:');
    usuarios.forEach(u => console.log(`  - ${u.nombre} (ID: ${u._id})`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
