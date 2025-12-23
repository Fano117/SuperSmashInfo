# SuperSmashInfo Backend

API REST para la gestión de puntos de juego de Super Smash Bros.

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

Copia el archivo de ejemplo y configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tu configuración:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/supersmashinfo
NODE_ENV=development
```

## 🗄️ Base de Datos

### Inicializar usuarios y banco

```bash
npm run seed
```

Este comando creará:
- 4 usuarios iniciales: CHINO, M.N, M.B, FANO
- Banco con saldo inicial de $0

## 🏃 Ejecutar

### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Usuarios
- `GET /api/usuarios` - Listar todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `PUT /api/usuarios/:id/puntos` - Actualizar puntos del usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `GET /api/usuarios/:id/historial` - Historial del usuario

### Conteo Semanal
- `GET /api/conteo-semanal` - Obtener todos los registros
- `GET /api/conteo-semanal/ultimas-dos-semanas` - Últimas 2 semanas
- `POST /api/conteo-semanal` - Registrar conteo individual
- `POST /api/conteo-semanal/batch` - Registrar conteo por lotes

### Tabla Global
- `GET /api/tabla-global` - Obtener tabla de clasificación
- `GET /api/tabla-global/resumen` - Resumen de usuarios
- `GET /api/tabla-global/exportar` - Exportar a Excel

### Banco
- `GET /api/banco` - Obtener información del banco
- `POST /api/banco/pago` - Registrar pago
- `GET /api/banco/historial` - Historial de transacciones
- `GET /api/banco/usuarios` - Deudas por usuario

### Apuestas
- `GET /api/apuestas` - Listar apuestas pendientes
- `GET /api/apuestas/historial` - Historial de apuestas
- `POST /api/apuestas` - Crear nueva apuesta
- `POST /api/apuestas/:id/resolver` - Resolver apuesta
- `DELETE /api/apuestas/:id` - Cancelar apuesta

## 📊 Modelos de Datos

### Usuario
```javascript
{
  nombre: String,
  dojos: Number,
  pendejos: Number,
  mimidos: Number,
  castitontos: Number,
  chescos: Number,
  deuda: Number,
  total: Number (virtual)
}
```

### Banco
```javascript
{
  total: Number
}
```

### RegistroSemanal
```javascript
{
  usuario: ObjectId,
  semana: String,
  dojos: Number,
  pendejos: Number,
  mimidos: Number,
  castitontos: Number,
  chescos: Number
}
```

### Transaccion
```javascript
{
  usuario: ObjectId,
  monto: Number,
  tipo: 'pago' | 'retiro',
  descripcion: String
}
```

### Apuesta
```javascript
{
  participantes: [ObjectId],
  tipoPunto: 'dojos' | 'pendejos' | 'chescos' | 'mimidos' | 'castitontos',
  cantidad: Number,
  ganador: ObjectId,
  estado: 'pendiente' | 'resuelta' | 'cancelada'
}
```

## 🛠️ Tecnologías

- **Express**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **CORS**: Cross-Origin Resource Sharing
- **XLSX**: Exportación de Excel
- **Express Validator**: Validación de datos

## 📝 Notas

- El servidor usa CORS para permitir peticiones desde el frontend
- Todos los errores se manejan con middleware centralizado
- Los puntos soportan decimales y negativos
- Las transacciones del banco están auditadas con timestamps
