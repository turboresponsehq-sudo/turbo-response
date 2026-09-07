import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSessionGate } from "@/components/AdminSessionGate";
import { OAuthAdminGate } from "@/components/OAuthAdminGate";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { setupAxiosInterceptor } from "./lib/axiosInterceptor";
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
import AdminBrainUpload from "./pages/AdminBrainUpload";
import CaseUploadCenter from "./pages/CaseUploadCenter";
import ConsumerConfirmation from "./pages/ConsumerConfirmation";
import TurboHQ from "./pages/TurboHQ";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import ClientLogin from "./pages/ClientLogin";
import ClientPortal from "./pages/ClientPortal";
import PaymentPage from "./pages/PaymentPage";
import SignContract from "./pages/SignContract";
import TurboIntakeForm from "./pages/TurboIntakeForm";
import OffenseIntakeForm from "./pages/OffenseIntakeForm";
import AdminCasesList from "./pages/AdminCasesList";
import AdminCasesDetail from "./pages/AdminCaseDetail";

import ConsumerSolutions from "./pages/ConsumerSolutions";
import BlackFuture from "./pages/BlackFuture";
import AdminKnowledgeBase from "./pages/AdminKnowledgeBase";
import AdminKnowledgeBaseImport from "./pages/AdminKnowledgeBaseImport";
import AdminCommandCenter from "./pages/AdminCommandCenter";
import CaseBrief from "./pages/CaseBrief";
import CreatorIntake from "./features/creator/pages/CreatorIntake";
import CreatorLeadsAdmin from "./features/creator/pages/CreatorLeadsAdmin";
import ZakhyBuildsAIHub, { ZakhyAboutRoute, ZakhyAutomationServicesRoute, ZakhyPortfolioRoute, ZakhyServicesRoute, ZakhyProjectRoute } from "./pages/ZakhyBuildsAIHub";

function ProtectedCreatorLeads() {
  return (
    <AdminSessionGate>
      <CreatorLeadsAdmin />
    </AdminSessionGate>
  );
}

function OAuthKnowledgeBase() {
  return (
    <OAuthAdminGate>
      <AdminKnowledgeBase />
    </OAuthAdminGate>
  );
}

function OAuthKnowledgeBaseImport() {
  return (
    <OAuthAdminGate>
      <AdminKnowledgeBaseImport />
    </OAuthAdminGate>
  );
}

