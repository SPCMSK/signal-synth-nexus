// Header principal de la aplicación SimuMod Pro
// ----------------------------------------------
// Proporciona branding, identidad visual y acceso rápido a información clave.
// Incluye mejoras de accesibilidad, tooltips y ayuda contextual.

import { CircuitBoard, Signal, Waves, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50" role="banner" aria-label="Encabezado principal">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Branding y título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative" title="SimuMod Pro: Simulador educativo de modulación digital">
                <CircuitBoard className="w-8 h-8 text-tech-cyan glow" aria-label="Logo SimuMod Pro" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-tech-green rounded-full signal-animation" aria-label="Estado: activo" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-tech-cyan display-font" tabIndex={0} aria-label="SimuMod Pro - Simulador de Modulación Digital">
                  SimuMod Pro
                </h1>
                <p className="text-xs text-muted-foreground" aria-label="Descripción de la aplicación">
                  Simulador de Modulación Digital
                </p>
              </div>
            </div>
          </div>
          {/* Badges informativos y acceso a ayuda */}
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="border-tech-cyan/50 text-tech-cyan hidden md:flex"
              title="Soporta modulación BPSK y QPSK"
              aria-label="Modos de modulación disponibles: BPSK y QPSK"
            >
              <Signal className="w-3 h-3 mr-1" />
              BPSK / QPSK
            </Badge>
            <Badge
              variant="outline"
              className="border-tech-green/50 text-tech-green hidden md:flex"
              title="Procesamiento en tiempo real para educación y demostración"
              aria-label="Procesamiento en tiempo real"
            >
              <Waves className="w-3 h-3 mr-1" />
              Tiempo Real
            </Badge>
            <a
              href="#manual"
              className="flex items-center px-2 py-1 rounded hover:bg-tech-cyan/10 focus:outline-none focus:ring-2 focus:ring-tech-cyan"
              title="Ver documentación y ayuda"
              aria-label="Ir a la documentación"
              tabIndex={0}
            >
              <Info className="w-4 h-4 text-tech-cyan mr-1" />
              <span className="text-xs text-tech-cyan font-medium">Ayuda</span>
            </a>
            <div className="w-2 h-2 bg-tech-green rounded-full signal-animation" aria-label="Estado: activo" />
          </div>
        </div>
      </div>
    </header>
  );
};
