# Prompt para Generar Aplicacion SuperSmashInfo

## Descripcion General

Genera una aplicacion completa de gestion de puntos de juego para un grupo de amigos que juegan Super Smash Bros. La aplicacion debe ser desarrollada con **Expo (React Native)** para el frontend y un **backend con Node.js/Express + MongoDB**.

**IMPORTANTE:** El proyecto ya tiene la estructura base creada con modelos, rutas, servicios y tipos. Tu trabajo es implementar la logica completa de cada pantalla y componentes siguiendo el diseño especificado.

---

## Diseño Visual - Tematica Super Smash Bros 8-Bit

### Estetica General
La aplicacion debe tener una estetica **retro 8-bit/pixel art** inspirada en los juegos clasicos de Nintendo y las sagas representadas en Super Smash Bros. El diseño debe evocar nostalgia y la emocion de los juegos de pelea.

### Paleta de Colores Principal
```
- Fondo principal: #1a1a2e (azul oscuro profundo)
- Fondo secundario: #16213e (azul marino)
- Acento principal: #e94560 (rojo smash)
- Acento secundario: #0f3460 (azul intenso)
- Texto claro: #eee / #fff
- Texto secundario: #888
- Dorado/Puntos: #ffd700
- Verde victoria: #00ff00
- Naranja fuego: #ff6b35
```

### Tipografia
- Usar fuentes pixeladas/8-bit como:
  - "Press Start 2P" (Google Fonts)
  - "VT323"
  - "Silkscreen"
- Titulos grandes en estilo arcade
- Numeros con efecto de contador retro

### Elementos de Diseño por Pantalla

#### 1. Pantalla de Inicio
- **Header:** Logo "DOJO SMASH 2025" en estilo arcade con efecto de brillo/parpadeo
- **Fondo:** Patron de pixeles o siluetas 8-bit de personajes iconicos:
  - Mario (estrella, hongo)
  - Link (espada, escudo Hylian)
  - Pikachu (rayo)
  - Kirby (estrella warp)
  - Samus (casco)
  - Fox (arwing)
- **Tarjetas de estadisticas:** Estilo "ventana de seleccion de personaje" con bordes pixelados
- **Botones del menu:** Estilo botones de arcade con efecto de presionado
- **Animacion:** Particulas de estrellas o monedas flotando

#### 2. Registrar Conteo Semanal
- **Diseño de formulario:** Estilo "pantalla de resultados" de Smash Bros
- **Campos de entrada:** Cajas con bordes pixelados estilo NES
- **Iconos para cada tipo de punto:**
  - Dojos: Icono de dojo/templo pixelado
  - Pendejos: Icono de calavera o X roja
  - Mimidos: Icono de corazon partido
  - Castitontos: Icono de signo de interrogacion
  - Chescos: Icono de refresco/botella
- **Botones +/- :** Estilo D-pad de control
- **Animacion al guardar:** Efecto de "COMPLETE!" estilo juego retro

#### 3. Minijuego Robo de Puntos
- **Ruleta:** Diseño de ruleta estilo "rueda de la fortuna" con segmentos pixelados
  - Colores alternados vibrantes
  - Flecha indicadora estilo 8-bit
  - Animacion de giro con efecto de desaceleracion
  - Sonido de "tick tick tick" al girar
- **Seleccion de participantes:** Tarjetas de personaje estilo seleccion de luchador
  - Foto/avatar pixelado de cada integrante
  - Nombre con fuente arcade
  - Efecto de "READY!" al seleccionar
- **Resultado:** Explosion de pixeles con "WINNER!" o "K.O.!"
- **Referencias visuales:**
  - Fondo de escenario de Smash (Final Destination, Battlefield en 8-bit)
  - Porcentajes de daño estilo Smash
  - Iconos de items (Smash Ball, Home-Run Bat)

#### 4. Tabla Global / Integrantes
- **Diseño de tabla:** Estilo "leaderboard" de arcade
- **Encabezados:** Texto con efecto de neon/brillo
- **Filas de jugadores:**
  - Avatar pixelado a la izquierda
  - Barras de progreso para cada categoria
  - Posicion con medalla (1ro oro, 2do plata, 3ro bronce)
- **Efecto visual:**
  - El primer lugar tiene efecto de brillo/destello
  - Flechas animadas indicando subida/bajada de posicion
