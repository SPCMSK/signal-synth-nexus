
# SimuMod Pro - Documentación Técnica del Procesamiento de Señales

## Introducción

SimuMod Pro es un simulador avanzado de modulación digital que implementa los algoritmos fundamentales de telecomunicaciones para BPSK (Binary Phase Shift Keying) y QPSK (Quadrature Phase Shift Keying). Este documento explica la teoría, implementación y arquitectura del sistema.

## Arquitectura del Sistema

### Estructura de Carpetas
```
src/
├── components/           # Componentes React de la interfaz
│   ├── ui/              # Componentes base de shadcn/ui
│   ├── ConfigPanel.tsx  # Panel de configuración de parámetros
│   ├── SignalVisualization.tsx # Visualización de señales en canvas
│   ├── ConstellationDiagram.tsx # Diagrama de constelación I-Q
│   ├── MetricsPanel.tsx # Panel de métricas (BER, SNR, etc.)
│   └── ExportPanel.tsx  # Exportación de resultados
├── hooks/               # Lógica de negocio en hooks personalizados
│   ├── useSignalProcessor.ts # Procesamiento principal de señales
│   └── useSimulationHistory.ts # Gestión del historial
└── pages/               # Páginas de la aplicación
    └── Index.tsx        # Página principal del simulador
```

## Fundamentos Teóricos

### 1. Modulación Digital
La modulación digital es el proceso de convertir información digital (bits) en señales analógicas para su transmisión. Los esquemas implementados son:

**BPSK (Binary Phase Shift Keying)**
- Cada bit se representa por una fase específica de la portadora
- Bit '0' → Fase π (señal invertida)
- Bit '1' → Fase 0 (señal normal)
- Fórmula: `s(t) = A·cos(2πfc·t + φ)` donde φ = 0 o π

**QPSK (Quadrature Phase Shift Keying)**
- Cada símbolo (2 bits) se representa por una de 4 fases
- Más eficiente espectralmente que BPSK
- Fases: π/4, 3π/4, 5π/4, 7π/4
- Permite transmitir 2 bits por símbolo

### 2. Canal de Comunicación
El canal añade ruido gaussiano blanco (AWGN) caracterizado por:
- **SNR (Signal-to-Noise Ratio)**: Relación entre potencia de señal y ruido
- **Ruido térmico**: Modelado usando distribución gaussiana (Box-Muller)

### 3. Demodulación Coherente
Proceso de recuperación de los bits originales mediante:
- **Correlación**: Multiplicación de la señal recibida por la portadora local
- **Integración**: Suma de la señal correlacionada en el período de símbolo
- **Decisión**: Comparación con umbral para determinar el bit

## Implementación del Procesamiento de Señales

### Hook Principal: `useSignalProcessor.ts`

#### Pipeline de Procesamiento
```typescript
1. Generación de Bits → 2. Señal Digital → 3. Modulación → 4. Canal → 5. Demodulación
```

#### 1. Generación de Bits Aleatorios
```typescript
function generateRandomBits(length: number): number[] {
  return Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
}
```
Genera secuencias pseudoaleatorias para simular datos digitales.

#### 2. Señal Digital NRZ (Non-Return-to-Zero)
```typescript
// Conversión de bits a señal digital rectangular
bits.forEach((bit, index) => {
  for (let i = 0; i < samplesPerBit; i++) {
    digitalTime.push((index * samplesPerBit + i) / (bitRate * samplesPerBit));
    digitalAmplitude.push(bit); // 0 o 1
  }
});
```

#### 3. Modulación BPSK
```typescript
function modulateBPSK(bits: number[], t: number[], config: any): number[] {
  return t.map((time, idx) => {
    const bitIndex = Math.floor(idx / config.samplesPerBit);
    const phase = bits[bitIndex] === 1 ? 0 : Math.PI;
    return config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * time + phase);
  });
}
```

