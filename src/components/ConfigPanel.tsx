
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
    bitSource?: 'random' | 'custom';
    customBits?: string;
  };
  onConfigChange: (config: any) => void;
}

const PARAM_LIMITS = {
  bitRate: { min: 100, max: 100000 },
  carrierFreq: { min: 1000, max: 100000 },
  carrierAmplitude: { min: 0.1, max: 2.0 },
  snrDb: { min: 0, max: 30 },
  dataLength: { min: 3, max: 16 },
};

export const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [customBits, setCustomBits] = useState(config.customBits || '');

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
    if (key === 'customBits') {
      if (!/^[01]*$/.test(value)) {
        err = 'Solo se permiten 0 y 1.';
      } else if (value.length < PARAM_LIMITS.dataLength.min || value.length > PARAM_LIMITS.dataLength.max) {
        err = `La secuencia debe tener entre ${PARAM_LIMITS.dataLength.min} y ${PARAM_LIMITS.dataLength.max} bits.`;
      } else if (config.modulationType === 'QPSK' && value.length % 2 !== 0) {
        err = 'Para QPSK, la longitud debe ser par.';
      }
    }
    setErrors((prev) => ({ ...prev, [key]: err }));
    return err === '';
  };

  const updateConfig = (key: string, value: any) => {
    let newConfig = { ...config, [key]: value };
    if (key === 'modulationType' && value === 'QPSK' && newConfig.dataLength % 2 !== 0) {
      newConfig.dataLength = newConfig.dataLength + 1;
      setErrors((prev) => ({ ...prev, dataLength: '' }));
    }
    if (key === 'customBits') {
      setCustomBits(value);
    }
    validate(key, value);
    onConfigChange(newConfig);
  };

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateConfig(key, numValue);
    }
  };

  const hasErrors = Object.values(errors).some((e) => e);

  const educationalTip = () => {
    if (config.dataLength < 4) return 'Para observar patrones claros, se recomienda usar al menos 4 bits.';
    if (config.noiseEnabled && config.snrDb < 7) return 'Un SNR bajo puede dificultar la interpretación de resultados.';
    if (config.modulationType === 'QPSK' && config.dataLength % 2 !== 0) return 'QPSK requiere longitud de datos par.';
    return '';
  };

  return (
    <Card className="bg-card/50 border-border glow h-fit" role="region" aria-label="Panel de configuración de simulación">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-cyan text-sm">
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasErrors && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs" role="alert">
            <AlertTriangle className="w-3 h-3" />
            <span>Corrige los parámetros resaltados.</span>
          </div>
        )}
        
        {educationalTip() && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs" role="note">
            <Info className="w-3 h-3" />
            <span>{educationalTip()}</span>
          </div>
        )}

        {/* Bit Rate */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-tech-cyan flex items-center gap-1">
            Bit Rate: {config.bitRate} bps
            <Info className="w-3 h-3" />
          </Label>
          <div className="flex gap-2">
            <Slider
              value={[config.bitRate]}
              onValueChange={([value]) => updateConfig('bitRate', value)}
              max={PARAM_LIMITS.bitRate.max}
              min={PARAM_LIMITS.bitRate.min}
              step={500}
              className="flex-1"
            />
            <Input
              type="number"
              value={config.bitRate}
              onChange={(e) => handleInputChange('bitRate', e.target.value)}
              className="w-20 text-xs"
              min={PARAM_LIMITS.bitRate.min}
              max={PARAM_LIMITS.bitRate.max}
            />
          </div>
          {errors.bitRate && <div className="text-xs text-red-500">{errors.bitRate}</div>}
        </div>

        <Separator className="bg-border" />

        {/* Modulation Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-tech-green flex items-center gap-1">
            Tipo de Modulación
            <Info className="w-3 h-3" />
          </Label>
          <Select
            value={config.modulationType}
            onValueChange={(value) => updateConfig('modulationType', value)}
          >
            <SelectTrigger className="bg-input border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BPSK">BPSK</SelectItem>
              <SelectItem value="QPSK">QPSK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-border" />

        {/* Carrier Frequency */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-tech-purple flex items-center gap-1">
            <Radio className="w-3 h-3" />
            Freq. Portadora: {config.carrierFreq} Hz
            <Info className="w-3 h-3" />
          </Label>
          <div className="flex gap-2">
            <Slider
              value={[config.carrierFreq]}
              onValueChange={([value]) => updateConfig('carrierFreq', value)}
              max={PARAM_LIMITS.carrierFreq.max}
              min={PARAM_LIMITS.carrierFreq.min}
              step={1000}
              className="flex-1"
            />
            <Input
              type="number"
              value={config.carrierFreq}
              onChange={(e) => handleInputChange('carrierFreq', e.target.value)}
              className="w-20 text-xs"
              min={PARAM_LIMITS.carrierFreq.min}
              max={PARAM_LIMITS.carrierFreq.max}
            />
          </div>
          {errors.carrierFreq && <div className="text-xs text-red-500">{errors.carrierFreq}</div>}
        </div>

        {/* Carrier Amplitude */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-tech-orange flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Amplitud: {config.carrierAmplitude}V
            <Info className="w-3 h-3" />
          </Label>
          <div className="flex gap-2">
            <Slider
              value={[config.carrierAmplitude]}
              onValueChange={([value]) => updateConfig('carrierAmplitude', value)}
              max={PARAM_LIMITS.carrierAmplitude.max}
              min={PARAM_LIMITS.carrierAmplitude.min}
              step={0.1}
              className="flex-1"
            />
            <Input
              type="number"
              value={config.carrierAmplitude}
              onChange={(e) => handleInputChange('carrierAmplitude', e.target.value)}
              className="w-16 text-xs"
              min={PARAM_LIMITS.carrierAmplitude.min}
              max={PARAM_LIMITS.carrierAmplitude.max}
              step={0.1}
            />
          </div>
          {errors.carrierAmplitude && <div className="text-xs text-red-500">{errors.carrierAmplitude}</div>}
        </div>

        <Separator className="bg-border" />

        {/* Noise Control */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="noise-enabled"
              checked={config.noiseEnabled}
              onCheckedChange={(checked) => updateConfig('noiseEnabled', checked)}
            />
            <Label htmlFor="noise-enabled" className="text-xs font-medium flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Ruido Gaussiano
              <Info className="w-3 h-3" />
            </Label>
          </div>

          {config.noiseEnabled && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-destructive flex items-center gap-1">
                SNR: {config.snrDb} dB
                <Info className="w-3 h-3" />
              </Label>
              <div className="flex gap-2">
                <Slider
                  value={[config.snrDb]}
                  onValueChange={([value]) => updateConfig('snrDb', value)}
                  max={PARAM_LIMITS.snrDb.max}
                  min={PARAM_LIMITS.snrDb.min}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.snrDb}
                  onChange={(e) => handleInputChange('snrDb', e.target.value)}
                  className="w-16 text-xs"
                  min={PARAM_LIMITS.snrDb.min}
                  max={PARAM_LIMITS.snrDb.max}
                />
              </div>
              {errors.snrDb && <div className="text-xs text-red-500">{errors.snrDb}</div>}
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Data Length */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            Longitud: {config.dataLength} bits
            <Info className="w-3 h-3" />
          </Label>
          <div className="flex gap-2">
            <Slider
              value={[config.dataLength]}
              onValueChange={([value]) => updateConfig('dataLength', value)}
              max={PARAM_LIMITS.dataLength.max}
              min={PARAM_LIMITS.dataLength.min}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={config.dataLength}
              onChange={(e) => handleInputChange('dataLength', e.target.value)}
              className="w-16 text-xs"
              min={PARAM_LIMITS.dataLength.min}
              max={PARAM_LIMITS.dataLength.max}
            />
          </div>
          {errors.dataLength && <div className="text-xs text-red-500">{errors.dataLength}</div>}
        </div>

        <Separator className="bg-border" />

        {/* Fuente de bits */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            Secuencia de bits
            <Info className="w-3 h-3" />
          </Label>
          <Select
            value={config.bitSource || 'random'}
            onValueChange={(value) => updateConfig('bitSource', value)}
          >
            <SelectTrigger className="bg-input border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Aleatoria</SelectItem>
              <SelectItem value="custom">Personalizada</SelectItem>
            </SelectContent>
          </Select>
          {((config.bitSource || 'random') === 'custom') && (
            <div className="mt-2">
              <Label className="text-xs font-medium">Secuencia (0 y 1):</Label>
              <Input
                type="text"
                value={customBits}
                onChange={e => {
                  const value = e.target.value.replace(/[^01]/g, '');
                  updateConfig('customBits', value);
                }}
                maxLength={PARAM_LIMITS.dataLength.max}
                className="font-mono text-xs"
                placeholder="Ej: 1011001"
              />
              {errors.customBits && <div className="text-xs text-red-500">{errors.customBits}</div>}
              <div className="text-xs text-muted-foreground mt-1">Longitud: {customBits.length} bits</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
