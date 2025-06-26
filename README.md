
# SimuMod Pro - Simulador Avanzado de Modulación Digital

## Descripción General
SimuMod Pro es una aplicación web avanzada para la simulación y análisis de sistemas de modulación digital. Permite visualizar señales digitales, moduladas y demoduladas, analizar diagramas de constelación, calcular la Tasa de Error de Bit (BER), y generar reportes técnicos detallados.

## Arquitectura del Proyecto

### Estructura de Carpetas
```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes de interfaz base (shadcn/ui)
│   ├── ConfigPanel.tsx # Panel de configuración de parámetros
│   ├── ConstellationDiagram.tsx # Visualización del diagrama de constelación
│   ├── DocumentationPanel.tsx # Panel de documentación del usuario
│   ├── ExportPanel.tsx # Panel para exportar resultados
│   ├── Header.tsx      # Encabezado de la aplicación
│   ├── MetricsPanel.tsx # Panel de métricas y estadísticas
│   └── SignalVisualization.tsx # Visualización de señales
├── hooks/              # Hooks personalizados de React
│   ├── useSignalProcessor.ts # Lógica principal de procesamiento de señales
│   └── useSimulationHistory.ts # Gestión del historial de simulaciones
├── pages/              # Páginas principales de la aplicación
│   ├── Index.tsx       # Página principal del simulador
│   └── NotFound.tsx    # Página de error 404
├── lib/                # Utilidades y funciones auxiliares
└── App.tsx             # Componente raíz de la aplicación
```

## Componentes Principales

### 1. SignalVisualization.tsx
**Propósito**: Visualiza las señales digitales, moduladas y demoduladas en tiempo real.

**Funcionalidades principales**:
- Renderizado de señales usando Canvas API
- Vista combinada y vistas individuales por pestañas
- Dibujo de grillas y efectos visuales
- Manejo de cambios de tamaño y redibujado automático

**Lógica clave**:
- `drawSignal()`: Función para dibujar señales en canvas con colores específicos
- `redrawAllSignals()`: Redibuja todas las señales para evitar solapamientos
- Sistema de referencias múltiples para diferentes pestañas

### 2. ConstellationDiagram.tsx
**Propósito**: Muestra el diagrama de constelación para modulaciones BPSK y QPSK.

**Funcionalidades principales**:
- Visualización de puntos ideales vs recibidos
- Detección y marcado de errores de símbolo
- Escalado automático según el tipo de modulación
- Representación visual del ruido y distorsión

**Lógica clave**:
- Mapeo de bits a puntos de constelación
- Cálculo de posiciones en el plano I-Q
- Diferenciación visual entre puntos correctos y erróneos

### 3. ConfigPanel.tsx
**Propósito**: Panel de control para configurar parámetros de simulación.

**Parámetros configurables**:
- **Bit Rate** (100-10000 bps): Velocidad de transmisión de datos
- **Tipo de Modulación** (BPSK/QPSK): Esquema de modulación digital
- **Frecuencia Portadora** (1000-20000 Hz): Frecuencia de la señal portadora
- **Amplitud Portadora** (0.1-2.0): Amplitud de la señal portadora
- **SNR** (0-30 dB): Relación Señal-Ruido cuando el ruido está habilitado
- **Habilitar Ruido**: Activar/desactivar la adición de ruido gaussiano
- **Longitud de Datos** (3-8 bits): Número de bits a simular

### 4. MetricsPanel.tsx
**Propósito**: Muestra métricas de rendimiento y estadísticas de la simulación.

**Métricas principales**:
- **BER (Bit Error Rate)**: Tasa de error de bit calculada
- **Número de errores**: Cantidad absoluta de bits erróneos
- **Total de bits**: Cantidad total de bits transmitidos
- **SNR efectivo**: Relación señal-ruido aplicada

### 5. ExportPanel.tsx
**Propósito**: Permite exportar resultados de simulaciones y generar reportes.

**Funcionalidades de exportación**:
- **Imágenes**: Captura de gráficas individuales o combinadas
- **Reportes técnicos**: Generación de análisis detallados en formato TXT
- **Selección de alcance**: Simulación actual vs. todas las simulaciones

## Hooks Personalizados

### useSignalProcessor.ts
**Propósito**: Contiene toda la lógica de procesamiento de señales digitales.

**Funciones principales**:
- `generateRandomBits()`: Genera secuencias aleatorias de bits
- `addGaussianNoise()`: Añade ruido gaussiano a las señales
- `processSignal()`: Función principal que ejecuta todo el pipeline de procesamiento

**Pipeline de procesamiento**:
1. **Generación de bits**: Crea secuencia binaria aleatoria
2. **Señal digital**: Convierte bits a señal NRZ (Non-Return-to-Zero)
3. **Modulación**: Aplica BPSK o QPSK según configuración
4. **Canal con ruido**: Añade ruido gaussiano si está habilitado
5. **Demodulación**: Simula el proceso de demodulación con errores
6. **Cálculo de BER**: Compara bits transmitidos vs recibidos
7. **Constelación**: Genera puntos para el diagrama de constelación