#### 4. Modulación QPSK
```typescript
function modulateQPSK(bits: number[], t: number[], config: any): number[] {
  return t.map((time, idx) => {
    const symbolIndex = Math.floor(idx / (2 * config.samplesPerBit));
    const bit1 = bits[symbolIndex * 2] || 0;
    const bit2 = bits[symbolIndex * 2 + 1] || 0;
    
    // Mapeo Gray de bits a fases
    let phase = 0;
    if (bit1 === 0 && bit2 === 0) phase = Math.PI / 4;
    else if (bit1 === 0 && bit2 === 1) phase = 3 * Math.PI / 4;
    else if (bit1 === 1 && bit2 === 1) phase = 5 * Math.PI / 4;
    else phase = 7 * Math.PI / 4;
    
    return config.carrierAmplitude * Math.cos(2 * Math.PI * config.carrierFreq * time + phase);
  });
}
```

#### 5. Modelo de Canal con Ruido AWGN
```typescript
function addGaussianNoise(signal: number[], snrDb: number): number[] {
  const snrLinear = Math.pow(10, snrDb / 10);
  const signalPower = signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
  const noisePower = signalPower / snrLinear;
  const noiseStd = Math.sqrt(noisePower);
  
  return signal.map(val => {
    // Generador Box-Muller para ruido gaussiano
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return val + noiseStd * z0;
  });
}
```

#### 6. Demodulación Coherente BPSK
```typescript
function demodulateBPSK(received: number[], config: any): number[] {
  const bits: number[] = [];
  for (let i = 0; i < received.length; i += config.samplesPerBit) {
    const segment = received.slice(i, i + config.samplesPerBit);
    const sum = segment.reduce((a, b) => a + b, 0); // Integración
    bits.push(sum >= 0 ? 1 : 0); // Decisión por umbral
  }
  return bits;
}
```

#### 7. Demodulación Coherente QPSK
```typescript
function demodulateQPSK(received: number[], config: any): number[] {
  const bits: number[] = [];
  for (let i = 0; i < received.length; i += 2 * config.samplesPerBit) {
    const segment = received.slice(i, i + 2 * config.samplesPerBit);
    
    // Proyección sobre componentes I y Q
    let iSum = 0, qSum = 0;
    for (let j = 0; j < segment.length; j++) {
      const t = (i + j) / (config.bitRate * config.samplesPerBit);
      iSum += segment[j] * Math.cos(2 * Math.PI * config.carrierFreq * t);
      qSum += segment[j] * Math.sin(2 * Math.PI * config.carrierFreq * t);
    }
    
    // Decisión por cuadrante
    const iBit = iSum >= 0 ? 1 : 0;
    const qBit = qSum >= 0 ? 1 : 0;
    
    // Mapeo inverso según convención Gray
    if (iBit === 1 && qBit === 1) bits.push(0, 0);
    else if (iBit === 0 && qBit === 1) bits.push(0, 1);
    else if (iBit === 0 && qBit === 0) bits.push(1, 1);
    else bits.push(1, 0);
  }
  return bits;
}
```

### Cálculo de BER (Bit Error Rate)
```typescript
// Comparación bit a bit entre transmitido y recibido
let errors = 0;
if (config.modulationType === 'BPSK') {
  errors = demodBits.reduce((count, bit, idx) => 
    count + (bit !== bits[idx] ? 1 : 0), 0);
} else { // QPSK
  for (let i = 0; i < Math.floor(bits.length / 2); i++) {
    if (demodBits[i * 2] !== bits[i * 2] || 
        demodBits[i * 2 + 1] !== bits[i * 2 + 1]) errors += 2;
  }
}

const ber = errors / bits.length;
```

## Componentes de Visualización

### SignalVisualization.tsx
**Propósito**: Renderizado de señales usando Canvas API con alta performance.

**Funcionalidades**:
- **Multi-canvas**: Separación de señales para evitar solapamiento
- **Escalado automático**: Ajuste dinámico de ejes según datos
- **Interactividad**: Tooltips con valores puntuales
- **Pestañas**: Vista combinada e individual

