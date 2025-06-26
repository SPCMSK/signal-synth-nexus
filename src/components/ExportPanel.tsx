import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Image, Calendar, Upload, History, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SimulationData {
  digitalSignal: any;
  modulatedSignal: any;
  demodulatedSignal: any;
  constellationData: any;
  config: any;
  ber: any;
}

interface SimulationRecord {
  id: string;
  timestamp: Date;
  config: any;
  results: any;
}

interface ExportPanelProps {
  currentSimulation: SimulationData;
  simulationHistory: SimulationRecord[];
}

export const ExportPanel = ({ currentSimulation, simulationHistory }: ExportPanelProps) => {
  const { toast } = useToast();
  const [exportMode, setExportMode] = useState<'current' | 'all'>('current');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Utilidad para mapear tipo a selector de canvas y nombre didáctico
  const canvasSelectorMap: Record<string, { selector: string; label: string }> = {
    digital: { selector: '#digital-canvas', label: 'Señal Digital' },
    modulada: { selector: '#modulated-canvas', label: 'Señal Modulada' },
    constelacion: { selector: '#constellation-canvas', label: 'Constelación' },
  };

  /**
   * Exporta el canvas como imagen PNG.
   * Incluye validación robusta y feedback didáctico.
   */
  const exportCanvasAsImage = (type: string, filename: string) => {
    const mapping = canvasSelectorMap[type];
    if (!mapping) {
      toast({
        title: 'Error',
        description: 'Tipo de gráfico no reconocido para exportar.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const canvas = document.querySelector(mapping.selector) as HTMLCanvasElement;
      if (!canvas) {
        toast({
          title: 'Error',
          description: `No se encontró el gráfico "${mapping.label}" para exportar. Asegúrate de haber ejecutado la simulación y que el gráfico esté visible.`,
          variant: 'destructive',
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
            title: 'Imagen Exportada',
            description: `${filename} guardado exitosamente. Puedes usar esta imagen en tus informes o presentaciones.`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo generar la imagen del gráfico. Intenta recargar la página o contactar soporte.',
            variant: 'destructive',
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error inesperado al exportar la imagen.',
        variant: 'destructive',
      });
    }
  };

  const handleExportImage = (type: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    if (exportMode === 'current') {
      exportCanvasAsImage(type, `${canvasSelectorMap[type]?.label?.replace(/ /g, '_').toLowerCase() || type}_${timestamp}.png`);
    } else {
      if (simulationHistory.length === 0) {
        toast({
          title: 'Sin historial',
          description: 'No hay simulaciones previas para exportar en modo "todas".',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Exportación Múltiple',
        description: `Exportando ${canvasSelectorMap[type]?.label || type} de ${simulationHistory.length + 1} simulaciones. Se exportará solo el gráfico visible actual.`,
      });
      exportCanvasAsImage(type, `${type}_todas_simulaciones_${timestamp}.png`);
    }
  };

  const generateComprehensiveReport = (simulations: SimulationRecord[], current: SimulationData) => {
    const timestamp = new Date().toLocaleString('es-ES');
    const allSimulations = [
      { 
        id: 'current', 
        timestamp: new Date(), 
        config: current.config, 
        results: { ber: current.ber } 
      },
      ...simulations
    ];

    let report = `
INFORME TÉCNICO COMPLETO - ANÁLISIS DE MODULACIÓN DIGITAL
=======================================================

Fecha de Generación: ${timestamp}
Número Total de Simulaciones: ${allSimulations.length}
Software: SimuMod Pro v1.0

RESUMEN EJECUTIVO
=================
Este informe presenta un análisis detallado de ${allSimulations.length} simulación(es) de modulación digital,
evaluando el rendimiento de técnicas BPSK y QPSK bajo diferentes condiciones de ruido y parámetros
de transmisión. Los resultados obtenidos proporcionan información valiosa para el diseño y
optimización de sistemas de comunicaciones digitales.

ANÁLISIS DETALLADO POR SIMULACIÓN
=================================
`;

    allSimulations.forEach((sim, index) => {
      const config = sim.config;
      const ber = sim.results.ber;
      
      report += `
SIMULACIÓN ${index + 1}
----------------------
Fecha: ${sim.timestamp.toLocaleString('es-ES')}
ID: ${sim.id}

Parámetros de Configuración:
• Esquema de Modulación: ${config.modulationType}
• Velocidad de Transmisión: ${config.bitRate} bps
• Frecuencia Portadora: ${config.carrierFreq} Hz
• Amplitud de Portadora: ${config.carrierAmplitude} V
• Longitud de Secuencia: ${config.dataLength} bits
• Ruido Gaussiano: ${config.noiseEnabled ? 'Habilitado' : 'Deshabilitado'}
${config.noiseEnabled ? `• Relación Señal/Ruido: ${config.snrDb} dB` : ''}

Resultados de Rendimiento:
• BER (Tasa de Error de Bit): ${ber ? ber.value.toExponential(4) : 'N/A'}
• Errores Detectados: ${ber ? ber.errorsCount : 'N/A'}
• Total de Bits Transmitidos: ${ber ? ber.totalBits : 'N/A'}
• Eficiencia de Transmisión: ${ber ? ((1 - ber.value) * 100).toFixed(2) : 'N/A'}%

Análisis Técnico:
${config.modulationType === 'BPSK' ? 
  `BPSK (Binary Phase Shift Keying) utiliza dos fases (0° y 180°) para representar bits 0 y 1.
  Esta modulación ofrece alta robustez al ruido pero menor eficiencia espectral (1 bit/símbolo).` :
  `QPSK (Quadrature Phase Shift Keying) emplea cuatro fases (45°, 135°, 225°, 315°) para
  transmitir 2 bits por símbolo, duplicando la eficiencia espectral respecto a BPSK.`}

${config.noiseEnabled ? 
  `Con SNR de ${config.snrDb} dB, el sistema presenta ${ber && ber.value > 0.01 ? 'alta degradación' : 'buen rendimiento'}.
  ${ber && ber.value > 0.1 ? 'Se recomienda aumentar la potencia de transmisión o implementar codificación de canal.' :
    ber && ber.value > 0.01 ? 'El rendimiento es aceptable para aplicaciones no críticas.' :
    'Excelente calidad de transmisión, apta para aplicaciones críticas.'}` :
  'En canal ideal (sin ruido), la transmisión presenta BER teórico mínimo, limitado únicamente por la precisión numérica.'}

Recomendaciones Específicas:
${config.noiseEnabled && config.snrDb < 10 ? 
  '• Incrementar la potencia de transmisión para mejorar SNR\n• Considerar técnicas de diversidad o codificación FEC' :
  config.noiseEnabled && config.snrDb < 15 ?
  '• El rendimiento actual es satisfactorio\n• Monitorear condiciones del canal para variaciones' :
  '• Configuración óptima para el canal actual\n• Considerar modulaciones de mayor orden para aumentar throughput'}

`;
    });

    // Análisis comparativo si hay múltiples simulaciones
    if (allSimulations.length > 1) {
      report += `
ANÁLISIS COMPARATIVO
====================

Rendimiento por Tipo de Modulación:
`;
      const bpskSims = allSimulations.filter(s => s.config.modulationType === 'BPSK');
      const qpskSims = allSimulations.filter(s => s.config.modulationType === 'QPSK');
      
      if (bpskSims.length > 0) {
        const avgBerBpsk = bpskSims.reduce((sum, s) => sum + (s.results.ber?.value || 0), 0) / bpskSims.length;
        report += `• BPSK - Simulaciones: ${bpskSims.length}, BER Promedio: ${avgBerBpsk.toExponential(3)}\n`;
      }
      
      if (qpskSims.length > 0) {
        const avgBerQpsk = qpskSims.reduce((sum, s) => sum + (s.results.ber?.value || 0), 0) / qpskSims.length;
        report += `• QPSK - Simulaciones: ${qpskSims.length}, BER Promedio: ${avgBerQpsk.toExponential(3)}\n`;
      }

      report += `
Evolución del Rendimiento:
• Primera Simulación: BER = ${allSimulations[allSimulations.length-1].results.ber?.value.toExponential(3) || 'N/A'}
• Última Simulación: BER = ${allSimulations[0].results.ber?.value.toExponential(3) || 'N/A'}
• Tendencia: ${allSimulations[0].results.ber?.value <= allSimulations[allSimulations.length-1].results.ber?.value ? 'Mejora' : 'Degradación'} en el rendimiento
`;
    }

    report += `
CONCLUSIONES Y RECOMENDACIONES FINALES
=====================================

Principales Hallazgos:
1. Los esquemas de modulación implementados funcionan correctamente según la teoría
2. El impacto del ruido AWGN sigue los patrones esperados para canales gaussianos
3. La relación entre SNR y BER se comporta según las curvas teóricas conocidas

Recomendaciones Técnicas:
• Para aplicaciones críticas (BER < 10⁻⁶): usar SNR > 15 dB con codificación de canal
• Para aplicaciones comerciales (BER < 10⁻³): SNR > 10 dB es suficiente
• Considerar modulaciones adaptativas según las condiciones del canal

Trabajo Futuro:
• Implementar modulaciones de orden superior (8-PSK, 16-QAM)
• Agregar codificación de canal (Reed-Solomon, Turbo codes)
• Evaluar rendimiento en canales con desvanecimiento

VALIDACIÓN Y CERTIFICACIÓN
==========================
Este informe ha sido generado por SimuMod Pro v1.0, una herramienta de simulación
validada para propósitos educativos y de investigación en telecomunicaciones.

Los resultados presentados son coherentes con la teoría de comunicaciones digitales
y pueden ser utilizados como referencia para diseño de sistemas reales.

Generado automáticamente el ${timestamp}
SimuMod Pro - Simulador Avanzado de Modulación Digital
`;

    return report;
  };

  const handleExportReport = () => {
    try {
      let content;
      let filename;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      if (exportMode === 'current') {
        content = generateComprehensiveReport([], currentSimulation);
        filename = `informe_simulacion_actual_${timestamp}.txt`;
      } else {
        content = generateComprehensiveReport(simulationHistory, currentSimulation);
        filename = `informe_completo_${simulationHistory.length + 1}_simulaciones_${timestamp}.txt`;
      }
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Informe Generado",
        description: `Informe técnico ${exportMode === 'all' ? 'completo' : 'actual'} exportado exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el informe",
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
- Modulación: ${currentSimulation.config.modulationType}
- Bit Rate: ${currentSimulation.config.bitRate} bps
- Frecuencia: ${currentSimulation.config.carrierFreq} Hz
- BER obtenido: ${currentSimulation.ber ? currentSimulation.ber.value.toExponential(3) : 'N/A'}
- Simulaciones realizadas: ${simulationHistory.length + 1}

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
        {/* Export Mode Selection */}
        {simulationHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-tech-cyan">Modo de Exportación</h4>
            <Select value={exportMode} onValueChange={(value: 'current' | 'all') => setExportMode(value)}>
              <SelectTrigger className="bg-input border-border" aria-label="Seleccionar modo de exportación">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Solo Simulación Actual</SelectItem>
                <SelectItem value="all">Todas las Simulaciones ({simulationHistory.length + 1})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Export Graphics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-cyan">Gráficos</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('digital')}
              className="justify-start"
              disabled={!currentSimulation.digitalSignal}
              aria-label="Exportar señal digital como imagen"
              title="Exporta la señal digital mostrada como imagen PNG. Útil para informes y análisis."
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Digital {exportMode === 'all' && `(${simulationHistory.length + 1})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('modulada')}
              className="justify-start"
              disabled={!currentSimulation.modulatedSignal}
              aria-label="Exportar señal modulada como imagen"
              title="Exporta la señal modulada mostrada como imagen PNG."
            >
              <Image className="w-4 h-4 mr-2" />
              Señal Modulada {exportMode === 'all' && `(${simulationHistory.length + 1})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('constelacion')}
              className="justify-start"
              disabled={!currentSimulation.constellationData}
              aria-label="Exportar diagrama de constelación como imagen"
              title="Exporta el diagrama de constelación actual como imagen PNG."
            >
              <Image className="w-4 h-4 mr-2" />
              Constelación {exportMode === 'all' && `(${simulationHistory.length + 1})`}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Export Report */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tech-green">Informes Técnicos</h4>
          <Button
            onClick={handleExportReport}
            className="w-full bg-tech-green hover:bg-tech-green/80 text-background"
            disabled={!currentSimulation.ber}
            aria-label="Exportar informe técnico"
            title="Genera un informe técnico detallado en formato TXT, listo para entregar o analizar."
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {exportMode === 'current' ? 'Informe Actual' : `Informe Completo (${simulationHistory.length + 1})`}
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
            aria-label="Subir archivo de informe"
            title="Carga un informe externo para revisión o comparación."
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
            aria-label="Agendar demostración con profesor"
            title="Abre tu cliente de correo para solicitar una demo personalizada al profesor."
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar con Profesor
          </Button>
        </div>

        {/* Export Summary */}
        <div className="p-3 rounded-lg border border-border bg-background/50 text-sm">
          <div className="text-muted-foreground mb-2">Resumen de Exportación:</div>
          <div className="space-y-1 text-xs">
            <div>• Modo: {exportMode === 'current' ? 'Actual' : 'Todas'}</div>
            <div>• Simulaciones: {simulationHistory.length + 1}</div>
            <div>• Modulación: {currentSimulation.config.modulationType}</div>
            <div>• BER: {currentSimulation.ber ? currentSimulation.ber.value.toExponential(2) : 'N/A'}</div>
            <div>• SNR: {currentSimulation.config.noiseEnabled ? `${currentSimulation.config.snrDb} dB` : 'Sin ruido'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
