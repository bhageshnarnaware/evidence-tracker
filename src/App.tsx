import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataStoreProvider } from "./contexts/DataStoreContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CasesPage from "./pages/CasesPage";
import DevicesPage from "./pages/DevicesPage";
import EvidencePage from "./pages/EvidencePage";
import CustodyPage from "./pages/CustodyPage";
import StoragePage from "./pages/StoragePage";
import ForensicsPage from "./pages/ForensicsPage";
import DocumentsPage from "./pages/DocumentsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import UserManagementPage from "./pages/UserManagementPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataStoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<AppRoute><Dashboard /></AppRoute>} />
              <Route path="/cases" element={<AppRoute><CasesPage /></AppRoute>} />
              <Route path="/devices" element={<AppRoute><DevicesPage /></AppRoute>} />
              <Route path="/evidence" element={<AppRoute><EvidencePage /></AppRoute>} />
              <Route path="/custody" element={<AppRoute><CustodyPage /></AppRoute>} />
              <Route path="/storage" element={<AppRoute><StoragePage /></AppRoute>} />
              <Route path="/forensics" element={<AppRoute><ForensicsPage /></AppRoute>} />
              <Route path="/documents" element={<AppRoute><DocumentsPage /></AppRoute>} />
              <Route path="/audit-logs" element={<AppRoute><AuditLogsPage /></AppRoute>} />
              <Route path="/users" element={<AppRoute><UserManagementPage /></AppRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataStoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
