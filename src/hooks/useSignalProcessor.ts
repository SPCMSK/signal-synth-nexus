import { useState, useCallback } from 'react';

// --- Tipos de datos para señales y resultados ---
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

// --- Validación de parámetros de entrada ---
function validateConfig(config: any) {
  if (!config) throw new Error('Config no proporcionado');
  if (typeof config.dataLength !== 'number' || config.dataLength < 3 || config.dataLength > 1000)
    throw new Error('Longitud de datos inválida (3-1000)');
  if (!['BPSK', 'QPSK'].includes(config.modulationType))
    throw new Error('Tipo de modulación inválido');
  if (typeof config.bitRate !== 'number' || config.bitRate < 100 || config.bitRate > 10000)
    throw new Error('Bit rate fuera de rango (100-10000)');
  if (typeof config.carrierFreq !== 'number' || config.carrierFreq < 1000 || config.carrierFreq > 20000)
    throw new Error('Frecuencia portadora fuera de rango (1000-20000 Hz)');
  if (typeof config.carrierAmplitude !== 'number' || config.carrierAmplitude < 0.1 || config.carrierAmplitude > 2.0)
    throw new Error('Amplitud portadora fuera de rango (0.1-2.0)');
  if (config.noiseEnabled && (typeof config.snrDb !== 'number' || config.snrDb < 0 || config.snrDb > 30))
    throw new Error('SNR fuera de rango (0-30 dB)');
}

// --- Función para generar bits aleatorios ---
function generateRandomBits(length: number): number[] {
  return Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
}

// --- Función para agregar ruido gaussiano (Box-Muller) ---
function addGaussianNoise(signal: number[], snrDb: number): number[] {
  const snrLinear = Math.pow(10, snrDb / 10);
  const signalPower = signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
  const noisePower = signalPower / snrLinear;
  const noiseStd = Math.sqrt(noisePower);
  return signal.map(val => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return val + noiseStd * z0;
  });
}

// --- Modulación BPSK ---
function modulateBPSK(bits: number[], t: number[], config: any): number[] {
  return t.map((time, idx) => {
    const bitIndex = Math.floor(idx / config.samplesPerBit);
    const phase = bits[bitIndex] === 1 ? 0 : Math.PI;
    return config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * time + phase);
  });
}

// --- Modulación QPSK ---
function modulateQPSK(bits: number[], t: number[], config: any): number[] {
  return t.map((time, idx) => {
    const symbolIndex = Math.floor(idx / (2 * config.samplesPerBit));
    const bit1 = bits[symbolIndex * 2] || 0;
    const bit2 = bits[symbolIndex * 2 + 1] || 0;
    let phase = 0;
    if (bit1 === 0 && bit2 === 0) phase = Math.PI / 4;
    else if (bit1 === 0 && bit2 === 1) phase = 3 * Math.PI / 4;
    else if (bit1 === 1 && bit2 === 1) phase = 5 * Math.PI / 4;
    else phase = 7 * Math.PI / 4;
    return config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * time + phase);
  });
}

// --- Demodulación coherente BPSK ---
function demodulateBPSK(received: number[], config: any): number[] {
  // Integración por bit para decisión por umbral
  const bits: number[] = [];
  for (let i = 0; i < received.length; i += config.samplesPerBit) {
    const segment = received.slice(i, i + config.samplesPerBit);
    const sum = segment.reduce((a, b) => a + b, 0);
    bits.push(sum >= 0 ? 1 : 0);
  }
  return bits;
}

