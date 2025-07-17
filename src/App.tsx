
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AIDebateCoach from "./components/AIDebateCoach";
import PracticeArena from "./components/PracticeArena";
import SmartJudge from "./components/SmartJudge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/coach" element={<AIDebateCoach />} />
              <Route path="/practice" element={<PracticeArena />} />
              <Route path="/judge" element={<SmartJudge />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
