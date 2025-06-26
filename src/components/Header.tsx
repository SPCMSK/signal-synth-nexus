
import { CircuitBoard, Signal, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <CircuitBoard className="w-8 h-8 text-tech-cyan glow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-tech-green rounded-full signal-animation"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-tech-cyan display-font">
                  SimuMod Pro
                </h1>
                <p className="text-xs text-muted-foreground">
                  Simulador de Modulación Digital
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-tech-cyan/50 text-tech-cyan hidden md:flex">
              <Signal className="w-3 h-3 mr-1" />
              BPSK / QPSK
            </Badge>
            <Badge variant="outline" className="border-tech-green/50 text-tech-green hidden md:flex">
              <Waves className="w-3 h-3 mr-1" />
              Tiempo Real
            </Badge>
            <div className="w-2 h-2 bg-tech-green rounded-full signal-animation"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
