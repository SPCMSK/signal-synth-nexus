// App principal de SimuMod Pro
// ----------------------------
// Define la arquitectura global, providers y rutas principales de la aplicación.
// Incluye comentarios didácticos y preparación para escalabilidad.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Cliente global para queries y caché (útil para futuras integraciones de datos)
const queryClient = new QueryClient();

const App = () => (
  // Provider de React Query para manejo eficiente de datos remotos/locales
  <QueryClientProvider client={queryClient}>
    {/* Provider de tooltips globales para accesibilidad y ayuda contextual */}
    <TooltipProvider>
      {/* Toasters para feedback visual y notificaciones */}
      <Toaster />
      <Sonner />
      {/* Enrutador principal: define las rutas de la app */}
      <BrowserRouter>
        {/* Contenedor principal con rol de aplicación */}
        <div role="application" aria-label="SimuMod Pro - Simulador de Modulación Digital">
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Agregar aquí nuevas rutas para futuras páginas, antes del catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
