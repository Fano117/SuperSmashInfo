# SuperSmashInfo - Dojo Smash 2025

Aplicación de gestión de puntos de juego para Super Smash Bros con temática 8-bit retro.

## Estructura del Proyecto

```
repo/
│
├── backend/          # API REST con Node.js + Express + MongoDB
│   ├── package.json
│   ├── src/
│   │   ├── models/   # Modelos MongoDB
│   │   ├── routes/   # Rutas API
│   │   └── index.js  # Servidor Express
│   └── .env
│
├── mobile/           # App móvil con Expo + React Native
│   ├── package.json
│   ├── app.json
│   ├── app/          # Pantallas (tabs)
│   ├── components/   # Componentes reutilizables
│   ├── context/      # Estado global
│   ├── services/     # API services
│   └── types/        # TypeScript types
│
└── README.md
```

## Características

- Registro de conteo semanal de puntos por categoría
- Minijuego de ruleta con sistema de apuestas
- Tabla global de clasificación
- Sistema de banco y registro de pagos
- Diseño 8-bit inspirado en Super Smash Bros

## Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- API REST completa

### Mobile (Frontend)
- React Native con Expo
- TypeScript
- Context API para estado global
- Fuentes pixel: Press Start 2P, VT323

## Instalación

### Requisitos Previos
- Node.js 18+
- MongoDB (local o cloud)
- Expo CLI

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu conexión MongoDB
npm run dev
```

El servidor correrá en `http://localhost:3000`

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Opciones:
- Presiona `i` para iOS
- Presiona `a` para Android
- Presiona `w` para web

## API Endpoints

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id/puntos` - Actualizar puntos

### Conteo Semanal
- `GET /api/conteo-semanal` - Obtener registros
- `POST /api/conteo-semanal/batch` - Registrar lote

### Tabla Global
- `GET /api/tabla-global` - Tabla de clasificación
- `GET /api/tabla-global/exportar` - Exportar Excel

### Banco
- `GET /api/banco` - Total del banco
- `POST /api/banco/pago` - Registrar pago
- `GET /api/banco/usuarios` - Deudas por usuario

### Apuestas
- `POST /api/apuestas` - Crear apuesta
- `POST /api/apuestas/:id/resolver` - Resolver apuesta

## Scripts Disponibles

```bash
# Mobile
cd mobile
npm start          # Iniciar Expo
npm run android    # Correr en Android
npm run ios        # Correr en iOS
npm run web        # Correr en web

# Backend
cd backend
npm run dev        # Servidor con nodemon
npm start          # Servidor producción
```

## Licencia

MIT License - Uso personal
