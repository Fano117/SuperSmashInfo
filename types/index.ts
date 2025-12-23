// Tipos para SuperSmashInfo

export type AvatarId =
  | 'mario' | 'luigi' | 'peach' | 'yoshi' | 'toad' | 'bowser'
  | 'link' | 'zelda' | 'samus' | 'kirby' | 'pikachu' | 'fox'
  | 'falcon' | 'ness' | 'banjo' | 'gamewatch' | 'dk' | 'diddy';

export interface Usuario {
  _id: string;
  nombre: string;
  dojos: number;
  pendejos: number;
  mimidos: number;
  castitontos: number;
  chescos: number;
  deuda: number;
  avatar?: AvatarId;
  fotoUrl?: string | null;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banco {
  _id: string;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistroSemanal {
  _id: string;
  usuario: Usuario | string;
  semana: string;
  dojos: number;
  pendejos: number;
  mimidos: number;
  castitontos: number;
  chescos: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaccion {
  _id: string;
  usuario: Usuario | string;
  monto: number;
  tipo: 'pago' | 'retiro';
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TipoPunto = 'dojos' | 'pendejos' | 'chescos' | 'mimidos' | 'castitontos';

export interface Apuesta {
  _id: string;
  participantes: (Usuario | string)[];
  tipoPunto: TipoPunto;
  cantidad: number;
  ganador?: Usuario | string;
  estado: 'pendiente' | 'resuelta' | 'cancelada';
  createdAt?: string;
  updatedAt?: string;
}

export interface ConteoSemanalInput {
  usuarioId: string;
  semana?: string;
  dojos?: number;
  pendejos?: number;
  mimidos?: number;
  castitontos?: number;
  chescos?: number;
}

export interface PuntosDelta {
  dojos?: number;
  pendejos?: number;
  mimidos?: number;
  castitontos?: number;
  chescos?: number;
}

export interface ResumenUsuario {
  usuario: string;
  totales: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
    total: number;
  };
  ultimasDosSemanas: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
  };
}

export interface RuletaConfig {
  modo: 'numeros' | 'integrantes';
  campos: number;
  valores?: string[];
}
