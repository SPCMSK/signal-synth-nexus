
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Zap, Radio, Volume2 } from 'lucide-react';

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

export const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    console.log(`Updating ${key} to ${value}:`, newConfig);
    onConfigChange(newConfig);
  };

  return (
    <Card className="bg-card/50 border-border glow">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-cyan">
          <Settings className="w-5 h-5 mr-2" />
          Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bit Rate */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-cyan">
            Bit Rate: {config.bitRate} bps
          </Label>
          <Slider
            value={[config.bitRate]}
            onValueChange={([value]) => updateConfig('bitRate', value)}
            max={2000}
            min={100}
            step={100}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 bps</span>
            <span>2k bps</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Modulation Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-green">
            Tipo de Modulación
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
          <Label className="text-sm font-medium text-tech-purple">
            <Radio className="w-4 h-4 inline mr-1" />
            Frecuencia Portadora: {config.carrierFreq} Hz
          </Label>
          <Slider
            value={[config.carrierFreq]}
            onValueChange={([value]) => updateConfig('carrierFreq', value)}
            max={20000}
            min={1000}
            step={1000}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 kHz</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Carrier Amplitude */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-tech-orange">
            <Zap className="w-4 h-4 inline mr-1" />
            Amplitud Portadora: {config.carrierAmplitude}V
          </Label>
          <Slider
            value={[config.carrierAmplitude]}
            onValueChange={([value]) => updateConfig('carrierAmplitude', value)}
            max={3}
            min={0.5}
            step={0.1}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5V</span>
            <span>3V</span>
          </div>
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
            <Label htmlFor="noise-enabled" className="text-sm font-medium">
              <Volume2 className="w-4 h-4 inline mr-1" />
              Ruido Gaussiano
            </Label>
          </div>

          {config.noiseEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-destructive">
                SNR: {config.snrDb} dB
              </Label>
              <Slider
                value={[config.snrDb]}
                onValueChange={([value]) => updateConfig('snrDb', value)}
                max={20}
                min={0}
                step={1}
                className="tech-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 dB</span>
                <span>20 dB</span>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Data Length - Ahora con valores más pequeños */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Longitud de Datos: {config.dataLength} bits
          </Label>
          <Slider
            value={[config.dataLength]}
            onValueChange={([value]) => updateConfig('dataLength', value)}
            max={8}
            min={3}
            step={1}
            className="tech-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 bits</span>
            <span>8 bits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
