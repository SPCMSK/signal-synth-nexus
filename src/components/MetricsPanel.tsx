
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetricsPanelProps {
  ber: {
    value: number;
    errorsCount: number;
    totalBits: number;
    snrDb?: number;
  } | null;
  config: {
    bitRate: number;
    modulationType: 'BPSK' | 'QPSK';
    carrierFreq: number;
    snrDb: number;
    noiseEnabled: boolean;
  };
  isProcessing: boolean;
}

export const MetricsPanel = ({ ber, config, isProcessing }: MetricsPanelProps) => {
  const getQualityLevel = (berValue: number) => {
    if (berValue === 0) return { level: 'Excelente', color: 'text-tech-green', icon: CheckCircle };
    if (berValue < 0.001) return { level: 'Muy Buena', color: 'text-tech-cyan', icon: TrendingUp };
    if (berValue < 0.01) return { level: 'Buena', color: 'text-yellow-400', icon: Activity };
    return { level: 'Pobre', color: 'text-destructive', icon: AlertTriangle };
  };

  const quality = ber ? getQualityLevel(ber.value) : null;
  const QualityIcon = quality?.icon || Activity;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-cyan">
          <Activity className="w-5 h-5 mr-2" />
          Métricas del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BER Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bit Error Rate (BER)</span>
            {quality && (
              <Badge variant="outline" className={`border-current ${quality.color}`}>
                <QualityIcon className="w-3 h-3 mr-1" />
                {quality.level}
              </Badge>
            )}
          </div>
          
          {ber && (
            <>
              <div className="text-2xl font-bold text-tech-cyan">
                {ber.value.toExponential(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {ber.errorsCount} errores de {ber.totalBits} bits
              </div>
              <Progress 
                value={Math.max(0, 100 - (ber.value * 100000))} 
                className="h-2"
              />
            </>
          )}
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-tech-cyan border-t-transparent rounded-full animate-spin"></div>
              <span>Calculando...</span>
            </div>
          )}
        </div>

        <Separator />

        {/* System Configuration */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-tech-green">Configuración Actual</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Modulación:</span>
              <div className="font-mono text-tech-cyan">{config.modulationType}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Bit Rate:</span>
              <div className="font-mono text-tech-green">{config.bitRate} bps</div>
            </div>
            <div>
              <span className="text-muted-foreground">Fc:</span>
              <div className="font-mono text-tech-purple">{config.carrierFreq} Hz</div>
            </div>
            <div>
              <span className="text-muted-foreground">SNR:</span>
              <div className="font-mono text-tech-orange">
                {config.noiseEnabled ? `${config.snrDb} dB` : 'Sin ruido'}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-tech-purple">Indicadores</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eficiencia Espectral</span>
              <span className="text-sm font-mono text-tech-cyan">
                {config.modulationType === 'BPSK' ? '1' : '2'} bits/Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ancho de Banda</span>
              <span className="text-sm font-mono text-tech-green">
                {config.bitRate} Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estados</span>
              <span className="text-sm font-mono text-tech-purple">
                {config.modulationType === 'BPSK' ? '2' : '4'}
              </span>
            </div>
          </div>
        </div>

        {/* Quality Status */}
        <div className="p-3 rounded-lg border border-border bg-background/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-tech-green rounded-full signal-animation"></div>
            <span className="text-sm font-medium">Estado del Sistema</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Simulación en tiempo real activa
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
