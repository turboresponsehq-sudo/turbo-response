import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChatInterface from "./pages/ChatInterface";
import AdminDashboard from "./pages/AdminDashboard";
import IntakeForm from "./pages/IntakeForm";
import Payment from "./pages/Payment";
import TurboIntake from "./pages/TurboIntake";
import AdminLogin from "./pages/AdminLogin";
import AdminSettings from "./pages/AdminSettings";
import ClientContract from "./pages/ClientContract";
import ServiceAgreement from "./pages/ServiceAgreement";
import Disclaimer from "./pages/Disclaimer";
import TermsOfService from "./pages/TermsOfService";
import FloatingChatWidget from "./components/FloatingChatWidget";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/chat" component={ChatInterface} />
      <Route path="/intake" component={IntakeForm} />
      <Route path="/payment" component={Payment} />
      <Route path="/turbo-intake" component={TurboIntake} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/client-contract" component={ClientContract} />
      <Route path="/service-agreement" component={ServiceAgreement} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <FloatingChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
