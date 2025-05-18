
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./lib/i18n"; // Import i18n configuration
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuard";

import MainLayout from "./components/layout/MainLayout";

// Pages
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import PlantDetail from "./pages/PlantDetail";
import PlantEdit from "./pages/PlantEdit";
import Calculator from "./pages/Calculator";
import Recipes from "./pages/Recipes";
import Profile from "./pages/Profile";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/plants" element={
                <ProtectedRoute>
                  <Plants />
                </ProtectedRoute>
              } />
              <Route path="/plants/:plantId" element={
                <ProtectedRoute>
                  <PlantDetail />
                </ProtectedRoute>
              } />
              <Route path="/plants/:plantId/edit" element={
                <ProtectedRoute>
                  <PlantEdit />
                </ProtectedRoute>
              } />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/recipes" element={
                <ProtectedRoute>
                  <Recipes />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