// --- Demodulación coherente QPSK ---
function demodulateQPSK(received: number[], config: any): number[] {
  // Integración por símbolo (2 bits)
  const bits: number[] = [];
  for (let i = 0; i < received.length; i += 2 * config.samplesPerBit) {
    const segment = received.slice(i, i + 2 * config.samplesPerBit);
    // Proyección sobre portadoras I y Q
    let iSum = 0, qSum = 0;
    for (let j = 0; j < segment.length; j++) {
      const t = (i + j) / (config.bitRate * config.samplesPerBit);
      iSum += segment[j] * Math.cos(2 * Math.PI * config.carrierFreq * t);
      qSum += segment[j] * Math.sin(2 * Math.PI * config.carrierFreq * t);
    }
    // Decisión por cuadrante
    const iBit = iSum >= 0 ? 1 : 0;
    const qBit = qSum >= 0 ? 1 : 0;
    // Mapeo inverso según convención
    if (iBit === 1 && qBit === 1) bits.push(0, 0);
    else if (iBit === 0 && qBit === 1) bits.push(0, 1);
    else if (iBit === 0 && qBit === 0) bits.push(1, 1);
    else bits.push(1, 0);
  }
  return bits;
}

// --- Generación de puntos de constelación ---
function generateConstellation(bits: number[], demodBits: number[], config: any) {
  const transmitted: ConstellationPoint[] = [];
  const received: ConstellationPoint[] = [];
  const maxPoints = Math.min(100, config.modulationType === 'BPSK' ? bits.length : Math.floor(bits.length / 2));
  for (let i = 0; i < maxPoints; i++) {
    if (config.modulationType === 'BPSK') {
      const tx = { i: bits[i] === 1 ? 1 : -1, q: 0, symbol: bits[i].toString(), isError: false };
      transmitted.push(tx);
      const rx = { ...tx };
      rx.isError = demodBits[i] !== bits[i];
      // Para visualización, dispersión artificial si hay ruido
      if (config.noiseEnabled) {
        const noiseScale = Math.max(0.1, 1 - config.snrDb / 30);
        rx.i += (Math.random() - 0.5) * noiseScale;
        rx.q += (Math.random() - 0.5) * noiseScale;
      }
      received.push(rx);
    } else {
      if (i * 2 + 1 < bits.length) {
        const bitPair = [bits[i * 2], bits[i * 2 + 1]];
        let iVal = 0, qVal = 0;
        if (bitPair[0] === 0 && bitPair[1] === 0) { iVal = 1; qVal = 1; }
        else if (bitPair[0] === 0 && bitPair[1] === 1) { iVal = -1; qVal = 1; }
        else if (bitPair[0] === 1 && bitPair[1] === 1) { iVal = -1; qVal = -1; }
        else { iVal = 1; qVal = -1; }
        const tx = { i: iVal, q: qVal, symbol: `${bitPair[0]}${bitPair[1]}`, isError: false };
        transmitted.push(tx);
        const rx = { ...tx };
        rx.isError = demodBits[i * 2] !== bitPair[0] || demodBits[i * 2 + 1] !== bitPair[1];
        if (config.noiseEnabled) {
          const noiseScale = Math.max(0.1, 1 - config.snrDb / 30);
          rx.i += (Math.random() - 0.5) * noiseScale;
          rx.q += (Math.random() - 0.5) * noiseScale;
        }
        received.push(rx);
      }
    }
  }
  return { transmitted, received };
}

