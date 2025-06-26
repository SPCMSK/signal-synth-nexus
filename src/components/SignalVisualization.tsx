
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Waves, Activity, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
}

export const SignalVisualization = ({
  digitalSignal,
  modulatedSignal,
  demodulatedSignal,
  isProcessing
}: SignalVisualizationProps) => {
  const canvasRefs = {
    digital: useRef<HTMLCanvasElement>(null),
    modulated: useRef<HTMLCanvasElement>(null),
    demodulated: useRef<HTMLCanvasElement>(null)
  };

  const drawSignal = (canvas: HTMLCanvasElement, data: SignalData, color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.time.length) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw signal
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const timeRange = Math.max(...data.time) - Math.min(...data.time);
    const ampRange = Math.max(...data.amplitude) - Math.min(...data.amplitude);
    const ampMin = Math.min(...data.amplitude);
    
    data.time.forEach((time, index) => {
      const x = ((time - Math.min(...data.time)) / timeRange) * width;
      const y = height - ((data.amplitude[index] - ampMin) / ampRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (digitalSignal && canvasRefs.digital.current) {
      drawSignal(canvasRefs.digital.current, digitalSignal, '#00ffff');
    }
  }, [digitalSignal]);

  useEffect(() => {
    if (modulatedSignal && canvasRefs.modulated.current) {
      drawSignal(canvasRefs.modulated.current, modulatedSignal, '#00ff7f');
    }
  }, [modulatedSignal]);

  useEffect(() => {
    if (demodulatedSignal && canvasRefs.demodulated.current) {
      drawSignal(canvasRefs.demodulated.current, demodulatedSignal, '#ff7f00');
    }
  }, [demodulatedSignal]);

  return (
    <Card className="bg-card/50 border-border glow-green">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-green">
          <Activity className="w-5 h-5 mr-2" />
          Visualización de Señales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="combined">Combinado</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="modulated">Modulada</TabsTrigger>
            <TabsTrigger value="demodulated">Demodulada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="combined" className="space-y-4">
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
                />
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
                />
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
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="digital">
            <canvas
              ref={canvasRefs.digital}
              width={600}
              height={300}
              className="w-full border border-border rounded bg-background/50"
            />
          </TabsContent>
          
          <TabsContent value="modulated">
            <canvas
              ref={canvasRefs.modulated}
              width={600}
              height={300}
              className="w-full border border-border rounded bg-background/50"
            />
          </TabsContent>
          
          <TabsContent value="demodulated">
            <canvas
              ref={canvasRefs.demodulated}
              width={600}
              height={300}
              className="w-full border border-border rounded bg-background/50"
            />
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
