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
  carrierSignal: SignalData | null;
  modulatedSignal: SignalData | null;
  demodulatedSignal: SignalData | null;
  isProcessing: boolean;
}

// Visualización didáctica de señales para SimuMod Pro
// ---------------------------------------------------
// Muestra la evolución temporal de las señales digital, modulada y demodulada.
// Incluye accesibilidad, tooltips, leyendas y comentarios educativos.

export const SignalVisualization = ({
  digitalSignal,
  carrierSignal,
  modulatedSignal,
  demodulatedSignal,
  isProcessing
}: SignalVisualizationProps) => {
  const canvasRefs = {
    digital: useRef<HTMLCanvasElement>(null),
    carrier: useRef<HTMLCanvasElement>(null), // NUEVO: ref para portadora
    modulated: useRef<HTMLCanvasElement>(null),
    demodulated: useRef<HTMLCanvasElement>(null),
    digitalSingle: useRef<HTMLCanvasElement>(null),
    carrierSingle: useRef<HTMLCanvasElement>(null), // NUEVO: ref para portadora
    modulatedSingle: useRef<HTMLCanvasElement>(null),
    demodulatedSingle: useRef<HTMLCanvasElement>(null)
  };

  // Estado para mostrar tooltip de valor al pasar el mouse
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number | null; label: string } | null>(null);

  // Dibuja ejes y etiquetas en el canvas
  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number, minX: number, maxX: number, minY: number, maxY: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 1;
    // Eje X
    ctx.beginPath();
    ctx.moveTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.stroke();
    // Etiquetas
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.fillText(minX.toFixed(2), 40, height - 15);
    ctx.fillText(maxX.toFixed(2), width - 40, height - 15);
    ctx.fillText(maxY.toFixed(2), 5, 20);
    ctx.fillText(minY.toFixed(2), 5, height - 35);
    ctx.restore();
  };

  // Dibuja la señal y ejes
  const drawSignal = (canvas: HTMLCanvasElement, data: SignalData | null, color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data || !data.time.length) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    // Rango de datos
    let minX = Math.min(...data.time);
    let maxX = Math.max(...data.time);
    let minY = Math.min(...data.amplitude);
    let maxY = Math.max(...data.amplitude);
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
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    // Leyenda
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(data.label, width - 120, 20);
    ctx.restore();
  };

  // Mensaje si no hay datos
  const renderEmpty = (label: string) => (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <span className="text-lg">No hay datos para {label}</span>
      <span className="text-xs">Ejecuta una simulación para visualizar la señal.</span>
    </div>
  );

  // Mensaje educativo si la señal es muy corta
  const renderShortSignalWarning = (data: SignalData | null) => (
    data && data.time.length < 4 ? (
      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2" role="alert">
        <Info className="w-3 h-3 inline mr-1" />
        La señal es muy corta para observar patrones claros. Se recomienda simular al menos 4 bits.
      </div>
    ) : null
  );

  // Redibuja todas las señales
  const redrawAllSignals = () => {
    if (digitalSignal && canvasRefs.digital.current) {
      drawSignal(canvasRefs.digital.current, digitalSignal, '#00ffff');
    } else if (canvasRefs.digital.current) {
      const ctx = canvasRefs.digital.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.digital.current.width, canvasRefs.digital.current.height);
    }
    // Portadora: forzar onda con freq y amp reales si no hay datos o pocos puntos
    if (canvasRefs.carrier.current) {
      drawSignal(canvasRefs.carrier.current, carrierSignal, '#007bff');
    }
    if (modulatedSignal && canvasRefs.modulated.current) {
      drawSignal(canvasRefs.modulated.current, modulatedSignal, '#00ff7f');
    } else if (canvasRefs.modulated.current) {
      const ctx = canvasRefs.modulated.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.modulated.current.width, canvasRefs.modulated.current.height);
    }
    if (demodulatedSignal && canvasRefs.demodulated.current) {
      drawSignal(canvasRefs.demodulated.current, demodulatedSignal, '#ff7f00');
    } else if (canvasRefs.demodulated.current) {
      const ctx = canvasRefs.demodulated.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.demodulated.current.width, canvasRefs.demodulated.current.height);
    }
    if (digitalSignal && canvasRefs.digitalSingle.current) {
      drawSignal(canvasRefs.digitalSingle.current, digitalSignal, '#00ffff');
    } else if (canvasRefs.digitalSingle.current) {
      const ctx = canvasRefs.digitalSingle.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.digitalSingle.current.width, canvasRefs.digitalSingle.current.height);
    }
    // Portadora individual: forzar onda con freq y amp reales si no hay datos o pocos puntos
    if (canvasRefs.carrierSingle.current) {
      drawSignal(canvasRefs.carrierSingle.current, carrierSignal, '#007bff');
    }
    if (modulatedSignal && canvasRefs.modulatedSingle.current) {
      drawSignal(canvasRefs.modulatedSingle.current, modulatedSignal, '#00ff7f');
    } else if (canvasRefs.modulatedSingle.current) {
      const ctx = canvasRefs.modulatedSingle.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.modulatedSingle.current.width, canvasRefs.modulatedSingle.current.height);
    }
    if (demodulatedSignal && canvasRefs.demodulatedSingle.current) {
      drawSignal(canvasRefs.demodulatedSingle.current, demodulatedSignal, '#ff7f00');
    } else if (canvasRefs.demodulatedSingle.current) {
      const ctx = canvasRefs.demodulatedSingle.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRefs.demodulatedSingle.current.width, canvasRefs.demodulatedSingle.current.height);
    }
  };

  useEffect(() => {
    redrawAllSignals();
  }, [digitalSignal, carrierSignal, modulatedSignal, demodulatedSignal]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      redrawAllSignals();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleTabChange = () => {
    setTimeout(() => {
      redrawAllSignals();
    }, 50);
  };

  // Tooltip de valor al pasar el mouse (solo para canvas de señal única)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, data: SignalData | null) => {
    if (!data) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const minX = Math.min(...data.time);
    const maxX = Math.max(...data.time);
    const minY = Math.min(...data.amplitude);
    const maxY = Math.max(...data.amplitude);
    // Calcular el tiempo correspondiente al mouse
    const t = minX + ((x - 40) / (width - 50)) * (maxX - minX);
    // Buscar el índice más cercano
    let idx = data.time.findIndex((tt) => tt >= t);
    if (idx === -1) idx = data.time.length - 1;
    setTooltip({ x, y, value: data.amplitude[idx], label: data.label });
  };
  const handleMouseLeave = () => setTooltip(null);

  return (
    <Card className="bg-card/50 border-border glow-green" role="region" aria-label="Visualización de señales">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-green">
          <Activity className="w-5 h-5 mr-2" aria-label="Icono de actividad" />
          Visualización de Señales
          <span className="relative group ml-2">
            <Info className="w-4 h-4" aria-label="Información sobre la gráfica" />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 px-2 py-1 rounded bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-20">
              Cada gráfica muestra la evolución temporal de la señal.<br />Eje X: tiempo (s), Eje Y: amplitud.<br />Pasa el mouse sobre la señal para ver la amplitud puntual.
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5 bg-muted/50" role="tablist" aria-label="Selector de tipo de señal">
            <TabsTrigger value="combined" aria-label="Ver todas las señales superpuestas">Combinado</TabsTrigger>
            <TabsTrigger value="digital" aria-label="Ver solo la señal digital">Digital</TabsTrigger>
            <TabsTrigger value="carrier" aria-label="Ver solo la portadora">Portadora</TabsTrigger>
            <TabsTrigger value="modulated" aria-label="Ver solo la señal modulada">Modulada</TabsTrigger>
            <TabsTrigger value="demodulated" aria-label="Ver solo la señal demodulada">Demodulada</TabsTrigger>
          </TabsList>
          <TabsContent value="combined" className="space-y-4" role="tabpanel" aria-label="Todas las señales">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-tech-cyan text-tech-cyan">
                    <Waves className="w-3 h-3 mr-1" />
                    Señal Digital
                  </Badge>
                </div>
                <canvas
                  ref={canvasRefs.digital}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                  aria-label="Gráfica de señal digital"
                />
                {!digitalSignal && renderEmpty('la señal digital')}
                {renderShortSignalWarning(digitalSignal)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    <Waves className="w-3 h-3 mr-1" />
                    Portadora
                  </Badge>
                </div>
                <canvas
                  ref={canvasRefs.carrier}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                  aria-label="Gráfica de portadora"
                />
                {!carrierSignal && renderEmpty('la portadora')}
                {renderShortSignalWarning(carrierSignal)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-tech-green text-tech-green">
                    <Activity className="w-3 h-3 mr-1" />
                    Señal Modulada
                  </Badge>
                </div>
                <canvas
                  ref={canvasRefs.modulated}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                  aria-label="Gráfica de señal modulada"
                />
                {!modulatedSignal && renderEmpty('la señal modulada')}
                {renderShortSignalWarning(modulatedSignal)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-tech-orange text-tech-orange">
                    <Zap className="w-3 h-3 mr-1" />
                    Señal Demodulada
                  </Badge>
                </div>
                <canvas
                  ref={canvasRefs.demodulated}
                  width={600}
                  height={120}
                  className="w-full border border-border rounded bg-background/50"
                  aria-label="Gráfica de señal demodulada"
                />
                {!demodulatedSignal && renderEmpty('la señal demodulada')}
                {renderShortSignalWarning(demodulatedSignal)}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="digital" role="tabpanel" aria-label="Solo señal digital">
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
                  aria-label="Gráfica interactiva de señal digital"
                />
                {!digitalSignal && renderEmpty('la señal digital')}
                {renderShortSignalWarning(digitalSignal)}
                {tooltip && tooltip.label === 'Señal Digital' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded shadow"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="carrier" role="tabpanel" aria-label="Solo portadora">
            <div className="space-y-2">
              <Badge variant="outline" className="border-blue-600 text-blue-600">
                <Waves className="w-3 h-3 mr-1" />
                Portadora
              </Badge>
              <div className="relative">
                <canvas
                  ref={canvasRefs.carrierSingle}
                  width={600}
                  height={300}
                  className="w-full border border-border rounded bg-background/50"
                  onMouseMove={(e) => handleMouseMove(e, carrierSignal)}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Gráfica interactiva de portadora"
                />
                {!carrierSignal && renderEmpty('la portadora')}
                {renderShortSignalWarning(carrierSignal)}
                {tooltip && tooltip.label === 'Portadora' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded shadow"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="modulated" role="tabpanel" aria-label="Solo señal modulada">
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
                  aria-label="Gráfica interactiva de señal modulada"
                />
                {!modulatedSignal && renderEmpty('la señal modulada')}
                {renderShortSignalWarning(modulatedSignal)}
                {tooltip && tooltip.label === 'Señal Modulada' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded shadow"
                    style={{ left: tooltip.x + 10, top: tooltip.y }}
                  >
                    Amplitud: {tooltip.value?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="demodulated" role="tabpanel" aria-label="Solo señal demodulada">
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
                  aria-label="Gráfica interactiva de señal demodulada"
                />
                {!demodulatedSignal && renderEmpty('la señal demodulada')}
                {renderShortSignalWarning(demodulatedSignal)}
                {tooltip && tooltip.label === 'Señal Demodulada' && (
                  <div
                    className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded shadow"
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
