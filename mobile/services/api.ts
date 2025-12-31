import {
  Usuario,
  Banco,
  RegistroSemanal,
  HistorialSemana,
  Transaccion,
  Apuesta,
  ConteoSemanalInput,
  PuntosDelta,
  ResumenUsuario
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error en la peticion');
  }

  return response.json();
}

// ============ USUARIOS ============

export const getUsuarios = (): Promise<Usuario[]> => {
  return fetchApi<Usuario[]>('/usuarios');
};

export const getUsuario = (id: string): Promise<Usuario> => {
  return fetchApi<Usuario>(`/usuarios/${id}`);
};

export const crearUsuario = (data: Partial<Usuario>): Promise<Usuario> => {
  return fetchApi<Usuario>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const actualizarUsuario = (id: string, data: Partial<Usuario>): Promise<Usuario> => {
  return fetchApi<Usuario>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const actualizarPuntos = (id: string, puntos: PuntosDelta): Promise<Usuario> => {
  return fetchApi<Usuario>(`/usuarios/${id}/puntos`, {
    method: 'PUT',
    body: JSON.stringify(puntos),
  });
};

export const eliminarUsuario = (id: string): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>(`/usuarios/${id}`, {
    method: 'DELETE',
  });
};

export const getHistorialUsuario = (id: string): Promise<RegistroSemanal[]> => {
  return fetchApi<RegistroSemanal[]>(`/usuarios/${id}/historial`);
};

// Subir foto de perfil
export const subirFotoPerfil = async (
  usuarioId: string,
  fotoUri: string
): Promise<{ fotoUrl: string; usuario: Usuario }> => {
  const formData = new FormData();

  // Obtener nombre y tipo del archivo
  const filename = fotoUri.split('/').pop() || 'foto.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // Agregar archivo al FormData
  formData.append('foto', {
    uri: fotoUri,
    name: filename,
    type,
  } as any);

  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/foto`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al subir foto' }));
    throw new Error(error.message || 'Error al subir foto');
  }

  return response.json();
};

// Eliminar foto de perfil
export const eliminarFotoPerfil = async (usuarioId: string): Promise<{ usuario: Usuario }> => {
  return fetchApi<{ usuario: Usuario }>(`/usuarios/${usuarioId}/foto`, {
    method: 'DELETE',
  });
};

// Obtener URL completa de foto
export const getFotoUrl = (fotoPath: string | null | undefined): string | null => {
  if (!fotoPath) return null;
  // Si ya es una URL completa HTTP, retornarla
  if (fotoPath.startsWith('http')) return fotoPath;
  // Si es una ruta local (file://), ignorarla (foto antigua no migrada)
  if (fotoPath.startsWith('file://')) return null;
  // Si es una ruta relativa del servidor, construir URL completa
  if (fotoPath.startsWith('/uploads')) {
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${fotoPath}`;
  }
  // Cualquier otro caso, ignorar
  return null;
};

// ============ CONTEO SEMANAL ============

export const getConteoSemanal = (): Promise<RegistroSemanal[]> => {
  return fetchApi<RegistroSemanal[]>('/conteo-semanal');
};

export const getUltimasDosSemanas = (): Promise<RegistroSemanal[]> => {
  return fetchApi<RegistroSemanal[]>('/conteo-semanal/ultimas-dos-semanas');
};

