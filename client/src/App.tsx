import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import IntakeForm from "./pages/IntakeForm";
import Payment from "./pages/Payment";
import AdminLogin from "./pages/AdminLogin";
import ClientContract from "./pages/ClientContract";
import ServiceAgreement from "./pages/ServiceAgreement";
import Disclaimer from "./pages/Disclaimer";
import TermsOfService from "./pages/TermsOfService";
import FloatingChatWidget from "./components/FloatingChatWidget";
import AdminConsumerCases from "./pages/AdminConsumerCases";
import AdminConsumerCaseDetail from "./pages/AdminConsumerCaseDetail";
import AdminCaseDetail from "./pages/AdminCaseDetail";
import ConsumerConfirmation from "./pages/ConsumerConfirmation";
import TurboHQ from "./pages/TurboHQ";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Results from "./pages/Results";
import Testimonials from "./pages/Testimonials";
import AdminBrain from "./pages/AdminBrain";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/results" component={Results} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/intake" component={IntakeForm} />
      <Route path="/consumer/confirmation" component={ConsumerConfirmation} />
      
      {/* Payment route - NOT part of consumer intake flow, used for business audit workflow */}
      <Route path="/payment" component={Payment} />
      <Route path="/turbo" component={TurboHQ} />
      <Route path="/admin/login" component={AdminLogin} />
      {/* Admin workflow routes - restored to specification */}
      <Route path="/admin/brain" component={AdminBrain} />
      <Route path="/admin/case/:id" component={AdminCaseDetail} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Legacy AI analysis routes - separate system */}
      <Route path="/admin/consumer/case/:id" component={AdminConsumerCaseDetail} />
      <Route path="/admin/consumer/cases" component={AdminConsumerCases} />
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
