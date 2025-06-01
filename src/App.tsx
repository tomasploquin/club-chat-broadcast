import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WhatsappConnectPage from "./pages/WhatsappConnectPage";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { PasswordProtection } from "./components/PasswordProtection";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PasswordProtection />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/whatsapp-connect" element={<WhatsappConnectPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
