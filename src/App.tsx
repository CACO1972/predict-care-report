import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";
import Home from "./pages/Home";
import PatientQuestionnaire from "./pages/PatientQuestionnaire";
import Documentation from "./pages/Documentation";
import AudioGenerator from "./pages/AudioGenerator";
import PagoExitoso from "./pages/PagoExitoso";
import Privacidad from "./pages/Privacidad";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/evaluacion" element={<PatientQuestionnaire />} />
            <Route path="/documentacion" element={<Documentation />} />
            <Route path="/admin/audio-generator" element={<AudioGenerator />} />
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
            <Route path="/privacidad" element={<Privacidad />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
