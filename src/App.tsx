import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AIParticlesBackground from "./components/AIParticlesBackground";
import Index from "./pages/Index.tsx";
import DashboardLayout from "./components/DashboardLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Subjects from "./pages/Subjects.tsx";
import Planner from "./pages/Planner.tsx";
import ProgressPage from "./pages/Progress.tsx";
import Notifications from "./pages/Notifications.tsx";
import Profile from "./pages/Profile.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AIParticlesBackground />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard layout — all nested pages render inside the shared navbar + sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
