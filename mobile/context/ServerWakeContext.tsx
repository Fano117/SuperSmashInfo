import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { checkServerHealth, waitForServerWake } from '../services/api';

interface ServerWakeContextType {
  isServerAwake: boolean;
  isChecking: boolean;
  currentAttempt: number;
  maxAttempts: number;
  statusMessage: string;
  hasError: boolean;
  retryWake: () => Promise<void>;
}

const ServerWakeContext = createContext<ServerWakeContextType | undefined>(undefined);

interface ServerWakeProviderProps {
  children: ReactNode;
}

export function ServerWakeProvider({ children }: ServerWakeProviderProps) {
  const [isServerAwake, setIsServerAwake] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [maxAttempts] = useState(12); // 12 intentos x 3 segundos = ~36 segundos
  const [statusMessage, setStatusMessage] = useState('Conectando con el servidor...');
  const [hasError, setHasError] = useState(false);

  const wakeServer = useCallback(async () => {
    setIsChecking(true);
    setHasError(false);
    setCurrentAttempt(0);
    setStatusMessage('Verificando conexión...');

    // Primero verificar si el servidor ya está despierto (respuesta rápida)
    const quickCheck = await checkServerHealth(3000);

    if (quickCheck.isAwake) {
      // Servidor ya está activo, no mostrar pantalla de carga
      setIsServerAwake(true);
      setIsChecking(false);
      setStatusMessage('Conectado!');
      return;
    }

    // Servidor dormido, iniciar proceso de despertar
    setStatusMessage('El servidor está iniciando...');

    const success = await waitForServerWake(
      (attempt, max, message) => {
        setCurrentAttempt(attempt);
        setStatusMessage(message);
      },
      maxAttempts,
      3000
    );

    if (success) {
      setIsServerAwake(true);
      setStatusMessage('Servidor listo!');
    } else {
      setHasError(true);
      setStatusMessage('No se pudo conectar con el servidor');
    }

    setIsChecking(false);
  }, [maxAttempts]);

  const retryWake = useCallback(async () => {
    await wakeServer();
  }, [wakeServer]);

  useEffect(() => {
    wakeServer();
  }, [wakeServer]);

  return (
    <ServerWakeContext.Provider
      value={{
        isServerAwake,
        isChecking,
        currentAttempt,
        maxAttempts,
        statusMessage,
        hasError,
        retryWake,
      }}
    >
      {children}
    </ServerWakeContext.Provider>
  );
}

export function useServerWake() {
  const context = useContext(ServerWakeContext);
  if (context === undefined) {
    throw new Error('useServerWake debe usarse dentro de un ServerWakeProvider');
  }
  return context;
}
