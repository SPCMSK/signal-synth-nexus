import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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
  // Determina el nivel de calidad del BER
  const getQualityLevel = (berValue: number) => {
    if (berValue === 0) return { level: 'Excelente', color: 'text-tech-green', icon: CheckCircle, desc: 'No se detectaron errores.' };
    if (berValue < 0.001) return { level: 'Muy Buena', color: 'text-tech-cyan', icon: TrendingUp, desc: 'BER muy bajo, excelente calidad.' };
    if (berValue < 0.01) return { level: 'Buena', color: 'text-yellow-400', icon: Activity, desc: 'BER aceptable para la mayoría de aplicaciones.' };
    return { level: 'Pobre', color: 'text-destructive', icon: AlertTriangle, desc: 'BER alto, la comunicación es poco confiable.' };
  };

  const quality = ber ? getQualityLevel(ber.value) : null;
  const QualityIcon = quality?.icon || Activity;

  // Mensaje didáctico si hay pocos bits
  const fewBitsWarning = ber && ber.totalBits < 10
    ? 'Advertencia: El número de bits es bajo. El BER puede no ser representativo.'
    : '';

  // Explicaciones didácticas
  const explanations = {
    ber: 'El Bit Error Rate (BER) indica la proporción de bits erróneos respecto al total transmitido. Valores bajos son mejores.',
    eficiencia: 'Eficiencia espectral: cantidad de bits transmitidos por Hz de ancho de banda.',
    bw: 'Ancho de banda estimado igual al bit rate (aprox. para BPSK/QPSK).',
    estados: 'Cantidad de símbolos distintos que puede transmitir la modulación.'
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-cyan gap-2">
          <Activity className="w-5 h-5 mr-2" />
          Métricas del Sistema
          <Info className="w-4 h-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BER Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              Bit Error Rate (BER)
              <Info className="w-3 h-3" />
            </span>
            {quality && (
              <Badge variant="outline" className={`border-current ${quality.color}`} title={quality.desc}>
                <QualityIcon className="w-3 h-3 mr-1" />
                {quality.level}
              </Badge>
            )}
          </div>
          {ber ? (
            <>
              <div className="text-2xl font-bold text-tech-cyan">
                {ber.value.toExponential(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {ber.errorsCount} errores de {ber.totalBits} bits
              </div>
              {fewBitsWarning && (
                <div className="text-xs text-yellow-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {fewBitsWarning}
                </div>
              )}
              <Progress 
                value={Math.max(0, 100 - (ber.value * 100000))} 
                className={`h-2 ${quality?.color || ''}`}
              />
              <div className="text-xs text-muted-foreground mt-1">{explanations.ber}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Ejecuta una simulación para ver el BER.</div>
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
          <h4 className="text-sm font-medium text-tech-green flex items-center gap-1">
            Configuración Actual <Info className="w-3 h-3" />
          </h4>
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
          <h4 className="text-sm font-medium text-tech-purple flex items-center gap-1">
            Indicadores <Info className="w-3 h-3" />
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">Eficiencia Espectral <Info className="w-3 h-3" /></span>
              <span className="text-sm font-mono text-tech-cyan">
                {config.modulationType === 'BPSK' ? '1' : '2'} bits/Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">Ancho de Banda <Info className="w-3 h-3" /></span>
              <span className="text-sm font-mono text-tech-green">
                {config.bitRate} Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">Estados <Info className="w-3 h-3" /></span>
              <span className="text-sm font-mono text-tech-purple">
                {config.modulationType === 'BPSK' ? '2' : '4'}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {explanations.eficiencia}<br />{explanations.bw}<br />{explanations.estados}
          </div>
        </div>
        {/* Quality Status */}
        <div className="p-3 rounded-lg border border-border bg-background/50 mt-2">
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
