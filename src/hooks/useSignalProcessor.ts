
import { useState, useCallback } from 'react';

interface SignalData {
  time: number[];
  amplitude: number[];
  label: string;
}

interface ConstellationPoint {
  i: number;
  q: number;
  symbol: string;
  isError?: boolean;
}

interface BERData {
  value: number;
  errorsCount: number;
  totalBits: number;
  snrDb?: number;
}

export const useSignalProcessor = () => {
  const [digitalSignal, setDigitalSignal] = useState<SignalData | null>(null);
  const [modulatedSignal, setModulatedSignal] = useState<SignalData | null>(null);
  const [demodulatedSignal, setDemodulatedSignal] = useState<SignalData | null>(null);
  const [constellationData, setConstellationData] = useState<{
    transmitted: ConstellationPoint[];
    received: ConstellationPoint[];
  } | null>(null);
  const [ber, setBER] = useState<BERData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateRandomBits = (length: number): number[] => {
    return Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
  };

  const addGaussianNoise = (signal: number[], snrDb: number): number[] => {
    const snrLinear = Math.pow(10, snrDb / 10);
    const signalPower = signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
    const noisePower = signalPower / snrLinear;
    const noiseStd = Math.sqrt(noisePower);
    
    return signal.map(val => {
      // Box-Muller transform for Gaussian noise
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const noise = noiseStd * z0;
      return val + noise;
    });
  };

  const processSignal = useCallback(async (config: any) => {
    console.log('Starting signal processing with config:', config);
    setIsProcessing(true);
    
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generar bits aleatorios
      const bits = generateRandomBits(config.dataLength);
      console.log('Generated bits:', bits.slice(0, 10), '... total:', bits.length);
      
      // Crear señal digital
      const samplesPerBit = Math.max(50, Math.floor(1000 / config.bitRate));
      const digitalTime: number[] = [];
      const digitalAmplitude: number[] = [];
      
      bits.forEach((bit, index) => {
        for (let i = 0; i < samplesPerBit; i++) {
          digitalTime.push((index * samplesPerBit + i) / (config.bitRate * samplesPerBit));
          digitalAmplitude.push(bit);
        }
      });
      
      const digitalSignalData: SignalData = {
        time: digitalTime,
        amplitude: digitalAmplitude,
        label: 'Señal Digital'
      };
      
      setDigitalSignal(digitalSignalData);
      console.log('Digital signal created with', digitalTime.length, 'samples');
      
      // Generar señal modulada
      const modulatedTime: number[] = [];
      const modulatedAmplitude: number[] = [];
      
      digitalTime.forEach((t, index) => {
        let modulated = 0;
        const bitIndex = Math.floor(index / samplesPerBit);
        
        if (bitIndex < bits.length) {
          if (config.modulationType === 'BPSK') {
            const phase = bits[bitIndex] === 1 ? 0 : Math.PI;
            modulated = config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * t + phase);
          } else {
            // QPSK
            const bit1 = bits[bitIndex * 2] || 0;
            const bit2 = bits[bitIndex * 2 + 1] || 0;
            let phase = 0;
            
            if (bit1 === 0 && bit2 === 0) phase = Math.PI / 4;
            else if (bit1 === 0 && bit2 === 1) phase = 3 * Math.PI / 4;
            else if (bit1 === 1 && bit2 === 1) phase = 5 * Math.PI / 4;
            else phase = 7 * Math.PI / 4;
            
            modulated = config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * t + phase);
          }
        }
        
        modulatedTime.push(t);
        modulatedAmplitude.push(modulated);
      });
      
      // Agregar ruido si está habilitado
      const finalModulated = config.noiseEnabled 
        ? addGaussianNoise(modulatedAmplitude, config.snrDb)
        : modulatedAmplitude;
      
      const modulatedSignalData: SignalData = {
        time: modulatedTime,
        amplitude: finalModulated,
        label: 'Señal Modulada'
      };
      
      setModulatedSignal(modulatedSignalData);
      console.log('Modulated signal created with noise:', config.noiseEnabled);
      
      // Simular demodulación con errores basados en SNR
      const demodulatedBits = bits.map(bit => {
        if (config.noiseEnabled) {
          // Calcular probabilidad de error basada en SNR
          const errorProbability = Math.max(0.001, 0.5 * Math.exp(-config.snrDb / 10));
          const hasError = Math.random() < errorProbability;
          return hasError ? (1 - bit) : bit;
        }
        return bit;
      });
      
      // Crear señal demodulada
      const demodulatedTime: number[] = [];
      const demodulatedAmplitude: number[] = [];
      
      demodulatedBits.forEach((bit, index) => {
        for (let i = 0; i < samplesPerBit; i++) {
          demodulatedTime.push((index * samplesPerBit + i) / (config.bitRate * samplesPerBit));
          demodulatedAmplitude.push(bit);
        }
      });
      
      const demodulatedSignalData: SignalData = {
        time: demodulatedTime,
        amplitude: demodulatedAmplitude,
        label: 'Señal Demodulada'
      };
      
      setDemodulatedSignal(demodulatedSignalData);
      
      // Generar datos de constelación
      const transmitted: ConstellationPoint[] = [];
      const received: ConstellationPoint[] = [];
      
      const maxPoints = Math.min(100, config.modulationType === 'BPSK' ? bits.length : Math.floor(bits.length / 2));
      
      for (let i = 0; i < maxPoints; i++) {
        if (config.modulationType === 'BPSK') {
          const point: ConstellationPoint = { 
            i: bits[i] === 1 ? 1 : -1, 
            q: 0, 
            symbol: bits[i].toString(),
            isError: false
          };
          transmitted.push(point);
          
          const receivedPoint: ConstellationPoint = { ...point };
          if (config.noiseEnabled) {
            const noiseScale = Math.max(0.1, 1 - config.snrDb / 30);
            receivedPoint.i += (Math.random() - 0.5) * noiseScale;
            receivedPoint.q += (Math.random() - 0.5) * noiseScale;
            receivedPoint.isError = demodulatedBits[i] !== bits[i];
          }
          received.push(receivedPoint);
        } else {
          // QPSK
          if (i * 2 + 1 < bits.length) {
            const bitPair = [bits[i * 2], bits[i * 2 + 1]];
            const point: ConstellationPoint = { 
              i: 0, 
              q: 0, 
              symbol: `${bitPair[0]}${bitPair[1]}`,
              isError: false
            };
            
            // Mapear bits a puntos de constelación
            if (bitPair[0] === 0 && bitPair[1] === 0) { point.i = 1; point.q = 1; }
            else if (bitPair[0] === 0 && bitPair[1] === 1) { point.i = -1; point.q = 1; }
            else if (bitPair[0] === 1 && bitPair[1] === 1) { point.i = -1; point.q = -1; }
            else { point.i = 1; point.q = -1; }
            
            transmitted.push(point);
            
            const receivedPoint: ConstellationPoint = { ...point };
            if (config.noiseEnabled) {
              const noiseScale = Math.max(0.1, 1 - config.snrDb / 30);
              receivedPoint.i += (Math.random() - 0.5) * noiseScale;
              receivedPoint.q += (Math.random() - 0.5) * noiseScale;
              receivedPoint.isError = Math.random() < (0.1 - config.snrDb * 0.003);
            }
            received.push(receivedPoint);
          }
        }
      }
      
      setConstellationData({ transmitted, received });
      console.log('Constellation data created with', transmitted.length, 'points');
      
      // Calcular BER
      const errors = demodulatedBits.reduce((count, bit, index) => {
        return count + (bit !== bits[index] ? 1 : 0);
      }, 0);
      
      const berData: BERData = {
        value: errors / bits.length,
        errorsCount: errors,
        totalBits: bits.length,
        snrDb: config.noiseEnabled ? config.snrDb : undefined
      };
      
      setBER(berData);
      console.log('BER calculated:', berData);
      
    } catch (error) {
      console.error('Error processing signal:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    digitalSignal,
    modulatedSignal,
    demodulatedSignal,
    constellationData,
    ber,
    processSignal,
    isProcessing
  };
};
