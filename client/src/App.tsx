import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { setupAxiosInterceptor } from "./lib/axiosInterceptor";
import Home from "./pages/Home";
import Violations from "./pages/Violations";
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
import AdminBrainUpload from "./pages/AdminBrainUpload";
import CaseUploadCenter from "./pages/CaseUploadCenter";
import ScreenshotCapture from "./pages/admin/ScreenshotCapture";
import ConsumerConfirmation from "./pages/ConsumerConfirmation";
import TurboHQ from "./pages/TurboHQ";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Results from "./pages/Results";
import Testimonials from "./pages/Testimonials";
import ClientLogin from "./pages/ClientLogin";
import ClientPortal from "./pages/ClientPortal";
import PaymentPage from "./pages/PaymentPage";
import SignContract from "./pages/SignContract";
import TurboIntakeForm from "./pages/TurboIntakeForm";
import AdminCasesList from "./pages/AdminCasesList";
import AdminCasesDetail from "./pages/AdminCaseDetail";
import GrantDemo from "./pages/GrantDemo";
import EvictionDemo from "./pages/EvictionDemo";
import AdminResourceSubmissions from "./pages/admin/AdminResourceSubmissions";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/violations" component={Violations} />
      <Route path="/grant-demo" component={GrantDemo} />
      <Route path="/eviction-demo" component={EvictionDemo} />
      <Route path="/services" component={Services} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/results" component={Results} />
      <Route path="/testimonials" component={Testimonials} />
      {/* Defense Intake - Consumer */}
      <Route path="/intake-defense" component={IntakeForm} />
      {/* Redirect legacy route */}
      <Route path="/intake" component={IntakeForm} />
      <Route path="/consumer/confirmation" component={ConsumerConfirmation} />
      
      {/* Payment route - NOT part of consumer intake flow, used for business audit workflow */}
      <Route path="/payment" component={Payment} />
      <Route path="/turbo" component={TurboHQ} />
      
      {/* Offense Intake - Business */}
      <Route path="/intake-offense" component={TurboIntakeForm} />
      {/* Redirect legacy route */}
      <Route path="/turbo-intake" component={TurboIntakeForm} />
      
      {/* Client Portal Routes */}
      <Route path="/client/login" component={ClientLogin} />
      <Route path="/client/case/:id" component={ClientPortal} />
      
      {/* Contract Signing */}
      <Route path="/sign-contract/:caseId" component={SignContract} />
      
      {/* Public Payment Page */}
      <Route path="/pay/:caseId" component={PaymentPage} />
      
      <Route path="/admin/login" component={AdminLogin} />
      {/* Admin workflow routes - restored to specification */}
      <Route path="/admin/brain" component={AdminBrainUpload} />
      <Route path="/admin/case-upload" component={CaseUploadCenter} />
      <Route path="/admin/screenshots" component={ScreenshotCapture} />
      <Route path="/admin/resources" component={AdminResourceSubmissions} />

      <Route path="/admin/cases/:id" component={AdminCasesDetail} />
      <Route path="/admin/cases" component={AdminCasesList} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Legacy AI analysis routes - separate system */}
      <Route path="/admin/consumer/case/:id" component={AdminConsumerCaseDetail} />
      <Route path="/admin/consumer/cases" component={AdminConsumerCases} />
      <Route path="/client-contract" component={ClientContract} />
      <Route path="/service-agreement" component={ServiceAgreement} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/terms" component={TermsOfService} />
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
  setupAxiosInterceptor(() => {
    console.warn('[App] Axios interceptor detected 401');
  });

  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            <FloatingChatWidget />
          </TooltipProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
