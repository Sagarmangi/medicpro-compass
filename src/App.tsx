import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import Index from "./pages/Index";

const queryClient = new QueryClient();

function AuthGate() {
  const { state } = useAuth();

  if (state === 'loading') return <LoadingScreen message="Verifying session…" />;
  if (state === 'unauthenticated') return <LoginPage />;
  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
