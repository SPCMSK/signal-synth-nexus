
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Square } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ConstellationPoint {
  i: number;
  q: number;
  symbol: string;
  isError?: boolean;
}

interface ConstellationDiagramProps {
  data: {
    transmitted: ConstellationPoint[];
    received: ConstellationPoint[];
  } | null;
  modulationType: 'BPSK' | 'QPSK';
  noiseEnabled: boolean;
}

export const ConstellationDiagram = ({
  data,
  modulationType,
  noiseEnabled
}: ConstellationDiagramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawConstellation = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 4;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale / 2, 0);
      ctx.lineTo(centerX + i * scale / 2, height);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale / 2);
      ctx.lineTo(width, centerY + i * scale / 2);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    // I axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    // Q axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw ideal constellation points
    ctx.fillStyle = '#00ff7f';
    if (modulationType === 'BPSK') {
      // BPSK: +1 and -1 on I axis
      ctx.beginPath();
      ctx.arc(centerX + scale, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX - scale, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // QPSK: four points
      const points = [
        { i: 1, q: 1 }, { i: -1, q: 1 },
        { i: -1, q: -1 }, { i: 1, q: -1 }
      ];
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(
          centerX + point.i * scale / Math.sqrt(2),
          centerY - point.q * scale / Math.sqrt(2),
          8,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    }

    // Draw received points
    if (data.received.length > 0) {
      data.received.forEach(point => {
        const x = centerX + point.i * scale;
        const y = centerY - point.q * scale;
        
        ctx.fillStyle = point.isError ? '#ff4444' : '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = point.isError ? '#ff4444' : '#ffff00';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Roboto Mono';
    ctx.textAlign = 'center';
    ctx.fillText('I', width - 20, centerY - 10);
    ctx.fillText('Q', centerX + 10, 20);
  };

  useEffect(() => {
    drawConstellation();
  }, [data, modulationType, noiseEnabled]);

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-tech-purple">
            {modulationType === 'BPSK' ? (
              <Circle className="w-5 h-5 mr-2" />
            ) : (
              <Square className="w-5 h-5 mr-2" />
            )}
            Diagrama de Constelación
          </span>
          <Badge variant="outline" className="border-tech-purple text-tech-purple">
            {modulationType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full border border-border rounded bg-background/50"
          />
          
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-tech-green rounded-full"></div>
              <span>Puntos Ideales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Recibidos</span>
            </div>
            {noiseEnabled && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Errores</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
