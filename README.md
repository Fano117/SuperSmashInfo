# SuperSmashInfo - Dojo Smash 2025 🎮

Aplicación de gestión de puntos de juego para Super Smash Bros con temática 8-bit retro.

## 🎯 Características

- ✅ Registro de conteo semanal de puntos por categoría
- 🎲 Minijuego de ruleta con sistema de apuestas
- 📊 Tabla global de clasificación
- 💰 Sistema de banco y registro de pagos
- 🎨 Diseño 8-bit inspirado en Super Smash Bros

## 📱 Tecnologías

### Frontend
- React Native con Expo
- TypeScript
- Context API para estado global
- Fuentes pixel: Press Start 2P, VT323

### Backend
- Node.js + Express
- MongoDB + Mongoose
- API REST completa

## 🚀 Instalación

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

### Frontend

```bash
npm install
npx expo start
```

Opciones:
- Presiona `i` para iOS
- Presiona `a` para Android
- Presiona `w` para web

## 📦 Estructura del Proyecto

```
/
├── app/                    # Pantallas de la app
│   └── (tabs)/            # Navegación por tabs
│       ├── index.tsx      # Inicio
│       ├── conteo.tsx     # Registro semanal
│       ├── minijuego.tsx  # Ruleta y apuestas
│       ├── tabla.tsx      # Tabla global
│       └── banco.tsx      # Banco Smash
├── components/            # Componentes reutilizables
│   ├── SmashButton.tsx   # Botón 8-bit
│   ├── SmashCard.tsx     # Tarjeta 8-bit
│   ├── PointInput.tsx    # Input de puntos
│   └── Ruleta.tsx        # Ruleta animada
├── constants/            # Constantes y tema
│   └── smashTheme.ts    # Colores y estilos 8-bit
├── context/             # Estado global
│   └── AppContext.tsx
├── services/            # API services
│   └── api.ts
├── types/               # TypeScript types
│   └── index.ts
└── backend/             # API Backend
    └── src/
        ├── models/      # Modelos MongoDB
        ├── routes/      # Rutas API
        └── index.js     # Servidor Express
```

## 🎮 Categorías de Puntos

- 🏛️ **Dojos**: Puntos principales
- 💀 **Pendejos**: Penalizaciones
- 🥤 **Chescos**: Bebidas
- 💔 **Mimidos**: Mimados
- ❓ **Castitontos**: Castigos tontos

## 🎨 Paleta de Colores

```javascript
// Fondos
primary: '#1a1a2e'      // Azul oscuro profundo
secondary: '#16213e'    // Azul marino
tertiary: '#0f3460'     // Azul intenso

// Acentos
accent: '#e94560'       // Rojo smash
fire: '#ff6b35'         // Naranja fuego
dojos: '#ffd700'        // Dorado
```

## 📡 API Endpoints

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

## 🎯 Uso

### 1. Registrar Conteo Semanal
1. Ve a la pestaña "CONTEO"
2. Ingresa puntos para cada usuario
3. Usa +/- o escribe directamente
4. Guarda el conteo

### 2. Crear Apuesta
1. Ve a "APUESTAS"
2. Selecciona modo (números o integrantes)
3. Elige participantes y tipo de punto
4. Crea la apuesta
5. Gira la ruleta

### 3. Ver Clasificación
1. Ve a "TABLA"
2. Visualiza ranking con medallas
3. Exporta a Excel si necesitas

### 4. Registrar Pagos
1. Ve a "BANCO"
2. Selecciona usuario
3. Ingresa monto
4. Registra el pago

## 🎨 Diseño 8-Bit

La aplicación usa un diseño retro 8-bit:
- Fuentes pixeladas (Press Start 2P)
- Colores vibrantes
- Bordes rectos sin redondeo
- Sombras duras (drop shadow)
- Iconos de categorías emoji
- Animaciones tipo arcade

## 🛠️ Scripts Disponibles

```bash
# Frontend
npm start          # Iniciar Expo
npm run android    # Correr en Android
npm run ios        # Correr en iOS
npm run web        # Correr en web

# Backend
npm run dev        # Servidor con nodemon
npm start          # Servidor producción
```

## 📝 Notas Importantes

- Los puntos pueden ser decimales (0.5, 0.25, etc.)
- Los puntos pueden ser negativos
- El total se calcula sumando todas las categorías
- Las apuestas modifican puntos en tiempo real
- Los integrantes iniciales son: CHINO, M.N, M.B, FANO

## 🤝 Contribuir

Esta aplicación es para uso personal del grupo de amigos. No se comercializa.

## 📄 Licencia

MIT License - Uso personal

---

**PRESS START** 🎮

