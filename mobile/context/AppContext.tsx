import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Banco, Apuesta } from '../types';
import * as api from '../services/api';

interface AppContextType {
  usuarios: Usuario[];
  banco: Banco | null;
  apuestasPendientes: Apuesta[];
  loading: boolean;
  error: string | null;
  refreshUsuarios: () => Promise<void>;
  refreshBanco: () => Promise<void>;
  refreshApuestas: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [banco, setBanco] = useState<Banco | null>(null);
  const [apuestasPendientes, setApuestasPendientes] = useState<Apuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsuarios = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    }
  };

  const refreshBanco = async () => {
    try {
      const data = await api.getBanco();
      setBanco(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar banco');
    }
  };

  const refreshApuestas = async () => {
    try {
      const data = await api.getApuestas();
      setApuestasPendientes(data.filter(a => a.estado === 'pendiente'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar apuestas');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([refreshUsuarios(), refreshBanco(), refreshApuestas()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        usuarios,
        banco,
        apuestasPendientes,
        loading,
        error,
        refreshUsuarios,
        refreshBanco,
        refreshApuestas,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}