- **Boton de exportar:** Icono de disquete 8-bit

#### 5. Banco Smash
- **Diseño:** Estilo "tienda de juego" o "banco de monedas"
- **Total del banco:** Cofre del tesoro pixelado con monedas
- **Lista de deudas:** Estilo inventario de RPG
- **Iconos:**
  - Monedas doradas pixeladas
  - Billetes verdes 8-bit
  - Icono de bolsa de dinero
- **Animacion de pago:** Monedas cayendo y sonido de "cha-ching"

### Componentes Reutilizables

#### Botones
```
- Estilo arcade con bordes gruesos pixelados
- Efecto de presionado (desplazamiento hacia abajo)
- Colores vibrantes con gradientes simples
- Hover: brillo/destello
```

#### Tarjetas
```
- Bordes pixelados de 2-4px
- Esquinas en angulo recto (no redondeadas) o levemente pixeladas
- Sombra estilo drop shadow retro
- Fondo con patron sutil de pixeles
```

#### Inputs
```
- Estilo caja de texto NES/SNES
- Cursor parpadeante estilo terminal
- Bordes blancos sobre fondo oscuro
- Focus: borde brillante
```

#### Iconos de Navegacion (Tab Bar)
- Iconos 8-bit personalizados:
  - Inicio: Casa pixelada / Hongo de Mario
  - Conteo: Signo + en cuadro / Libro de puntuacion
  - Apuestas: Dado pixelado / Smash Ball
  - Tabla: Lista/Pergamino / Trofeo
  - Banco: Moneda / Cofre

### Animaciones Sugeridas
1. **Transiciones de pantalla:** Efecto de "wipe" horizontal estilo juego retro
2. **Carga de datos:** Barra de carga pixelada con porcentaje
3. **Exito:** Explosion de estrellas/confeti pixelado
4. **Error:** Pantalla de "GAME OVER" estilizada
5. **Numeros cambiando:** Efecto de contador rodante
6. **Hover/Press:** Escalado sutil con "pop"

### Referencias Visuales de Sagas
Incluir easter eggs y referencias a:
- **Mario:** Bloques de interrogacion, monedas, estrellas
- **Zelda:** Corazones, rupias, Triforce
- **Pokemon:** Pokebolas, rayos, estrellas
- **Kirby:** Estrellas warp, comida
- **Metroid:** Energia, misiles
- **F-Zero:** Velocimetros, fuego
- **Star Fox:** Arwings, laser
- **Fire Emblem:** Espadas, escudos

### Sonidos (Opcional)
- Beeps 8-bit para navegacion
- Fanfarria para victorias
- Sonido de monedas para pagos
- "Woosh" para la ruleta

---

## Estructura de Pantallas

La aplicacion tiene las siguientes pantallas principales (ya creadas como plantillas):

### 1. Pantalla de Inicio (app/(tabs)/index.tsx)
- Menu principal con navegacion a todas las funcionalidades
- Vista rapida del resumen de puntos
- Estadisticas: numero de integrantes y total del banco

### 2. Registrar Conteo Semanal (app/(tabs)/conteo.tsx)
- Formulario para registrar puntos semanales de cada integrante
- Tomar el formato del excel dependiendo el numero de integrantes
- Se suman: **dojos, pendejos, mimidos, castitontos, chescos**
- Opcion de poner cualquier numero decimal (enteros, medios 0.5, cuartos 0.25)
- Los campos deben permitir valores negativos y positivos

### 3. Minijuego Robo de Puntos (app/(tabs)/minijuego.tsx)
- **Ruleta customizable** de 1 a 10 campos con numeros
- Opcion de cambiar a **modo integrantes** que muestra los nombres de todos los integrantes
- Sistema de apuestas:
  - Se pueden hacer robos de dojos entre todos los integrantes o solo entre 2
  - Se puede apostar: dojos, chescos, pendejos, mimidos, castitontos
  - Los cambios se reflejan automaticamente en la tabla general

### 4. Tabla Global / Integrantes (app/(tabs)/tabla.tsx)
- Muestra el total de los resultados de las ultimas dos semanas registradas
- Vista de todos los integrantes con sus puntos actuales
- Columnas: Nombre, Pendejos, Chescos, Mimidos, Castitontos, Dojos, Total
- Opcion para descargar el excel en el mismo formato original