**Algoritmo de Dibujado**:
```typescript
const drawSignal = (canvas, data, color) => {
  // 1. Limpiar canvas
  ctx.clearRect(0, 0, width, height);
  
  // 2. Calcular rangos de datos
  const minX = Math.min(...data.time);
  const maxX = Math.max(...data.time);
  
  // 3. Dibujar grilla y ejes
  drawAxes(ctx, width, height, minX, maxX, minY, maxY);
  
  // 4. Trazar señal con transformación de coordenadas
  data.time.forEach((time, index) => {
    const x = 40 + ((time - minX) / (maxX - minX)) * (width - 50);
    const y = height - 30 - ((data.amplitude[index] - minY) / (maxY - minY)) * (height - 40);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
};
```

### ConstellationDiagram.tsx
**Propósito**: Visualización del plano I-Q para análisis de modulación.

**Características**:
- **Puntos ideales vs recibidos**: Comparación visual de la distorsión
- **Detección de errores**: Marcado de símbolos erróneos
- **Escalado automático**: Adaptación a BPSK (1D) y QPSK (2D)

## Parámetros de Configuración

### Parámetros Principales
- **Bit Rate** (100-10000 bps): Velocidad de transmisión
- **Modulación** (BPSK/QPSK): Esquema de modulación
- **Frecuencia Portadora** (1000-20000 Hz): Frecuencia de la sinusoide portadora
- **Amplitud Portadora** (0.1-2.0): Amplitud de la señal modulada
- **SNR** (0-30 dB): Relación señal-ruido del canal
- **Longitud de Datos** (3-8 bits): Número de bits a simular

### Validaciones Implementadas
```typescript
function validateConfig(config: any) {
  if (config.dataLength < 3 || config.dataLength > 8)
    throw new Error('Longitud de datos inválida (3-8)');
  if (!['BPSK', 'QPSK'].includes(config.modulationType))
    throw new Error('Tipo de modulación inválido');
  if (config.bitRate < 100 || config.bitRate > 10000)
    throw new Error('Bit rate fuera de rango (100-10000)');
  // ... más validaciones
}
```

## Gestión del Historial

### useSimulationHistory.ts
Maneja el almacenamiento y recuperación de simulaciones:

```typescript
interface SimulationRecord {
  id: string;
  timestamp: number;
  config: SimulationConfig;
  results: SimulationResults;
}

const addSimulation = (config, results) => {
  const newSimulation = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    config: { ...config },
    results: { ...results }
  };
  setSimulations(prev => [newSimulation, ...prev]);
};
```

## Exportación de Resultados

El sistema permite exportar:
1. **Imágenes PNG**: Captura de canvas individuales o combinados
2. **Reportes TXT**: Análisis técnico detallado con:
   - Parámetros de configuración
   - Métricas de rendimiento (BER, errores)
   - Análisis comparativo entre simulaciones
   - Recomendaciones técnicas

## Optimizaciones de Rendimiento

1. **Muestreo Adaptativo**: `samplesPerBit = max(100, floor(2000/bitRate))`
2. **Límite de Puntos**: Máximo 2000 puntos para portadora
3. **Redibujado Selectivo**: Solo actualiza canvas modificados
4. **Debouncing**: Evita redibujados excesivos durante cambios de parámetros

## Casos de Uso Educativos

1. **Comparación BPSK vs QPSK**: Eficiencia espectral y complejidad
2. **Efectos del Ruido**: Impacto del SNR en la tasa de error
3. **Análisis de Constelación**: Visualización de la dispersión de símbolos
4. **Optimización de Parámetros**: Encontrar configuraciones óptimas

Este simulador implementa los algoritmos estándar de telecomunicaciones con precisión matemática, proporcionando una herramienta educativa completa para el estudio de sistemas de modulación digital.
