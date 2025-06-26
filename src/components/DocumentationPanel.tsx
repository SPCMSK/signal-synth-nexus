
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Settings, Activity, Zap } from 'lucide-react';

interface DocumentationPanelProps {
  onClose: () => void;
}

export const DocumentationPanel = ({ onClose }: DocumentationPanelProps) => {
  return (
    <Card className="bg-card/95 border-border glow fixed inset-4 z-50 overflow-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-tech-cyan">
            <BookOpen className="w-5 h-5 mr-2" />
            Manual del Usuario - SimuMod Pro
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview">Introducción</TabsTrigger>
            <TabsTrigger value="parameters">Parámetros</TabsTrigger>
            <TabsTrigger value="modulation">Modulación</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-tech-green">¿Qué es SimuMod Pro?</h3>
              <p className="text-sm text-muted-foreground">
                SimuMod Pro es un simulador avanzado de modulación digital diseñado para la educación 
                en telecomunicaciones. Permite simular, visualizar y analizar sistemas de comunicación 
                digital con modulaciones BPSK y QPSK.
              </p>
              
              <h4 className="text-md font-semibold text-tech-cyan">Características Principales:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Simulación en tiempo real de modulación BPSK y QPSK</li>
                <li>Visualización de señales digitales, moduladas y demoduladas</li>
                <li>Diagramas de constelación interactivos</li>
                <li>Cálculo automático de BER (Bit Error Rate)</li>
                <li>Control de ruido gaussiano y SNR</li>
                <li>Exportación de gráficos e informes</li>
              </ul>
              
              <div className="p-4 border border-tech-cyan/30 rounded-lg bg-tech-cyan/5">
                <h4 className="text-sm font-semibold text-tech-cyan mb-2">Inicio Rápido:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Selecciona el tipo de modulación (BPSK o QPSK)</li>
                  <li>Ajusta el bit rate y frecuencia de portadora</li>
                  <li>Opcional: Activa el ruido y ajusta el SNR</li>
                  <li>Haz clic en "Ejecutar Simulación"</li>
                  <li>Observa los gráficos y métricas generadas</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-tech-green">Parámetros de Configuración</h3>
              
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-4 h-4 text-tech-cyan" />
                    <Badge variant="outline" className="border-tech-cyan text-tech-cyan">Bit Rate</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Velocidad de transmisión de datos en bits por segundo (bps). 
                    Rango: 100 - 10,000 bps. Valores más altos requieren mayor ancho de banda.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-tech-green" />
                    <Badge variant="outline" className="border-tech-green text-tech-green">Modulación</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">BPSK:</span> Modulación por desplazamiento de fase binaria (2 estados).<br/>
                    <span className="font-semibold">QPSK:</span> Modulación por desplazamiento de fase en cuadratura (4 estados).
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-tech-purple" />
                    <Badge variant="outline" className="border-tech-purple text-tech-purple">Portadora</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Frecuencia:</span> 1-50 kHz. Frecuencia de la señal portadora.<br/>
                    <span className="font-semibold">Amplitud:</span> 0.1-5V. Amplitud de la señal portadora.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-destructive" />
                    <Badge variant="outline" className="border-destructive text-destructive">Ruido</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">SNR:</span> Relación señal-ruido en dB (0-30 dB). 
                    Valores más altos indican menos ruido y mejor calidad de señal.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="modulation" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-tech-green">Tipos de Modulación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-tech-cyan/30 rounded-lg p-4 bg-tech-cyan/5">
                  <h4 className="text-md font-semibold text-tech-cyan mb-2">BPSK</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Binary Phase Shift Keying
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>2 estados de fase (0° y 180°)</li>
                    <li>1 bit por símbolo</li>
                    <li>Eficiencia: 1 bit/Hz</li>
                    <li>Mayor robustez al ruido</li>
                    <li>Constelación: 2 puntos en eje I</li>
                  </ul>
                </div>
                
                <div className="border border-tech-green/30 rounded-lg p-4 bg-tech-green/5">
                  <h4 className="text-md font-semibold text-tech-green mb-2">QPSK</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quadrature Phase Shift Keying
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>4 estados de fase (45°, 135°, 225°, 315°)</li>
                    <li>2 bits por símbolo</li>
                    <li>Eficiencia: 2 bits/Hz</li>
                    <li>Mayor velocidad de transmisión</li>
                    <li>Constelación: 4 puntos en cuadrantes</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 border border-tech-orange/30 rounded-lg bg-tech-orange/5">
                <h4 className="text-sm font-semibold text-tech-orange mb-2">Consideraciones de Diseño:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>BPSK es más robusto pero menos eficiente espectralmente</li>
                  <li>QPSK ofrece mayor velocidad pero es más susceptible al ruido</li>
                  <li>La elección depende del balance entre velocidad y robustez</li>
                  <li>Ambas requieren detección coherente para demodulación óptima</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-tech-green">Análisis de Resultados</h3>
              
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-3">
                  <h4 className="text-md font-semibold text-tech-cyan mb-2">BER (Bit Error Rate)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Métrica principal de calidad del sistema de comunicación.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-tech-green/10 rounded">
                      <span className="font-semibold text-tech-green">Excelente:</span> BER = 0
                    </div>
                    <div className="p-2 bg-tech-cyan/10 rounded">
                      <span className="font-semibold text-tech-cyan">Muy Buena:</span> BER &lt; 0.001
                    </div>
                    <div className="p-2 bg-yellow-400/10 rounded">
                      <span className="font-semibold text-yellow-400">Buena:</span> BER &lt; 0.01
                    </div>
                    <div className="p-2 bg-destructive/10 rounded">
                      <span className="font-semibold text-destructive">Pobre:</span> BER ≥ 0.01
                    </div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-3">
                  <h4 className="text-md font-semibold text-tech-green mb-2">Diagramas de Constelación</h4>
                  <p className="text-sm text-muted-foreground">
                    Representación visual de los símbolos transmitidos y recibidos en el plano I-Q.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li><span className="text-tech-green">Puntos verdes:</span> Símbolos ideales</li>
                    <li><span className="text-yellow-400">Puntos amarillos:</span> Símbolos recibidos</li>
                    <li><span className="text-destructive">Puntos rojos:</span> Errores detectados</li>
                  </ul>
                </div>
                
                <div className="border border-border rounded-lg p-3">
                  <h4 className="text-md font-semibold text-tech-purple mb-2">Gráficos de Señales</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualización temporal de las señales en diferentes etapas del sistema.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li><span className="text-tech-cyan">Señal Digital:</span> Datos binarios originales</li>
                    <li><span className="text-tech-green">Señal Modulada:</span> Después de la modulación</li>
                    <li><span className="text-tech-orange">Señal Demodulada:</span> Datos recuperados</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 border border-tech-cyan/30 rounded-lg bg-tech-cyan/5">
                <h4 className="text-sm font-semibold text-tech-cyan mb-2">Interpretación de Resultados:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Compara las formas de onda digital y demodulada</li>
                  <li>Observa la dispersión en el diagrama de constelación</li>
                  <li>Evalúa el BER bajo diferentes condiciones de ruido</li>
                  <li>Analiza el trade-off entre velocidad y robustez</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