### 5. Banco Smash (app/(tabs)/banco.tsx)
- Registro de pago semanal por integrante
- Suma acumulada por integrante
- Total general del banco
- Historial de pagos

---

## Archivos Ya Implementados

### Backend (backend/)
El backend ya esta completamente implementado con:

#### Modelos (backend/src/models/)
- `Usuario.js` - nombre, dojos, pendejos, mimidos, castitontos, chescos, deuda
- `Banco.js` - total
- `RegistroSemanal.js` - usuario, semana, puntos por categoria
- `Transaccion.js` - usuario, monto, tipo, descripcion
- `Apuesta.js` - participantes, tipoPunto, cantidad, ganador, estado

#### Rutas (backend/src/routes/)
- `usuarios.js` - CRUD completo + historial + actualizacion de puntos
- `conteoSemanal.js` - registro individual y batch
- `banco.js` - pagos, historial, deudas
- `apuestas.js` - crear, resolver, cancelar, historial
- `tablaGlobal.js` - tabla, resumen, exportar Excel

#### Configuracion
- `src/index.js` - servidor Express configurado
- `src/config/database.js` - conexion MongoDB
- `src/middleware/errorHandler.js` - manejo de errores

### Frontend (/)
#### Servicios (services/)
- `api.ts` - Todas las llamadas al backend implementadas

#### Tipos (types/)
- `index.ts` - Interfaces TypeScript para todos los modelos

#### Contexto (context/)
- `AppContext.tsx` - Estado global con usuarios, banco, apuestas

#### Pantallas Base (app/(tabs)/)
- `_layout.tsx` - Layout con 5 tabs configurados
- `index.tsx` - Pantalla inicio con estructura base
- `conteo.tsx` - Plantilla vacia
- `minijuego.tsx` - Plantilla vacia
- `tabla.tsx` - Plantilla vacia
- `banco.tsx` - Plantilla vacia

---

## Lo Que Falta Implementar

1. **Pantalla Conteo:** Formulario completo para registrar puntos
2. **Pantalla Minijuego:** Ruleta animada y sistema de apuestas
3. **Pantalla Tabla:** Tabla completa con datos y exportacion
4. **Pantalla Banco:** Formulario de pagos e historial
5. **Componentes:**
   - Ruleta.tsx - Componente de ruleta animada
   - FormularioPuntos.tsx - Inputs para puntos con +/-
   - TablaUsuarios.tsx - Tabla reutilizable
   - TarjetaUsuario.tsx - Card de usuario con avatar
6. **Estilos 8-bit:** Aplicar la tematica visual en todos los componentes
7. **Assets:** Crear o agregar iconos y graficos 8-bit

---

## Ejemplo de Estructura de Datos

```
DOJO SMASH 2025

Integrantes: CHINO, M.N, M.B, FANO

| Nombre | Pendejos | Chescos | Mimidos | Castitontos | Dojos |
|--------|----------|---------|---------|-------------|-------|
| CHINO  | 14       | 7.5     | 18.5    | 8           | 30    |
| M.N    | 27       | 1.5     | 14.5    | 9.5         | 51    |
| M.B    | 25.5     | 15.5    | -2.5    | 9           | 48    |
| FANO   | 20.5     | 18.5    | 6.5     | 7.5         | 62.5  |
```

---

## Comando para Iniciar

```bash
# Backend
cd backend
cp .env.example .env
# Editar .env con tu conexion MongoDB
npm run dev

# Frontend (en otra terminal)
npx expo start
```

---

## Notas Importantes

1. Los puntos pueden ser numeros decimales (0.5, 0.25, etc.) y negativos
2. El sistema de apuestas debe actualizar los puntos en tiempo real
3. La ruleta debe ser visualmente atractiva y animada con estetica 8-bit
4. Mantener compatibilidad con el formato Excel original para importar/exportar
5. Los integrantes iniciales son: CHINO, M.N, M.B, FANO (pero debe ser dinamico)
6. El "Total" de cada usuario se calcula sumando todos sus puntos
7. **El diseño debe ser consistente con la tematica Super Smash Bros 8-bit en TODA la aplicacion**
8. Usar la fuente "Press Start 2P" de Google Fonts para textos importantes
9. Las animaciones deben ser fluidas pero con estetica retro
10. La app no se comercializara, las referencias a Nintendo son para uso personal
