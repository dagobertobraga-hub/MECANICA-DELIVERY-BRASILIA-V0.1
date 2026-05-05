import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StorageProvider } from "./context/StorageContext";
import Index from "./pages/Index";
import Budgets from "./pages/Budgets";
import Vehicles from "./pages/Vehicles";
import Clients from "./pages/Clients";
import Admins from "./pages/Admins";
import Schedules from "./pages/Schedules";
import Professionals from "./pages/Professionals";
import ProfessionalForm from "./pages/ProfessionalForm";
import Reports from "./pages/Reports";
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StorageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/professionals/:id" element={<ProfessionalForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StorageProvider>
  </QueryClientProvider>
);

export default App;