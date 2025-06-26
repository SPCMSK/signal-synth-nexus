
import { useState, useCallback } from 'react';

interface SimulationRecord {
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

export const useSimulationHistory = () => {
  const [simulations, setSimulations] = useState<SimulationRecord[]>([]);

  const addSimulation = useCallback((config: any, results: any) => {
    const newSimulation: SimulationRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      config: { ...config },
      results: { ...results }
    };

    setSimulations(prev => [newSimulation, ...prev]);
    console.log('Added simulation to history:', newSimulation.id);
    return newSimulation.id;
  }, []);

  const clearHistory = useCallback(() => {
    setSimulations([]);
    console.log('Simulation history cleared');
  }, []);

  const getSimulation = useCallback((id: string) => {
    return simulations.find(sim => sim.id === id);
  }, [simulations]);

  return {
    simulations,
    addSimulation,
    clearHistory,
    getSimulation,
    totalSimulations: simulations.length
  };
};