export const useSignalProcessor = () => {
  const [digitalSignal, setDigitalSignal] = useState<SignalData | null>(null);
  const [modulatedSignal, setModulatedSignal] = useState<SignalData | null>(null);
  const [modulatedNoisySignal, setModulatedNoisySignal] = useState<SignalData | null>(null); // Paso intermedio
  const [demodulatedSignal, setDemodulatedSignal] = useState<SignalData | null>(null);
  const [constellationData, setConstellationData] = useState<{
    transmitted: ConstellationPoint[];
    received: ConstellationPoint[];
  } | null>(null);
  const [ber, setBER] = useState<BERData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Proceso principal de simulación ---
  const processSignal = useCallback(async (config: any) => {
    setIsProcessing(true);
    try {
      validateConfig(config);
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 300));

      // --- Generación de bits ---
      const bits = generateRandomBits(config.dataLength);
      // --- Parámetro didáctico: samplesPerBit ---
      config.samplesPerBit = Math.max(100, Math.floor(2000 / config.bitRate)); // Aumenta la resolución mínima

      // --- Señal digital NRZ ---
      const digitalTime: number[] = [];
      const digitalAmplitude: number[] = [];
      bits.forEach((bit, index) => {
        for (let i = 0; i < config.samplesPerBit; i++) {
          digitalTime.push((index * config.samplesPerBit + i) / (config.bitRate * config.samplesPerBit));
          digitalAmplitude.push(bit);
        }
      });
      setDigitalSignal({ time: digitalTime, amplitude: digitalAmplitude, label: 'Señal Digital' });

      // --- Modulación ---
      let modulatedAmplitude: number[] = [];
      if (config.modulationType === 'BPSK') {
        modulatedAmplitude = modulateBPSK(bits, digitalTime, config);
      } else {
        modulatedAmplitude = modulateQPSK(bits, digitalTime, config);
      }
      setModulatedSignal({ time: digitalTime, amplitude: modulatedAmplitude, label: 'Señal Modulada' });

      // --- Canal con ruido (opcional) ---
      let noisyAmplitude = modulatedAmplitude;
      if (config.noiseEnabled) {
        noisyAmplitude = addGaussianNoise(modulatedAmplitude, config.snrDb);
        setModulatedNoisySignal({ time: digitalTime, amplitude: noisyAmplitude, label: 'Señal Modulada + Ruido' });
      } else {
        setModulatedNoisySignal(null);
      }

      // --- Demodulación coherente ---
      let demodBits: number[] = [];
      if (config.modulationType === 'BPSK') {
        demodBits = demodulateBPSK(noisyAmplitude, config);
      } else {
        demodBits = demodulateQPSK(noisyAmplitude, config);
      }

      // --- Señal demodulada (NRZ) ---
      const demodulatedTime: number[] = [];
      const demodulatedAmplitude: number[] = [];
      demodBits.forEach((bit, index) => {
        for (let i = 0; i < config.samplesPerBit; i++) {
          demodulatedTime.push((index * config.samplesPerBit + i) / (config.bitRate * config.samplesPerBit));
          demodulatedAmplitude.push(bit);
        }
      });
      setDemodulatedSignal({ time: demodulatedTime, amplitude: demodulatedAmplitude, label: 'Señal Demodulada' });

      // --- Constelación ---
      setConstellationData(generateConstellation(bits, demodBits, config));

      // --- Cálculo de BER ---
      let errors = 0;
      if (config.modulationType === 'BPSK') {
        errors = demodBits.reduce((count, bit, idx) => count + (bit !== bits[idx] ? 1 : 0), 0);
      } else {
        // QPSK: comparar por pares
        for (let i = 0; i < Math.floor(bits.length / 2); i++) {
          if (demodBits[i * 2] !== bits[i * 2] || demodBits[i * 2 + 1] !== bits[i * 2 + 1]) errors += 2;
        }
      }
      setBER({
        value: errors / bits.length,
        errorsCount: errors,
        totalBits: bits.length,
        snrDb: config.noiseEnabled ? config.snrDb : undefined
      });
    } catch (error) {
      setDigitalSignal(null);
      setModulatedSignal(null);
      setModulatedNoisySignal(null);
      setDemodulatedSignal(null);
      setConstellationData(null);
      setBER(null);
      // Log detallado para debugging educativo
      if (error instanceof Error) {
        console.error('Error en procesamiento de señal:', error.message);
      } else {
        console.error('Error desconocido en procesamiento de señal');
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    digitalSignal,
    modulatedSignal,
    modulatedNoisySignal, // Paso intermedio expuesto
    demodulatedSignal,
    constellationData,
    ber,
    processSignal,
    isProcessing
  };
};