**Algoritmos de modulación**:
- **BPSK**: Bit '0' → fase π, Bit '1' → fase 0
- **QPSK**: Pares de bits mapeados a 4 fases (π/4, 3π/4, 5π/4, 7π/4)

### useSimulationHistory.ts
**Propósito**: Gestiona el historial de simulaciones realizadas.

**Funcionalidades**:
- Almacenamiento de configuraciones y resultados
- Gestión de IDs únicos por simulación
- Limpieza del historial
- Recuperación de simulaciones específicas

## Lógica Principal de Análisis de Señales

### 1. Generación de Señales
```typescript
// Generación de bits aleatorios
const bits = generateRandomBits(config.dataLength);

// Conversión a señal digital NRZ
digitalTime.forEach((t, index) => {
  const bitIndex = Math.floor(index / samplesPerBit);
  digitalAmplitude.push(bits[bitIndex]);
});
```

### 2. Proceso de Modulación
```typescript
// BPSK: Modulación por desplazamiento de fase binaria
if (config.modulationType === 'BPSK') {
  const phase = bits[bitIndex] === 1 ? 0 : Math.PI;
  modulated = amplitude * Math.cos(2π * frequency * t + phase);
}

// QPSK: Modulación por desplazamiento de fase cuaternaria
if (config.modulationType === 'QPSK') {
  // Mapeo de pares de bits a fases específicas
  const phase = mapBitsToPhase(bit1, bit2);
  modulated = amplitude * Math.cos(2π * frequency * t + phase);
}
```

### 3. Modelo de Canal con Ruido
```typescript
// Aplicación de ruido gaussiano usando Box-Muller
const addGaussianNoise = (signal, snrDb) => {
  const snrLinear = Math.pow(10, snrDb / 10);
  const signalPower = calculatePower(signal);
  const noisePower = signalPower / snrLinear;
  const noiseStd = Math.sqrt(noisePower);
  
  return signal.map(sample => sample + gaussianNoise(noiseStd));
};
```

### 4. Cálculo de BER
```typescript
// Comparación bit a bit
const errors = demodulatedBits.reduce((count, bit, index) => {
  return count + (bit !== originalBits[index] ? 1 : 0);
}, 0);

const ber = errors / totalBits;
```

### 5. Generación de Constelación
```typescript
// Mapeo de bits a puntos I-Q
const constellationPoints = bits.map((bit, index) => {
  if (modulationType === 'BPSK') {
    return { i: bit === 1 ? 1 : -1, q: 0 };
  } else {
    // QPSK mapping
    return mapBitsToIQ(bit1, bit2);
  }
});
```

## Tecnologías Utilizadas

### Frontend
- **React 18**: Framework principal de interfaz
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de estilos utilitarios
- **shadcn/ui**: Biblioteca de componentes UI modernos
- **Lucide React**: Iconografía vectorial

### Procesamiento
- **Canvas API**: Renderizado de gráficas en tiempo real
- **Web APIs**: FileReader, Blob para exportación de archivos

### Gestión de Estado
- **React Hooks**: useState, useCallback, useEffect
- **Hooks personalizados**: Separación de lógica de negocio

## Flujo de Trabajo de la Aplicación

1. **Configuración**: Usuario ajusta parámetros en ConfigPanel
2. **Simulación**: Click en "Ejecutar Simulación" dispara useSignalProcessor
3. **Procesamiento**: Se ejecuta el pipeline completo de señales
4. **Visualización**: Las señales se renderizan en tiempo real
5. **Análisis**: Se calculan métricas y se actualizan paneles
6. **Historial**: La simulación se guarda automáticamente
7. **Exportación**: Usuario puede descargar resultados

## Características Técnicas Avanzadas

### Robustez del Sistema
- Validación de parámetros de entrada
- Manejo de casos extremos (división por cero, arrays vacíos)
- Logging detallado para debugging
- Recuperación graceful ante errores

### Precisión Matemática
- Algoritmos estándar de telecomunicaciones
- Implementación correcta de Box-Muller para ruido gaussiano
- Cálculos de BER teóricos vs prácticos
- Mapeo preciso de constelaciones

### Rendimiento
- Procesamiento asíncrono para evitar bloqueos
- Redibujado optimizado de canvas
- Gestión eficiente de memoria
- Debouncing en controles de entrada

## Casos de Uso Educativos

1. **Demostración de modulación digital**: Visualizar diferencias entre BPSK y QPSK
2. **Análisis de ruido**: Observar efectos del SNR en la calidad de señal
3. **Cálculo de BER**: Entender la relación entre ruido y errores
4. **Diagramas de constelación**: Visualizar la dispersión de símbolos
5. **Comparación de configuraciones**: Analizar múltiples simulaciones

Este simulador está diseñado para ser una herramienta educativa completa que permite a estudiantes y profesionales explorar los conceptos fundamentales de las comunicaciones digitales de manera interactiva y visual.
