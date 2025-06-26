
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Image, Calendar, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  digitalSignal: any;
  modulatedSignal: any;
  demodulatedSignal: any;
  constellationData: any;
  config: any;
  ber: any;
}

export const ExportPanel = ({
  digitalSignal,
  modulatedSignal,
  demodulatedSignal,
  constellationData,
  config,
  ber
}: ExportPanelProps) => {
  const { toast } = useToast();

  const exportCanvasAsImage = (canvasSelector: string, filename: string) => {
    try {
      const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
      if (!canvas) {
        toast({
          title: "Error",
          description: "No se encontró el gráfico para exportar",
          variant: "destructive"
        });
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagen Exportada",
            description: `${filename} guardado exitosamente`,
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al exportar la imagen",
        variant: "destructive"
      });
    }
  };

  const handleExportImage = (type: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch (type) {
      case 'digital':
        exportCanvasAsImage('canvas', `señal_digital_${timestamp}.png`);
        break;
      case 'modulada':
        exportCanvasAsImage('canvas', `señal_modulada_${timestamp}.png`);
        break;
      case 'constelacion':
        exportCanvasAsImage('canvas', `constelacion_${timestamp}.png`);
        break;
      default:
        toast({
          title: "Error",
          description: "Tipo de gráfico no reconocido",
          variant: "destructive"
        });
    }
  };

  const generatePDFContent = () => {
    const timestamp = new Date().toLocaleString('es-ES');
    return `
      REPORTE DE SIMULACIÓN - MODULACIÓN DIGITAL
      ==========================================
      
      Fecha: ${timestamp}
      
      CONFIGURACIÓN:
      - Tipo de Modulación: ${config.modulationType}
      - Bit Rate: ${config.bitRate} bps
      - Frecuencia Portadora: ${config.carrierFreq} Hz
      - Amplitud Portadora: ${config.carrierAmplitude} V
      - Longitud de Datos: ${config.dataLength} bits
      - Ruido: ${config.noiseEnabled ? `Habilitado (SNR: ${config.snrDb} dB)` : 'No'}
      
      RESULTADOS:
      - BER (Bit Error Rate): ${ber ? ber.value.toExponential(3) : 'N/A'}
      - Errores detectados: ${ber ? ber.errorsCount : 'N/A'}
      - Total de bits: ${ber ? ber.totalBits : 'N/A'}
      
      ANÁLISIS:
      ${config.modulationType === 'BPSK' ? 
        'BPSK utiliza 2 fases para representar 0s y 1s, ofreciendo buena robustez al ruido.' :
        'QPSK utiliza 4 fases para representar pares de bits, duplicando la eficiencia espectral.'}
      
      ${config.noiseEnabled ? 
        `Con SNR de ${config.snrDb} dB, se observa ${ber && ber.value > 0.01 ? 'alta' : 'baja'} tasa de error.` :
        'Sin ruido, la transmisión es ideal con BER mínimo.'}
    `;
  };

  const handleExportPDF = () => {
    try {
      const content = generatePDFContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      a.href = url;
      a.download = `reporte_modulacion_${timestamp}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Reporte Generado",
        description: "Informe técnico exportado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleScheduleDemo = () => {
    const subject = encodeURIComponent('Solicitud de Demostración - Simulador de Modulación');
    const body = encodeURIComponent(`
Estimado/a Profesor/a,

Me gustaría agendar una demostración del simulador de modulación digital.

Configuración actual:
- Modulación: ${config.modulationType}
- Bit Rate: ${config.bitRate} bps
- Frecuencia: ${config.carrierFreq} Hz
- BER obtenido: ${ber ? ber.value.toExponential(3) : 'N/A'}

Quedo atento/a a su respuesta.

Saludos cordiales.
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
    
    toast({
      title: "Demo Programada",
      description: "Cliente de correo abierto para enviar solicitud",
    });
  };

  const handleUploadReport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.txt,.doc,.docx';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Archivo Seleccionado",
          description: `${file.name} listo para procesar`,
        });
        // Aquí se podría implementar la lógica de procesamiento del archivo
      }
    };
    
    input.click();
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-tech-orange">
          <Download className="w-5 h-5 mr-2" />
          Exportar Resultados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Graphics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-cyan">Gráficos</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('digital')}
              className="justify-start"
              disabled={!digitalSignal}
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Digital
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('modulada')}
              className="justify-start"
              disabled={!modulatedSignal}
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Modulada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('constelacion')}
              className="justify-start"
              disabled={!constellationData}
            >
              <Image className="w-4 h-4 mr-2" />
              Constelación
            </Button>
          </div>
        </div>

        <Separator />

        {/* Export Report */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-green">Reportes</h4>
          <Button
            onClick={handleExportPDF}
            className="w-full bg-tech-green hover:bg-tech-green/80 text-background"
            disabled={!ber}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generar Informe TXT
          </Button>
        </div>

        <Separator />

        {/* Upload Report */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-purple">Cargar Reporte</h4>
          <Button
            variant="outline"
            onClick={handleUploadReport}
            className="w-full border-tech-purple text-tech-purple hover:bg-tech-purple/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Archivo
          </Button>
        </div>

        <Separator />

        {/* Schedule Demo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-cyan">Demostración</h4>
          <Button
            variant="outline"
            onClick={handleScheduleDemo}
            className="w-full border-tech-cyan text-tech-cyan hover:bg-tech-cyan/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar con Profesor
          </Button>
        </div>

        {/* Export Summary */}
        <div className="p-3 rounded-lg border border-border bg-background/50 text-sm">
          <div className="text-muted-foreground mb-2">Resumen de Exportación:</div>
          <div className="space-y-1 text-xs">
            <div>• Modulación: {config.modulationType}</div>
            <div>• BER: {ber ? ber.value.toExponential(2) : 'N/A'}</div>
            <div>• Fc: {config.carrierFreq} Hz</div>
            <div>• SNR: {config.noiseEnabled ? `${config.snrDb} dB` : 'Sin ruido'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
