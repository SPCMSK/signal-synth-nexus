// Panel de configuración de parámetros para SimuMod Pro
// -----------------------------------------------------
// Permite ajustar los parámetros de la simulación con validación, feedback y ayuda didáctica.
// Incluye accesibilidad, advertencias globales y comentarios educativos.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Zap, Radio, Volume2, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ConfigPanelProps {
  config: {
    bitRate: number;
    modulationType: 'BPSK' | 'QPSK';
    carrierFreq: number;
    carrierAmplitude: number;
    snrDb: number;
    noiseEnabled: boolean;
    dataLength: number;
  };
  onConfigChange: (config: any) => void;
}

const PARAM_LIMITS = {
  bitRate: { min: 100, max: 10000 },
  carrierFreq: { min: 1000, max: 20000 },
  carrierAmplitude: { min: 0.1, max: 2.0 },
  snrDb: { min: 0, max: 30 },
  dataLength: { min: 3, max: 8 },
};

export const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  // Estado para feedback visual
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validación inmediata de parámetros
  const validate = (key: string, value: any) => {
    let err = '';
    if (key === 'bitRate' && (value < PARAM_LIMITS.bitRate.min || value > PARAM_LIMITS.bitRate.max)) {
      err = `Debe estar entre ${PARAM_LIMITS.bitRate.min} y ${PARAM_LIMITS.bitRate.max} bps.`;
    }
    if (key === 'carrierFreq' && (value < PARAM_LIMITS.carrierFreq.min || value > PARAM_LIMITS.carrierFreq.max)) {
      err = `Debe estar entre ${PARAM_LIMITS.carrierFreq.min} y ${PARAM_LIMITS.carrierFreq.max} Hz.`;
    }
    if (key === 'carrierAmplitude' && (value < PARAM_LIMITS.carrierAmplitude.min || value > PARAM_LIMITS.carrierAmplitude.max)) {
      err = `Debe estar entre ${PARAM_LIMITS.carrierAmplitude.min} y ${PARAM_LIMITS.carrierAmplitude.max} V.`;
    }
    if (key === 'snrDb' && (value < PARAM_LIMITS.snrDb.min || value > PARAM_LIMITS.snrDb.max)) {
      err = `Debe estar entre ${PARAM_LIMITS.snrDb.min} y ${PARAM_LIMITS.snrDb.max} dB.`;
    }
    if (key === 'dataLength') {
      if (value < PARAM_LIMITS.dataLength.min || value > PARAM_LIMITS.dataLength.max) {
        err = `Debe estar entre ${PARAM_LIMITS.dataLength.min} y ${PARAM_LIMITS.dataLength.max} bits.`;
      }
      if (config.modulationType === 'QPSK' && value % 2 !== 0) {
        err = 'Para QPSK, la longitud debe ser par.';
      }
    }
    setErrors((prev) => ({ ...prev, [key]: err }));
    return err === '';
  };

  // Actualización robusta de configuración
  const updateConfig = (key: string, value: any) => {
    // Si cambia la modulación a QPSK y dataLength es impar, lo ajusta automáticamente
    let newConfig = { ...config, [key]: value };
    if (key === 'modulationType' && value === 'QPSK' && newConfig.dataLength % 2 !== 0) {
      newConfig.dataLength = newConfig.dataLength + 1;
      setErrors((prev) => ({ ...prev, dataLength: '' }));
    }
    validate(key, value);
    onConfigChange(newConfig);
  };

  // Validación global para deshabilitar simulación si hay errores
  const hasErrors = Object.values(errors).some((e) => e);

  // Sugerencias educativas según configuración
  const educationalTip = () => {
    if (config.dataLength < 4) return 'Para observar patrones claros, se recomienda usar al menos 4 bits.';
    if (config.noiseEnabled && config.snrDb < 7) return 'Un SNR bajo puede dificultar la interpretación de resultados.';
    if (config.modulationType === 'QPSK' && config.dataLength % 2 !== 0) return 'QPSK requiere longitud de datos par.';
    return '';
  };

  return (
    <Card className="bg-card/50 border-border glow" role="region" aria-label="Panel de configuración de simulación">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-cyan">
          <Settings className="w-5 h-5 mr-2" aria-label="Icono de configuración" />
          Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Advertencia global si hay errores */}
        {hasErrors && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs" role="alert">
            <AlertTriangle className="w-4 h-4" />
            <span>Corrige los parámetros resaltados para poder simular correctamente.</span>
          </div>
        )}
        {/* Sugerencia educativa */}
        {educationalTip() && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs" role="note">
            <Info className="w-4 h-4" />
            <span>{educationalTip()}</span>
          </div>
        )}

        {/* Bit Rate */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-cyan flex items-center gap-1">
            Bit Rate: {config.bitRate} bps
            <span title="Velocidad de transmisión de bits por segundo. Afecta la resolución temporal.">
              <Info className="w-3 h-3" />
            </span>
          </Label>
          <Slider
            value={[config.bitRate]}
            onValueChange={([value]) => updateConfig('bitRate', value)}
            max={PARAM_LIMITS.bitRate.max}
            min={PARAM_LIMITS.bitRate.min}
            step={100}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{PARAM_LIMITS.bitRate.min} bps</span>
            <span>{PARAM_LIMITS.bitRate.max / 1000}k bps</span>
          </div>
          {errors.bitRate && <div className="text-xs text-red-500">{errors.bitRate}</div>}
        </div>

        <Separator className="bg-border" />

        {/* Modulation Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-green flex items-center gap-1">
            Tipo de Modulación
            <span title="BPSK: 1 bit/símbolo. QPSK: 2 bits/símbolo. QPSK requiere longitud de datos par.">
              <Info className="w-3 h-3" />
            </span>
          </Label>
          <Select
            value={config.modulationType}
            onValueChange={(value) => updateConfig('modulationType', value)}
          >
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BPSK">BPSK (Binary Phase Shift Keying)</SelectItem>
              <SelectItem value="QPSK">QPSK (Quadrature Phase Shift Keying)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-border" />

        {/* Carrier Frequency */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-purple flex items-center gap-1">
            <Radio className="w-4 h-4 inline mr-1" />
            Frecuencia Portadora: {config.carrierFreq} Hz
            <span title="Frecuencia de la onda portadora. Afecta la forma de la señal modulada.">
              <Info className="w-3 h-3" />
            </span>
          </Label>
          <Slider
            value={[config.carrierFreq]}
            onValueChange={([value]) => updateConfig('carrierFreq', value)}
            max={PARAM_LIMITS.carrierFreq.max}
            min={PARAM_LIMITS.carrierFreq.min}
            step={1000}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{PARAM_LIMITS.carrierFreq.min / 1000} kHz</span>
            <span>{PARAM_LIMITS.carrierFreq.max / 1000} kHz</span>
          </div>
          {errors.carrierFreq && <div className="text-xs text-red-500">{errors.carrierFreq}</div>}
        </div>

        {/* Carrier Amplitude */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-orange flex items-center gap-1">
            <Zap className="w-4 h-4 inline mr-1" />
            Amplitud Portadora: {config.carrierAmplitude}V
            <span title="Amplitud máxima de la portadora. Influye en la potencia de la señal.">
              <Info className="w-3 h-3" />
            </span>
          </Label>
          <Slider
            value={[config.carrierAmplitude]}
            onValueChange={([value]) => updateConfig('carrierAmplitude', value)}
            max={PARAM_LIMITS.carrierAmplitude.max}
            min={PARAM_LIMITS.carrierAmplitude.min}
            step={0.1}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{PARAM_LIMITS.carrierAmplitude.min}V</span>
            <span>{PARAM_LIMITS.carrierAmplitude.max}V</span>
          </div>
          {errors.carrierAmplitude && <div className="text-xs text-red-500">{errors.carrierAmplitude}</div>}
        </div>

        <Separator className="bg-border" />

        {/* Noise Control */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="noise-enabled"
              checked={config.noiseEnabled}
              onCheckedChange={(checked) => updateConfig('noiseEnabled', checked)}
            />
            <Label htmlFor="noise-enabled" className="text-sm font-medium flex items-center gap-1">
              <Volume2 className="w-4 h-4 inline mr-1" />
              Ruido Gaussiano
              <span title="Activa la simulación de ruido en el canal. El SNR controla la relación señal-ruido.">
                <Info className="w-3 h-3" />
              </span>
            </Label>
          </div>

          {config.noiseEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-destructive flex items-center gap-1">
                SNR: {config.snrDb} dB
                <span title="Signal-to-Noise Ratio. A mayor SNR, menor ruido.">
                  <Info className="w-3 h-3" />
                </span>
              </Label>
              <Slider
                value={[config.snrDb]}
                onValueChange={([value]) => updateConfig('snrDb', value)}
                max={PARAM_LIMITS.snrDb.max}
                min={PARAM_LIMITS.snrDb.min}
                step={1}
                className="tech-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{PARAM_LIMITS.snrDb.min} dB</span>
                <span>{PARAM_LIMITS.snrDb.max} dB</span>
              </div>
              {errors.snrDb && <div className="text-xs text-red-500">{errors.snrDb}</div>}
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Data Length */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            Longitud de Datos: {config.dataLength} bits
            <span title="Cantidad de bits a simular. Para QPSK debe ser par.">
              <Info className="w-3 h-3" />
            </span>
          </Label>
          <Slider
            value={[config.dataLength]}
            onValueChange={([value]) => updateConfig('dataLength', value)}
            max={PARAM_LIMITS.dataLength.max}
            min={PARAM_LIMITS.dataLength.min}
            step={1}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{PARAM_LIMITS.dataLength.min} bits</span>
            <span>{PARAM_LIMITS.dataLength.max} bits</span>
          </div>
          {errors.dataLength && <div className="text-xs text-red-500">{errors.dataLength}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
