import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  // Estado para tooltip de punto
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // Dibuja el diagrama de constelación
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
    // Limpiar canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    // Grilla
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale / 2, 0);
      ctx.lineTo(centerX + i * scale / 2, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale / 2);
      ctx.lineTo(width, centerY + i * scale / 2);
      ctx.stroke();
    }
    // Ejes
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke();
    // Etiquetas de ejes
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('I', width - 20, centerY - 10);
    ctx.fillText('Q', centerX + 15, 25);
    ctx.restore();
    // Puntos ideales
    ctx.save();
    ctx.fillStyle = '#00ff7f';
    ctx.strokeStyle = '#00ff7f';
    ctx.lineWidth = 2;
    if (modulationType === 'BPSK') {
      ctx.beginPath(); ctx.arc(centerX + scale, centerY, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX - scale, centerY, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.font = '12px monospace';
      ctx.fillStyle = '#00ff7f';
      ctx.fillText('+1', centerX + scale, centerY + 25);
      ctx.fillText('-1', centerX - scale, centerY + 25);
    } else {
      const points = [
        { i: 1, q: 1, label: '+1,+1' },
        { i: -1, q: 1, label: '-1,+1' },
        { i: -1, q: -1, label: '-1,-1' },
        { i: 1, q: -1, label: '+1,-1' }
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
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff7f';
        ctx.fillText(point.label, centerX + point.i * scale / Math.sqrt(2), centerY - point.q * scale / Math.sqrt(2) + 25);
      });
    }
    ctx.restore();
    // Puntos recibidos
    if (data.received.length > 0) {
      data.received.forEach(point => {
        const x = centerX + point.i * scale;
        const y = centerY - point.q * scale;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = point.isError ? '#ff4444' : '#ffff00';
        ctx.globalAlpha = point.isError ? 0.9 : 0.7;
        ctx.shadowColor = point.isError ? '#ff4444' : '#ffff00';
        ctx.shadowBlur = point.isError ? 10 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });
    }
  };

  // Tooltip interactivo sobre puntos recibidos
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!data || !data.received.length) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 4;
    // Buscar punto más cercano
    let minDist = 9999;
    let closest: ConstellationPoint | null = null;
    let px = 0, py = 0;
    data.received.forEach(point => {
      const cx = centerX + point.i * scale;
      const cy = centerY - point.q * scale;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < minDist && dist < 12) {
        minDist = dist;
        closest = point;
        px = cx; py = cy;
      }
    });
    if (closest) {
      setTooltip({ x: px, y: py, label: closest.symbol, value: `I=${closest.i.toFixed(2)}, Q=${closest.q.toFixed(2)}${closest.isError ? ' (Error)' : ''}` });
    } else {
      setTooltip(null);
    }
  };
  const handleMouseLeave = () => setTooltip(null);

  useEffect(() => {
    drawConstellation();
  }, [data, modulationType, noiseEnabled]);

  // Contadores para leyenda
  const errorCount = data?.received.filter(p => p.isError).length || 0;
  const okCount = data?.received.length ? data.received.length - errorCount : 0;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-tech-purple gap-2">
            {modulationType === 'BPSK' ? (
              <Circle className="w-5 h-5 mr-2" />
            ) : (
              <Square className="w-5 h-5 mr-2" />
            )}
            Diagrama de Constelación
            <Info className="w-4 h-4" />
          </span>
          <Badge variant="outline" className="border-tech-purple text-tech-purple">
            {modulationType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full border border-border rounded bg-background/50"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {/* Tooltip interactivo */}
            {tooltip && (
              <div
                className="absolute z-10 px-2 py-1 text-xs bg-black/80 text-white rounded shadow"
                style={{ left: tooltip.x + 12, top: tooltip.y }}
              >
                <div className="font-bold">Símbolo: {tooltip.label}</div>
                <div>{tooltip.value}</div>
              </div>
            )}
            {!data && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-lg">No hay datos para el diagrama</span>
                <span className="text-xs">Ejecuta una simulación para visualizar la constelación.</span>
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-tech-green rounded-full"></div>
              <span>Puntos Ideales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Recibidos ({okCount})</span>
            </div>
            {noiseEnabled && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Errores ({errorCount})</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
