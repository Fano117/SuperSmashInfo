import {
  Usuario,
  Banco,
  RegistroSemanal,
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

// ============ BANCO ============

export const getBanco = (): Promise<Banco> => {
  return fetchApi<Banco>('/banco');
};

export const registrarPago = (
  usuarioId: string,
  monto: number,
  descripcion?: string
): Promise<{ transaccion: Transaccion; bancoTotal: number }> => {
  return fetchApi<{ transaccion: Transaccion; bancoTotal: number }>('/banco/pago', {
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
