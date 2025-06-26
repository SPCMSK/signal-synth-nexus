
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

  const handleExportImage = (type: string) => {
    // Simular exportación de imagen
    toast({
      title: "Imagen Exportada",
      description: `Gráfico ${type} guardado como PNG`,
    });
  };

  const handleExportPDF = () => {
    // Simular exportación de PDF
    toast({
      title: "Reporte Generado",
      description: "Informe técnico exportado como PDF",
    });
  };

  const handleScheduleDemo = () => {
    // Simular programación de demo
    toast({
      title: "Demo Programada",
      description: "Invitación enviada para demostración técnica",
    });
  };

  const handleUploadReport = () => {
    // Simular carga de reporte
    toast({
      title: "Reporte Cargado",
      description: "Archivo PDF subido exitosamente",
    });
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
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Digital
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('modulada')}
              className="justify-start"
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Modulada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('constelacion')}
              className="justify-start"
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
          >
            <FileText className="w-4 h-4 mr-2" />
            Generar Informe PDF
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
            Subir Informe PDF
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
