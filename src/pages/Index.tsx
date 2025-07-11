import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CircuitBoard, Signal, Waves, Circle, Square, History } from 'lucide-react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { SignalVisualization } from '@/components/SignalVisualization';
import { ConstellationDiagram } from '@/components/ConstellationDiagram';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ExportPanel } from '@/components/ExportPanel';
import { DocumentationPanel } from '@/components/DocumentationPanel';
import { Header } from '@/components/Header';
import { useSignalProcessor } from '@/hooks/useSignalProcessor';
import { useSimulationHistory } from '@/hooks/useSimulationHistory';

const Index = () => {
  // Estado de configuración de la simulación
  const [config, setConfig] = useState({
    bitRate: 1000,
    modulationType: 'BPSK' as 'BPSK' | 'QPSK',
    carrierFreq: 5000,
    carrierAmplitude: 1,
    snrDb: 10,
    noiseEnabled: false,
    dataLength: 4,
    bitSource: 'random' as 'random' | 'custom',
    customBits: '1010'
  });

  // Estados de control de simulación y paneles
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);
  const simulateBtnRef = useCallback((node: HTMLButtonElement | null) => {
    if (node && !isSimulating) node.focus();
  }, [isSimulating]);
  
  // Lógica de procesamiento de señal y gestión de historial
  const { 
    digitalSignal, 
    modulatedSignal, 
    demodulatedSignal,
    constellationData,
    ber,
    processSignal,
    isProcessing 
  } = useSignalProcessor();

  const {
    simulations,
    addSimulation,
    clearHistory,
    totalSimulations
  } = useSimulationHistory();

  // Validación didáctica de configuración
  const validateConfig = useCallback(() => {
    if (config.dataLength < 4 || (config.noiseEnabled && config.snrDb < 7)) {
      setShowConfigWarning(true);
    } else {
      setShowConfigWarning(false);
    }
  }, [config]);

  // Ejecutar validación al cambiar configuración
  useEffect(() => { validateConfig(); }, [config, validateConfig]);

  // Maneja la simulación y guarda en historial
  const handleSimulate = useCallback(async () => {
    console.log('Simulate button clicked with config:', config);
    setIsSimulating(true);
    try {
      await processSignal(config);
      
      // Esperar a que el procesamiento termine y luego guardar en historial
      setTimeout(() => {
        if (digitalSignal && modulatedSignal && ber) {
          addSimulation(config, {
            digitalSignal,
            modulatedSignal,
            demodulatedSignal,
            constellationData,
            ber
          });
        }
      }, 100);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [config, processSignal, digitalSignal, modulatedSignal, demodulatedSignal, constellationData, ber, addSimulation]);

  // Maneja cambios de configuración
  const handleConfigChange = useCallback((newConfig: typeof config) => {
    setConfig(newConfig);
  }, []);

  return (
    <div className="min-h-screen bg-background tech-grid">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Barra de estado y acciones */}
        <div className="flex items-center justify-between" aria-label="Barra de estado de simulación">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-tech-cyan text-tech-cyan" title="Tipo de modulación actual">
              <Signal className="w-3 h-3 mr-1" />
              {config.modulationType}
            </Badge>
            <Badge variant="outline" className="border-tech-green text-tech-green" title="Velocidad de transmisión">
              <Waves className="w-3 h-3 mr-1" />
              {config.bitRate} bps
            </Badge>
            <Badge variant="outline" className="border-tech-purple text-tech-purple" title="Relación señal/ruido">
              <CircuitBoard className="w-3 h-3 mr-1" />
              SNR: {config.snrDb} dB
            </Badge>
            {totalSimulations > 0 && (
              <Badge variant="outline" className="border-tech-orange text-tech-orange" title="Simulaciones realizadas">
                <History className="w-3 h-3 mr-1" />
                {totalSimulations} simulaciones
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {totalSimulations > 0 && (
              <Button
                onClick={() => { clearHistory(); setTimeout(() => simulateBtnRef(document.querySelector('#simulate-btn')), 200); }}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                aria-label="Limpiar historial de simulaciones"
                title="Borra todas las simulaciones previas"
              >
                Limpiar Historial
              </Button>
            )}
            <Button
              onClick={() => setShowDocumentation(!showDocumentation)}
              variant="outline"
              className="border-muted hover:border-tech-cyan"
              aria-label="Abrir manual de usuario"
              title="Ver ayuda, tips y documentación"
            >
              Manual de Usuario
            </Button>
            <Button
              id="simulate-btn"
              ref={simulateBtnRef}
              onClick={handleSimulate}
              disabled={isSimulating || isProcessing}
              className="bg-tech-cyan hover:bg-tech-cyan/80 text-background font-semibold glow"
              aria-label="Ejecutar simulación"
              title="Ejecuta la simulación con la configuración actual"
            >
              {isSimulating ? 'Simulando...' : 'Ejecutar Simulación'}
            </Button>
          </div>
        </div>

        {/* Mensaje de advertencia didáctica */}
        {showConfigWarning && (
          <div className="my-2 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm" role="alert">
            <strong>Advertencia:</strong> La configuración actual puede no ser robusta para una simulación educativa óptima. Se recomienda usar al menos 8 bits y SNR &gt; 7 dB para observar resultados representativos.
          </div>
        )}

        {/* Panel de documentación */}
        {showDocumentation && (
          <DocumentationPanel onClose={() => setShowDocumentation(false)} />
        )}

        {/* Layout mejorado con mejor distribución */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Metrics and Export Panel - Movido más a la izquierda */}
          <div className="xl:col-span-2 space-y-6">
            <MetricsPanel
              ber={ber}
              config={config}
              isProcessing={isProcessing}
            />
            
            <ExportPanel
              currentSimulation={{
                digitalSignal,
                modulatedSignal,
                demodulatedSignal,
                constellationData,
                config,
                ber
              }}
              simulationHistory={simulations}
            />
          </div>
          
          {/* Visualization Area - Expandido */}
          <div className="xl:col-span-8 space-y-6">
            <SignalVisualization
              digitalSignal={digitalSignal}
              modulatedSignal={modulatedSignal}
              demodulatedSignal={demodulatedSignal}
              isProcessing={isProcessing}
              showCarrier={true}
              carrierFreq={config.carrierFreq}
              carrierAmplitude={config.carrierAmplitude}
            />
            <ConstellationDiagram
              data={constellationData}
              modulationType={config.modulationType}
              noiseEnabled={config.noiseEnabled}
            />
          </div>
          
          {/* Configuration Panel - Movido más a la derecha */}
          <div className="xl:col-span-2">
            <ConfigPanel config={config} onConfigChange={handleConfigChange} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>SimuMod Pro v1.0 - Simulador Avanzado de Modulación Digital</p>
          <p className="mt-1">Diseñado para educación en telecomunicaciones y demostración técnica</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
