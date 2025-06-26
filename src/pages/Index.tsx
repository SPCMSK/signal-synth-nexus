
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Chip, Signal, Waves, Circle, Square } from 'lucide-react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { SignalVisualization } from '@/components/SignalVisualization';
import { ConstellationDiagram } from '@/components/ConstellationDiagram';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ExportPanel } from '@/components/ExportPanel';
import { DocumentationPanel } from '@/components/DocumentationPanel';
import { Header } from '@/components/Header';
import { useSignalProcessor } from '@/hooks/useSignalProcessor';

const Index = () => {
  const [config, setConfig] = useState({
    bitRate: 1000,
    modulationType: 'BPSK' as 'BPSK' | 'QPSK',
    carrierFreq: 10000,
    carrierAmplitude: 1,
    snrDb: 20,
    noiseEnabled: false,
    dataLength: 1000
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  
  const { 
    digitalSignal, 
    modulatedSignal, 
    demodulatedSignal,
    constellationData,
    ber,
    processSignal,
    isProcessing 
  } = useSignalProcessor();

  const handleSimulate = useCallback(async () => {
    setIsSimulating(true);
    await processSignal(config);
    setIsSimulating(false);
  }, [config, processSignal]);

  useEffect(() => {
    handleSimulate();
  }, [handleSimulate]);

  return (
    <div className="min-h-screen bg-background tech-grid">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-tech-cyan text-tech-cyan">
              <Signal className="w-3 h-3 mr-1" />
              {config.modulationType}
            </Badge>
            <Badge variant="outline" className="border-tech-green text-tech-green">
              <Waves className="w-3 h-3 mr-1" />
              {config.bitRate} bps
            </Badge>
            <Badge variant="outline" className="border-tech-purple text-tech-purple">
              <Chip className="w-3 h-3 mr-1" />
              SNR: {config.snrDb} dB
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowDocumentation(!showDocumentation)}
              variant="outline"
              className="border-muted hover:border-tech-cyan"
            >
              Manual de Usuario
            </Button>
            <Button
              onClick={handleSimulate}
              disabled={isSimulating || isProcessing}
              className="bg-tech-cyan hover:bg-tech-cyan/80 text-background font-semibold glow"
            >
              {isSimulating ? 'Simulando...' : 'Ejecutar Simulación'}
            </Button>
          </div>
        </div>

        {/* Documentation Panel */}
        {showDocumentation && (
          <DocumentationPanel onClose={() => setShowDocumentation(false)} />
        )}

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Configuration Panel */}
          <div className="xl:col-span-3">
            <ConfigPanel config={config} onConfigChange={setConfig} />
          </div>

          {/* Visualization Area */}
          <div className="xl:col-span-6 space-y-6">
            <SignalVisualization
              digitalSignal={digitalSignal}
              modulatedSignal={modulatedSignal}
              demodulatedSignal={demodulatedSignal}
              isProcessing={isProcessing}
            />
            
            <ConstellationDiagram
              data={constellationData}
              modulationType={config.modulationType}
              noiseEnabled={config.noiseEnabled}
            />
          </div>

          {/* Metrics and Export Panel */}
          <div className="xl:col-span-3 space-y-6">
            <MetricsPanel
              ber={ber}
              config={config}
              isProcessing={isProcessing}
            />
            
            <ExportPanel
              digitalSignal={digitalSignal}
              modulatedSignal={modulatedSignal}
              demodulatedSignal={demodulatedSignal}
              constellationData={constellationData}
              config={config}
              ber={ber}
            />
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
