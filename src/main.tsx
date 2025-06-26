// Punto de entrada principal de SimuMod Pro
// -----------------------------------------
// Monta la aplicación React en el DOM y aplica estilos globales.
// Incluye validación didáctica y sugerencias para futuras extensiones.

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Busca el elemento root en el HTML
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento root en el HTML. Asegúrate de que exista <div id="root"></div>');
}

// Renderiza la aplicación principal
createRoot(rootElement).render(
  // Puedes envolver en <React.StrictMode> para detectar problemas en desarrollo
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

// Sugerencia: aquí puedes integrar reportWebVitals o herramientas de monitoreo si lo deseas
