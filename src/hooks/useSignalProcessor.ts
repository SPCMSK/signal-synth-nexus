
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
      const noise = noiseStd * (Math.random() - 0.5) * 2;
      return val + noise;
    });
  };

  const processSignal = useCallback(async (config: any) => {
    setIsProcessing(true);
    
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generar bits aleatorios
      const bits = generateRandomBits(config.dataLength);
      
      // Crear señal digital
      const samplesPerBit = 100;
      const digitalTime: number[] = [];
      const digitalAmplitude: number[] = [];
      
      bits.forEach((bit, index) => {
        for (let i = 0; i < samplesPerBit; i++) {
          digitalTime.push((index * samplesPerBit + i) / (config.bitRate * samplesPerBit));
          digitalAmplitude.push(bit);
        }
      });
      
      setDigitalSignal({
        time: digitalTime,
        amplitude: digitalAmplitude,
        label: 'Señal Digital'
      });
      
      // Generar señal modulada
      const modulatedTime: number[] = [];
      const modulatedAmplitude: number[] = [];
      
      digitalTime.forEach((t, index) => {
        let modulated = 0;
        const bitIndex = Math.floor(index / samplesPerBit);
        
        if (config.modulationType === 'BPSK') {
          const phase = bits[bitIndex] === 1 ? 0 : Math.PI;
          modulated = config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * t + phase);
        } else {
          // QPSK
          const bitPair = [bits[bitIndex * 2] || 0, bits[bitIndex * 2 + 1] || 0];
          let phase = 0;
          if (bitPair[0] === 0 && bitPair[1] === 0) phase = Math.PI / 4;
          else if (bitPair[0] === 0 && bitPair[1] === 1) phase = 3 * Math.PI / 4;
          else if (bitPair[0] === 1 && bitPair[1] === 1) phase = 5 * Math.PI / 4;
          else phase = 7 * Math.PI / 4;
          
          modulated = config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * t + phase);
        }
        
        modulatedTime.push(t);
        modulatedAmplitude.push(modulated);
      });
      
      // Agregar ruido si está habilitado
      const finalModulated = config.noiseEnabled 
        ? addGaussianNoise(modulatedAmplitude, config.snrDb)
        : modulatedAmplitude;
      
      setModulatedSignal({
        time: modulatedTime,
        amplitude: finalModulated,
        label: 'Señal Modulada'
      });
      
      // Simular demodulación (simplificada)
      const demodulatedBits = bits.map(bit => {
        if (config.noiseEnabled) {
          // Simular errores basados en SNR
          const errorProbability = Math.max(0, 0.1 - config.snrDb * 0.005);
          return Math.random() < errorProbability ? 1 - bit : bit;
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
      
      setDemodulatedSignal({
        time: demodulatedTime,
        amplitude: demodulatedAmplitude,
        label: 'Señal Demodulada'
      });
      
      // Generar datos de constelación
      const transmitted: ConstellationPoint[] = [];
      const received: ConstellationPoint[] = [];
      
      for (let i = 0; i < Math.min(100, bits.length); i++) {
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
            receivedPoint.i += (Math.random() - 0.5) * 0.3;
            receivedPoint.q += (Math.random() - 0.5) * 0.3;
            receivedPoint.isError = demodulatedBits[i] !== bits[i];
          }
          received.push(receivedPoint);
        } else {
          // QPSK
          const bitPair = [bits[i * 2] || 0, bits[i * 2 + 1] || 0];
          let point: ConstellationPoint = { 
            i: 0, 
            q: 0, 
            symbol: `${bitPair[0]}${bitPair[1]}`,
            isError: false
          };
          
          if (bitPair[0] === 0 && bitPair[1] === 0) { point.i = 1; point.q = 1; }
          else if (bitPair[0] === 0 && bitPair[1] === 1) { point.i = -1; point.q = 1; }
          else if (bitPair[0] === 1 && bitPair[1] === 1) { point.i = -1; point.q = -1; }
          else { point.i = 1; point.q = -1; }
          
          transmitted.push(point);
          
          const receivedPoint: ConstellationPoint = { ...point };
          if (config.noiseEnabled) {
            receivedPoint.i += (Math.random() - 0.5) * 0.3;
            receivedPoint.q += (Math.random() - 0.5) * 0.3;
            receivedPoint.isError = Math.random() < 0.05; // Simplificado
          }
          received.push(receivedPoint);
        }
      }
      
      setConstellationData({ transmitted, received });
      
      // Calcular BER
      const errors = demodulatedBits.reduce((count, bit, index) => {
        return count + (bit !== bits[index] ? 1 : 0);
      }, 0);
      
      setBER({
        value: errors / bits.length,
        errorsCount: errors,
        totalBits: bits.length,
        snrDb: config.noiseEnabled ? config.snrDb : undefined
      });
      
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