function OAuthBrain() {
  return (
    <OAuthAdminGate>
      <AdminBrainUpload />
    </OAuthAdminGate>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />

      <Route path="/consumer-solutions" component={ConsumerSolutions} />
      <Route path="/black-future" component={BlackFuture} />
      {/* Case Documentation Brief landing page */}
      <Route path="/case-brief" component={CaseBrief} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      {/* Defense Intake - Consumer */}
      <Route path="/intake-defense" component={IntakeForm} />
      {/* Redirect legacy route */}
      <Route path="/intake" component={IntakeForm} />
      <Route path="/consumer/confirmation" component={ConsumerConfirmation} />
      
      {/* Payment route - NOT part of consumer intake flow, used for business audit workflow */}
      <Route path="/payment" component={Payment} />
      <Route path="/turbo" component={TurboHQ} />
      
      {/* Offense Intake - Consumer */}
      <Route path="/intake-offense" component={OffenseIntakeForm} />
      
      {/* Business Build Intake */}
      <Route path="/turbo-intake" component={TurboIntakeForm} />

      {/* Isolated Zakhy Builds AI homepage hub; the approved demo remains the visual source of truth. */}
      <Route path="/zakhybuildsai" component={ZakhyBuildsAIHub} />
      <Route path="/zakhybuildsai/services" component={ZakhyServicesRoute} />
      <Route path="/zakhybuildsai/automation-services" component={ZakhyAutomationServicesRoute} />
      <Route path="/zakhybuildsai/portfolio" component={ZakhyPortfolioRoute} />
      <Route path="/zakhybuildsai/portfolio/ralo" component={() => <ZakhyProjectRoute sourcePath="/ralo" />} />
      <Route path="/zakhybuildsai/portfolio/ralo/content" component={() => <ZakhyProjectRoute sourcePath="/ralo/content" />} />
      <Route path="/zakhybuildsai/portfolio/ralo/inquiries" component={() => <ZakhyProjectRoute sourcePath="/ralo/inquiries" />} />
      <Route path="/zakhybuildsai/portfolio/ms-pop-it" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it" />} />
      <Route path="/zakhybuildsai/portfolio/ms-pop-it/content" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it/content" />} />
      <Route path="/zakhybuildsai/portfolio/ms-pop-it/inquiries" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it/inquiries" />} />
      <Route path="/zakhybuildsai/portfolio/miami-trips-restaurants" component={() => <ZakhyProjectRoute sourcePath="/miami" />} />
      <Route path="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences" component={() => <ZakhyProjectRoute sourcePath="/miami/experiences" />} />
      <Route path="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries" component={() => <ZakhyProjectRoute sourcePath="/miami/inquiries" />} />
      <Route path="/zakhybuildsai/portfolio/story-of-atlanta" component={() => <ZakhyProjectRoute sourcePath="/atlanta" />} />
      <Route path="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods" component={() => <ZakhyProjectRoute sourcePath="/atlanta/neighborhoods" />} />
      <Route path="/zakhybuildsai/portfolio/story-of-atlanta/media" component={() => <ZakhyProjectRoute sourcePath="/atlanta/media" />} />
      <Route path="/zakhybuildsai/portfolio/spillo" component={() => <ZakhyProjectRoute sourcePath="/spillo" />} />
      <Route path="/zakhybuildsai/portfolio/spillo/content" component={() => <ZakhyProjectRoute sourcePath="/spillo/content" />} />
      <Route path="/zakhybuildsai/portfolio/spillo/inquiries" component={() => <ZakhyProjectRoute sourcePath="/spillo/inquiries" />} />
      <Route path="/zakhybuildsai/portfolio/crunk-fit" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit" />} />
      <Route path="/zakhybuildsai/portfolio/crunk-fit/content" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit/content" />} />
      <Route path="/zakhybuildsai/portfolio/crunk-fit/inquiries" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit/inquiries" />} />
      {/* Direct shareable aliases for approved creator project links. */}
      <Route path="/ralo" component={() => <ZakhyProjectRoute sourcePath="/ralo" />} />
      <Route path="/ralo/content" component={() => <ZakhyProjectRoute sourcePath="/ralo/content" />} />
      <Route path="/ralo/inquiries" component={() => <ZakhyProjectRoute sourcePath="/ralo/inquiries" />} />
      <Route path="/ms-pop-it" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it" />} />
      <Route path="/ms-pop-it/content" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it/content" />} />
      <Route path="/ms-pop-it/inquiries" component={() => <ZakhyProjectRoute sourcePath="/ms-pop-it/inquiries" />} />
      <Route path="/spillo" component={() => <ZakhyProjectRoute sourcePath="/spillo" />} />
      <Route path="/spillo/content" component={() => <ZakhyProjectRoute sourcePath="/spillo/content" />} />
      <Route path="/spillo/inquiries" component={() => <ZakhyProjectRoute sourcePath="/spillo/inquiries" />} />
      <Route path="/miami" component={() => <ZakhyProjectRoute sourcePath="/miami" />} />
      <Route path="/miami/experiences" component={() => <ZakhyProjectRoute sourcePath="/miami/experiences" />} />
      <Route path="/miami/inquiries" component={() => <ZakhyProjectRoute sourcePath="/miami/inquiries" />} />
      <Route path="/atlanta" component={() => <ZakhyProjectRoute sourcePath="/atlanta" />} />
      <Route path="/atlanta/neighborhoods" component={() => <ZakhyProjectRoute sourcePath="/atlanta/neighborhoods" />} />
      <Route path="/atlanta/media" component={() => <ZakhyProjectRoute sourcePath="/atlanta/media" />} />
      <Route path="/crunk-fit" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit" />} />
      <Route path="/crunk-fit/content" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit/content" />} />
      <Route path="/crunk-fit/inquiries" component={() => <ZakhyProjectRoute sourcePath="/crunk-fit/inquiries" />} />
      <Route path="/zakhybuildsai/about" component={ZakhyAboutRoute} />

      {/* Isolated Creator Business V1 routes */}
      <Route path="/creator/start" component={CreatorIntake} />
      
      {/* Client Portal Routes */}
      <Route path="/client/login" component={ClientLogin} />
      <Route path="/client/case/:id" component={ClientPortal} />
      
      {/* Contract Signing */}
      <Route path="/sign-contract/:caseId" component={SignContract} />
      
      {/* Public Payment Page */}
      <Route path="/pay/:caseId" component={PaymentPage} />
      
      <Route path="/admin/login" component={AdminLogin} />
      {/* Admin workflow routes - restored to specification */}
      <Route path="/admin/command-center" component={AdminCommandCenter} />
      <Route path="/admin/creator/leads" component={ProtectedCreatorLeads} />
      <Route path="/admin/knowledge-base/import" component={OAuthKnowledgeBaseImport} />
      <Route path="/admin/knowledge-base" component={OAuthKnowledgeBase} />
      <Route path="/admin/brain" component={OAuthBrain} />
      <Route path="/admin/case-upload" component={CaseUploadCenter} />

      <Route path="/admin/cases/:id" component={AdminCasesDetail} />
      <Route path="/admin/cases" component={AdminCasesList} />
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
  setupAxiosInterceptor(() => {
    console.warn('[App] Axios interceptor detected 401');
  });

  const isZakhyPublicPath = /^\/(zakhybuildsai|ralo|ms-pop-it|spillo|miami|atlanta|crunk-fit)(\/|$)/.test(window.location.pathname);

  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            {!isZakhyPublicPath && <FloatingChatWidget />}
          </TooltipProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
