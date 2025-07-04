import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Waves, Activity, Zap, Info, Clock } from 'lucide-react';
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
  const [timeUnit, setTimeUnit] = useState<'ms' | 'rad'>('ms');

  const convertTimeUnit = (time: number[], unit: 'ms' | 'rad', freq: number = carrierFreq) => {
    if (unit === 'rad') {
      return time.map(t => 2 * Math.PI * freq * t);
    }
    return time.map(t => t * 1000); // Convertir a milisegundos
  };

  const getTimeLabel = (unit: 'ms' | 'rad') => {
    return unit === 'ms' ? 'Tiempo (ms)' : 'Fase (rad)';
  };

  const formatTimeValue = (value: number, unit: 'ms' | 'rad') => {
    if (unit === 'rad') {
      const piValue = value / Math.PI;
      if (Math.abs(piValue - Math.round(piValue)) < 0.1) {
        const rounded = Math.round(piValue);
        if (rounded === 0) return '0';
        if (rounded === 1) return 'π';
        if (rounded === -1) return '-π';
        if (rounded === 2) return '2π';
        if (rounded === -2) return '-2π';
        return `${rounded}π`;
      }
      return `${piValue.toFixed(2)}π`;
    }
    return `${value.toFixed(3)} ms`;
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number, minX: number, maxX: number, minY: number, maxY: number, unit: 'ms' | 'rad' = 'ms') => {
    ctx.save();
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 1;
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(50, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, height - 40);
    ctx.stroke();
    
    // Etiquetas
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // Etiquetas del eje X
    const xSteps = 5;
    for (let i = 0; i <= xSteps; i++) {
      const x = 50 + (i * (width - 70)) / xSteps;
      const timeValue = minX + (i * (maxX - minX)) / xSteps;
      ctx.fillText(formatTimeValue(timeValue, unit), x, height - 25);
    }
    
    // Etiquetas del eje Y
    ctx.textAlign = 'right';
    ctx.fillText(maxY.toFixed(2), 45, 25);
    ctx.fillText(minY.toFixed(2), 45, height - 45);
    ctx.fillText('0', 45, height/2);
    
    // Títulos de ejes
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(getTimeLabel(unit), width/2, height - 5);
    
    ctx.save();
    ctx.translate(15, height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Amplitud (V)', 0, 0);
    ctx.restore();
    
    ctx.restore();
  };

  const drawSignal = (canvas: HTMLCanvasElement, data: SignalData | null, color: string, unit: 'ms' | 'rad' = 'ms') => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data || !data.time.length) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpiar canvas completamente
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    // Convertir tiempo según la unidad
    const convertedTime = convertTimeUnit(data.time, unit, carrierFreq);
    const minX = Math.min(...convertedTime);
    const maxX = Math.max(...convertedTime);
    const minY = Math.min(...data.amplitude);
    const maxY = Math.max(...data.amplitude);
    
    // Grilla
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 50 + ((width - 70) * i) / 10;
      const y = 20 + ((height - 60) * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
    
    drawAxes(ctx, width, height, minX, maxX, minY, maxY, unit);
    
    // Dibujar señal
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    convertedTime.forEach((time, index) => {
      const x = 50 + ((time - minX) / (maxX - minX || 1)) * (width - 70);
      const y = height - 40 - ((data.amplitude[index] - minY) / (maxY - minY || 1)) * (height - 60);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Etiqueta de la señal
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(data.label, width - 150, 35);
    ctx.restore();
  };

  const drawCarrier = (canvas: HTMLCanvasElement, color: string, unit: 'ms' | 'rad' = 'ms') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpiar canvas completamente
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    let tArr: number[] = [];
    let aArr: number[] = [];
    let minX = 0;
    let maxX = 1;
    
    if (digitalSignal && digitalSignal.time.length > 1) {
      minX = Math.min(...digitalSignal.time);
      maxX = Math.max(...digitalSignal.time);
    } else {
      const cycles = 3;
      const T = 1 / carrierFreq;
      maxX = cycles * T;
    }
    
    const points = 1000;
    tArr = Array.from({ length: points }, (_, i) => minX + (i * (maxX - minX)) / (points - 1));
    aArr = tArr.map(t => carrierAmplitude * Math.cos(2 * Math.PI * carrierFreq * t));
    
    // Convertir tiempo según la unidad
    const convertedTime = convertTimeUnit(tArr, unit, carrierFreq);
    const minXConverted = Math.min(...convertedTime);
    const maxXConverted = Math.max(...convertedTime);
    const minY = -carrierAmplitude;
    const maxY = carrierAmplitude;
    
    // Grilla y ejes
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 50 + ((width - 70) * i) / 10;
      const y = 20 + ((height - 60) * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
    
    drawAxes(ctx, width, height, minXConverted, maxXConverted, minY, maxY, unit);
    
    // Dibujar portadora
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    convertedTime.forEach((time, index) => {
      const x = 50 + ((time - minXConverted) / (maxXConverted - minXConverted || 1)) * (width - 70);
      const y = height - 40 - ((aArr[index] - minY) / (maxY - minY || 1)) * (height - 60);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Etiqueta
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Portadora', width - 150, 35);
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
      drawSignal(canvasRefs.digital.current, digitalSignal, '#00ffff', timeUnit);
    }
    if (showCarrier && canvasRefs.carrier.current) {
      drawCarrier(canvasRefs.carrier.current, '#007bff', timeUnit);
    }
    if (modulatedSignal && canvasRefs.modulated.current) {
      drawSignal(canvasRefs.modulated.current, modulatedSignal, '#00ff7f', timeUnit);
    }
    if (demodulatedSignal && canvasRefs.demodulated.current) {
      drawSignal(canvasRefs.demodulated.current, demodulatedSignal, '#ff7f00', timeUnit);
    }
    
    // Dibujar en vistas individuales
    if (digitalSignal && canvasRefs.digitalSingle.current) {
      drawSignal(canvasRefs.digitalSingle.current, digitalSignal, '#00ffff', timeUnit);
    }
    if (showCarrier && canvasRefs.carrierSingle.current) {
      drawCarrier(canvasRefs.carrierSingle.current, '#007bff', timeUnit);
    }
    if (modulatedSignal && canvasRefs.modulatedSingle.current) {
      drawSignal(canvasRefs.modulatedSingle.current, modulatedSignal, '#00ff7f', timeUnit);
    }
    if (demodulatedSignal && canvasRefs.demodulatedSingle.current) {
      drawSignal(canvasRefs.demodulatedSingle.current, demodulatedSignal, '#ff7f00', timeUnit);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      redrawAllSignals();
    }, 100);
    return () => clearTimeout(timer);
  }, [digitalSignal, modulatedSignal, demodulatedSignal, showCarrier, carrierFreq, carrierAmplitude, timeUnit]);

  const handleTabChange = () => {
    setTimeout(() => {
      redrawAllSignals();
    }, 100);
  };

  return (
    <Card className="bg-card/50 border-border glow-green" role="region" aria-label="Visualización de señales">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-tech-green">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Visualización de Señales
            <Info className="w-4 h-4 ml-2" />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <Select value={timeUnit} onValueChange={(value: 'ms' | 'rad') => setTimeUnit(value)}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ms">ms</SelectItem>
                <SelectItem value="rad">rad</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  width={800}
                  height={150}
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
                  width={800}
                  height={150}
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
                  width={800}
                  height={150}
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
                  width={800}
                  height={150}
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
              <canvas
                ref={canvasRefs.digitalSingle}
                width={800}
                height={400}
                className="w-full border border-border rounded bg-background/50"
              />
              {!digitalSignal && renderEmpty('la señal digital')}
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
                width={800}
                height={400}
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
              <canvas
                ref={canvasRefs.modulatedSingle}
                width={800}
                height={400}
                className="w-full border border-border rounded bg-background/50"
              />
              {!modulatedSignal && renderEmpty('la señal modulada')}
            </div>
          </TabsContent>
          
          <TabsContent value="demodulated">
            <div className="space-y-2">
              <Badge variant="outline" className="border-tech-orange text-tech-orange">
                <Zap className="w-3 h-3 mr-1" />
                Señal Demodulada
              </Badge>
              <canvas
                ref={canvasRefs.demodulatedSingle}
                width={800}
                height={400}
                className="w-full border border-border rounded bg-background/50"
              />
              {!demodulatedSignal && renderEmpty('la señal demodulada')}
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