export const registrarConteo = (data: ConteoSemanalInput): Promise<RegistroSemanal> => {
  return fetchApi<RegistroSemanal>('/conteo-semanal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registrarConteoBatch = (
  semana: string,
  registros: ConteoSemanalInput[]
): Promise<RegistroSemanal[]> => {
  return fetchApi<RegistroSemanal[]>('/conteo-semanal/batch', {
    method: 'POST',
    body: JSON.stringify({ semana, registros }),
  });
};

export const getHistorialCompleto = (): Promise<HistorialSemana[]> => {
  return fetchApi<HistorialSemana[]>('/conteo-semanal/historial');
};

export const editarRegistroSemanal = (
  id: string,
  datos: {
    dojos?: number;
    pendejos?: number;
    mimidos?: number;
    castitontos?: number;
    chescos?: number;
  }
): Promise<RegistroSemanal> => {
  return fetchApi<RegistroSemanal>(`/conteo-semanal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
};

// ============ BANCO ============

export const getBanco = (): Promise<Banco> => {
  return fetchApi<Banco>('/banco');
};

export const registrarPago = (
  usuarioId: string,
  monto: number,
  descripcion?: string,
  pagoDeuda?: boolean
): Promise<{ transaccion: Transaccion; bancoTotal: number }> => {
  return fetchApi<{ transaccion: Transaccion; bancoTotal: number }>('/banco/pago', {
    method: 'POST',
    body: JSON.stringify({ usuarioId, monto, descripcion, pagoDeuda }),
  });
};

export const registrarGasto = (
  usuarioId: string,
  monto: number,
  descripcion: string
): Promise<{ transaccion: Transaccion; bancoTotal: number }> => {
  return fetchApi<{ transaccion: Transaccion; bancoTotal: number }>('/banco/gasto', {
    method: 'POST',
    body: JSON.stringify({ usuarioId, monto, descripcion }),
  });
};

export const getHistorialBanco = (): Promise<Transaccion[]> => {
  return fetchApi<Transaccion[]>('/banco/historial');
};

export const getDeudasUsuarios = (): Promise<{ _id: string; nombre: string; deuda: number }[]> => {
  return fetchApi<{ _id: string; nombre: string; deuda: number }[]>('/banco/usuarios');
};

// ============ APUESTAS ============

export const getApuestas = (): Promise<Apuesta[]> => {
  return fetchApi<Apuesta[]>('/apuestas');
};

export const getHistorialApuestas = (): Promise<Apuesta[]> => {
  return fetchApi<Apuesta[]>('/apuestas/historial');
};

export const crearApuesta = (
  participantes: string[],
  tipoPunto: string,
  cantidad: number
): Promise<Apuesta> => {
  return fetchApi<Apuesta>('/apuestas', {
    method: 'POST',
    body: JSON.stringify({ participantes, tipoPunto, cantidad }),
  });
};

export const resolverApuesta = (id: string, ganadorId: string): Promise<Apuesta> => {
  return fetchApi<Apuesta>(`/apuestas/${id}/resolver`, {
    method: 'POST',
    body: JSON.stringify({ ganadorId }),
  });
};

export const cancelarApuesta = (id: string): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>(`/apuestas/${id}`, {
    method: 'DELETE',
  });
};

// ============ TABLA GLOBAL ============

export const getTablaGlobal = (): Promise<Usuario[]> => {
  return fetchApi<Usuario[]>('/tabla-global');
};

export const getResumenTabla = (): Promise<ResumenUsuario[]> => {
  return fetchApi<ResumenUsuario[]>('/tabla-global/resumen');
};

export const exportarExcel = async (): Promise<Blob> => {
  const response = await fetch(`${API_URL}/tabla-global/exportar`);
  if (!response.ok) {
    throw new Error('Error al exportar Excel');
  }
  return response.blob();
};

// ============ HIGHSCORES ============

export type GameType = 'flappy-yoshi' | 'snake' | 'tetris' | 'pacman';

export interface Highscore {
  _id: string;
  juego: GameType;
  usuario: Usuario | string;
  puntuacion: number;
  createdAt?: string;
  updatedAt?: string;
}

// Obtener top 10 highscores de un juego
export const getHighscores = (juego: GameType): Promise<Highscore[]> => {
  return fetchApi<Highscore[]>(`/highscores/${juego}`);
};

// Obtener highscore global (el mas alto) de un juego
export const getHighscoreGlobal = (juego: GameType): Promise<Highscore | { puntuacion: number }> => {
  return fetchApi<Highscore | { puntuacion: number }>(`/highscores/${juego}/global`);
};

// Obtener highscore de un usuario especifico en un juego
export const getHighscoreUsuario = (
  juego: GameType,
  usuarioId: string
): Promise<Highscore | { puntuacion: number }> => {
  return fetchApi<Highscore | { puntuacion: number }>(`/highscores/${juego}/usuario/${usuarioId}`);
};

// Guardar o actualizar highscore (solo actualiza si es mayor)
export const guardarHighscore = (
  juego: GameType,
  usuarioId: string,
  puntuacion: number
): Promise<Highscore> => {
  return fetchApi<Highscore>('/highscores', {
    method: 'POST',
    body: JSON.stringify({ juego, usuarioId, puntuacion }),
  });
};

// Obtener resumen de highscores de todos los juegos
export const getResumenHighscores = (): Promise<Record<GameType, Highscore | { puntuacion: number }>> => {
  return fetchApi<Record<GameType, Highscore | { puntuacion: number }>>('/highscores');
};
