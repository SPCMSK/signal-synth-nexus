
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Waves, Activity, Zap, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SignalData {
  time: number[];
  amplitude: number[];
  label: string;
}

interface SignalVisualizationProps {
  digitalSignal: SignalData | null;
  modulatedSignal: SignalData | null;
  demodulatedSignal: SignalData | null;
  isProcessing: boolean;
  showCarrier?: boolean;
  carrierFreq?: number;
  carrierAmplitude?: number;
}

export const SignalVisualization = ({
  digitalSignal,
  modulatedSignal,
  demodulatedSignal,
  isProcessing,
  showCarrier = true,
  carrierFreq = 5000,
  carrierAmplitude = 1
}: SignalVisualizationProps) => {
  const canvasRefs = {
    digital: useRef<HTMLCanvasElement>(null),
    modulated: useRef<HTMLCanvasElement>(null),
    demodulated: useRef<HTMLCanvasElement>(null),
    carrier: useRef<HTMLCanvasElement>(null),
    digitalSingle: useRef<HTMLCanvasElement>(null),
    modulatedSingle: useRef<HTMLCanvasElement>(null),
    demodulatedSingle: useRef<HTMLCanvasElement>(null),
    carrierSingle: useRef<HTMLCanvasElement>(null)
  };

  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number | null; label: string } | null>(null);

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number, minX: number, maxX: number, minY: number, maxY: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.fillText(minX.toFixed(3), 40, height - 15);
    ctx.fillText(maxX.toFixed(3), width - 40, height - 15);
    ctx.fillText(maxY.toFixed(2), 5, 20);
    ctx.fillText(minY.toFixed(2), 5, height - 35);
    ctx.restore();
  };

  const drawSignal = (canvas: HTMLCanvasElement, data: SignalData | null, color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    if (!data || !data.time.length) return;
    
    const minX = Math.min(...data.time);
    const maxX = Math.max(...data.time);
    const minY = Math.min(...data.amplitude);
    const maxY = Math.max(...data.amplitude);
    
    // Grilla
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 40 + ((width - 50) * i) / 10;
      const y = 10 + ((height - 40) * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }
    
    drawAxes(ctx, width, height, minX, maxX, minY, maxY);
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.time.forEach((time, index) => {
      const x = 40 + ((time - minX) / (maxX - minX || 1)) * (width - 50);
      const y = height - 30 - ((data.amplitude[index] - minY) / (maxY - minY || 1)) * (height - 40);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(data.label, width - 120, 20);
    ctx.restore();
  };

  const drawCarrier = (canvas: HTMLCanvasElement, color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    let tArr: number[] = [];
    let aArr: number[] = [];
    let minX = 0;
    let maxX = 1;
    let minY = -carrierAmplitude;
    let maxY = carrierAmplitude;
    
    if (digitalSignal && digitalSignal.time.length > 1) {
      minX = Math.min(...digitalSignal.time);
      maxX = Math.max(...digitalSignal.time);
      const N = Math.min(digitalSignal.time.length, 2000);
      tArr = Array.from({ length: N }, (_, i) => minX + (i * (maxX - minX)) / (N - 1));
      aArr = tArr.map(t => carrierAmplitude * Math.cos(2 * Math.PI * carrierFreq * t));
    } else {
      const cycles = 3;
      const points = 1000;
      const T = 1 / carrierFreq;
      maxX = cycles * T;
      tArr = Array.from({ length: points }, (_, i) => i * maxX / (points - 1));
      aArr = tArr.map(t => carrierAmplitude * Math.cos(2 * Math.PI * carrierFreq * t));
    }
    
    // Grilla
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 40 + ((width - 50) * i) / 10;
      const y = 10 + ((height - 40) * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }
    
    drawAxes(ctx, width, height, minX, maxX, minY, maxY);
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    tArr.forEach((t, index) => {
      const x = 40 + ((t - minX) / (maxX - minX || 1)) * (width - 50);
      const y = height - 30 - ((aArr[index] - minY) / (maxY - minY || 1)) * (height - 40);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Portadora', width - 120, 20);
    ctx.restore();
  };

  const renderEmpty = (label: string) => (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <span className="text-lg">No hay datos para {label}</span>
      <span className="text-xs">Ejecuta una simulación para visualizar la señal.</span>
    </div>
  );

  const redrawAllSignals = () => {
    // Dibujar en vista combinada
    if (digitalSignal && canvasRefs.digital.current) {
      drawSignal(canvasRefs.digital.current, digitalSignal, '#00ffff');
    }
    if (showCarrier && canvasRefs.carrier.current) {
      drawCarrier(canvasRefs.carrier.current, '#007bff');
    }
    if (modulatedSignal && canvasRefs.modulated.current) {
      drawSignal(canvasRefs.modulated.current, modulatedSignal, '#00ff7f');
    }
    if (demodulatedSignal && canvasRefs.demodulated.current) {
      drawSignal(canvasRefs.demodulated.current, demodulatedSignal, '#ff7f00');
    }
    
    // Dibujar en vistas individuales
    if (digitalSignal && canvasRefs.digitalSingle.current) {
      drawSignal(canvasRefs.digitalSingle.current, digitalSignal, '#00ffff');
    }
    if (showCarrier && canvasRefs.carrierSingle.current) {
      drawCarrier(canvasRefs.carrierSingle.current, '#007bff');
    }
    if (modulatedSignal && canvasRefs.modulatedSingle.current) {
      drawSignal(canvasRefs.modulatedSingle.current, modulatedSignal, '#00ff7f');
    }
    if (demodulatedSignal && canvasRefs.demodulatedSingle.current) {
      drawSignal(canvasRefs.demodulatedSingle.current, demodulatedSignal, '#ff7f00');
    }
  };

  useEffect(() => {
    redrawAllSignals();
  }, [digitalSignal, modulatedSignal, demodulatedSignal, showCarrier, carrierFreq, carrierAmplitude]);

  const handleTabChange = () => {
    setTimeout(() => {
      redrawAllSignals();
    }, 50);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, data: SignalData | null) => {
    if (!data) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const minX = Math.min(...data.time);
    const maxX = Math.max(...data.time);
    const t = minX + ((x - 40) / (width - 50)) * (maxX - minX);
    let idx = data.time.findIndex((tt) => tt >= t);
    if (idx === -1) idx = data.time.length - 1;
    setTooltip({ x, y, value: data.amplitude[idx], label: data.label });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <Card className="bg-card/50 border-border glow-green" role="region" aria-label="Visualización de señales">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-green">
          <Activity className="w-5 h-5 mr-2" />
          Visualización de Señales
          <span className="relative group ml-2">
            <Info className="w-4 h-4" />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 px-2 py-1 rounded bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-20">
              Visualiza la evolución temporal de las señales digitales y moduladas
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="combined">Combinado</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="carrier">Portadora</TabsTrigger>
            <TabsTrigger value="modulated">Modulada</TabsTrigger>
            <TabsTrigger value="demodulated">Demodulada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="combined" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="border-tech-cyan text-tech-cyan">
                  <Waves className="w-3 h-3 mr-1" />
                  Señal Digital
                </Badge>
                <canvas
                  ref={canvasRefs.digital}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                />
                {!digitalSignal && renderEmpty('la señal digital')}
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  <Waves className="w-3 h-3 mr-1" />
                  Portadora
                </Badge>
                <canvas
                  ref={canvasRefs.carrier}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="border-tech-green text-tech-green">
                  <Activity className="w-3 h-3 mr-1" />
                  Señal Modulada
                </Badge>
                <canvas
                  ref={canvasRefs.modulated}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                />
                {!modulatedSignal && renderEmpty('la señal modulada')}
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="border-tech-orange text-tech-orange">
                  <Zap className="w-3 h-3 mr-1" />
                  Señal Demodulada
                </Badge>
                <canvas
                  ref={canvasRefs.demodulated}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                />
                {!demodulatedSignal && renderEmpty('la señal demodulada')}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="digital">
            <div className="space-y-2">
              <Badge variant="outline" className="border-tech-cyan text-tech-cyan">
                <Waves className="w-3 h-3 mr-1" />
                Señal Digital
              </Badge>
              <div className="relative">
                <canvas
                  ref={canvasRefs.digitalSingle}
                  width={600}
                  height={300}
                  className="w-full border border-border rounded bg-background/50"
                  onMouseMove={(e) => handleMouseMove(e, digitalSignal)}
                  onMouseLeave={handleMouseLeave}
                />
                {!digitalSignal && renderEmpty('la señal digital')}
                {tooltip && tooltip.label === 'Señal Digital' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="carrier">
            <div className="space-y-2">
              <Badge variant="outline" className="border-blue-600 text-blue-600">
                <Waves className="w-3 h-3 mr-1" />
                Portadora
              </Badge>
              <canvas
                ref={canvasRefs.carrierSingle}
                width={600}
                height={300}
                className="w-full border border-border rounded bg-background/50"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="modulated">
            <div className="space-y-2">
              <Badge variant="outline" className="border-tech-green text-tech-green">
                <Activity className="w-3 h-3 mr-1" />
                Señal Modulada
              </Badge>
              <div className="relative">
                <canvas
                  ref={canvasRefs.modulatedSingle}
                  width={600}
                  height={300}
                  className="w-full border border-border rounded bg-background/50"
                  onMouseMove={(e) => handleMouseMove(e, modulatedSignal)}
                  onMouseLeave={handleMouseLeave}
                />
                {!modulatedSignal && renderEmpty('la señal modulada')}
                {tooltip && tooltip.label === 'Señal Modulada' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="demodulated">
            <div className="space-y-2">
              <Badge variant="outline" className="border-tech-orange text-tech-orange">
                <Zap className="w-3 h-3 mr-1" />
                Señal Demodulada
              </Badge>
              <div className="relative">
                <canvas
                  ref={canvasRefs.demodulatedSingle}
                  width={600}
                  height={300}
                  className="w-full border border-border rounded bg-background/50"
                  onMouseMove={(e) => handleMouseMove(e, demodulatedSignal)}
                  onMouseLeave={handleMouseLeave}
                />
                {!demodulatedSignal && renderEmpty('la señal demodulada')}
                {tooltip && tooltip.label === 'Señal Demodulada' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-tech-cyan">
              <div className="w-4 h-4 border-2 border-tech-cyan border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando señales...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
