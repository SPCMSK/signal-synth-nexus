// Hook de historial de simulaciones para SimuMod Pro
// ---------------------------------------------------
// Permite almacenar, recuperar, limpiar y exportar el historial de simulaciones.
// Incluye persistencia en localStorage, validación y comentarios didácticos.

import { useState, useCallback, useEffect } from 'react';

export interface SimulationRecord {
  id: string;
  timestamp: Date;
  config: {
    bitRate: number;
    modulationType: 'BPSK' | 'QPSK';
    carrierFreq: number;
    carrierAmplitude: number;
    snrDb: number;
    noiseEnabled: boolean;
    dataLength: number;
  };
  results: {
    digitalSignal: any;
    modulatedSignal: any;
    demodulatedSignal: any;
    constellationData: any;
    ber: any;
  };
}

const STORAGE_KEY = 'simumod_history_v1';

/**
 * Hook para gestionar el historial de simulaciones con persistencia y validación.
 * @returns Funciones y datos del historial
 */
export const useSimulationHistory = () => {
  // Estado: historial de simulaciones
  const [simulations, setSimulations] = useState<SimulationRecord[]>([]);

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Array<{
          id: string;
          timestamp: string;
          config: SimulationRecord['config'];
          results: SimulationRecord['results'];
        }>;

        setSimulations(parsed.map(sim => ({
          id: sim.id,
          timestamp: new Date(sim.timestamp),
          config: sim.config,
          results: sim.results
        })));
      } catch (e) {
        console.warn('No se pudo cargar el historial guardado:', e);
      }
    }
  }, []);

  // Guardar historial en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(simulations.map(sim => ({ ...sim, timestamp: sim.timestamp.toISOString() })))
    );
  }, [simulations]);

  /**
   * Agrega una simulación al historial si es válida.
   * @param config Configuración de la simulación
   * @param results Resultados de la simulación
   * @returns ID de la simulación agregada o null si inválida
   */
  const addSimulation = useCallback((config: SimulationRecord['config'], results: SimulationRecord['results']) => {
    // Validación básica: debe tener señales y BER
    if (!results.digitalSignal || !results.modulatedSignal || !results.ber) {
      console.warn('Simulación inválida, no se agrega al historial.');
      return null;
    }
    // Evitar duplicados inmediatos (por ID o timestamp muy cercano)
    const now = Date.now();
    if (simulations[0] && now - simulations[0].timestamp.getTime() < 500 && JSON.stringify(simulations[0].config) === JSON.stringify(config)) {
      console.info('Simulación duplicada ignorada.');
      return simulations[0].id;
    }
    const newSimulation: SimulationRecord = {
      id: now.toString(),
      timestamp: new Date(),
      config: { ...config },
      results: { ...results }
    };
    setSimulations(prev => [newSimulation, ...prev]);
    console.log('Simulación agregada al historial:', newSimulation.id);
    return newSimulation.id;
  }, [simulations]);

  /**
   * Limpia todo el historial de simulaciones.
   */
  const clearHistory = useCallback(() => {
    setSimulations([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Historial de simulaciones limpiado');
  }, []);

  /**
   * Busca una simulación por ID.
   */
  const getSimulation = useCallback((id: string) => {
    return simulations.find(sim => sim.id === id);
  }, [simulations]);

  /**
   * Exporta el historial como JSON string.
   */
  const exportHistory = useCallback(() => {
    return JSON.stringify(simulations.map(sim => ({ ...sim, timestamp: sim.timestamp.toISOString() })), null, 2);
  }, [simulations]);

  /**
   * Importa un historial desde un JSON string.
   * @param jsonString JSON serializado de historial
   * @returns true si fue exitoso
   */
  const importHistory = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as Array<{
        id: string;
        timestamp: string;
        config: SimulationRecord['config'];
        results: SimulationRecord['results'];
      }>;
      setSimulations(parsed.map(sim => ({
        id: sim.id,
        timestamp: new Date(sim.timestamp),
        config: sim.config,
        results: sim.results
      })));
      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Historial importado exitosamente');
      return true;
    } catch (e) {
      console.error('Error al importar historial:', e);
      return false;
    }
  }, []);

  return {
    simulations,
    addSimulation,
    clearHistory,
    getSimulation,
    exportHistory,
    importHistory,
    totalSimulations: simulations.length
  };
};
