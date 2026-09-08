import "../zakhy/styles.css";
import { SimpleRoutePage } from "../zakhy/StandaloneApp";
import AutomationServicesPage from "../zakhy/pages/AutomationServices";
import ZakhyServicesPage from "../zakhy/pages/ZakhyServices";
import PortfolioPage from "../zakhy/pages/Portfolio";
import { SpilloHome, SpilloContent, SpilloInquiries } from "../zakhy/pages/Spillo";
import RaloDemoPage from "../zakhy/pages/RaloDemo";
import RaloContentPage from "../zakhy/pages/RaloContent";
import RaloInquiriesPage from "../zakhy/pages/RaloInquiries";
import MsPopItPage from "../zakhy/pages/MsPopIt";
import MsPopItContentPage from "../zakhy/pages/MsPopItContent";
import MsPopItInquiriesPage from "../zakhy/pages/MsPopItInquiries";
import MiamiHome from "../zakhy/pages/MiamiHome";
import MiamiExperiences from "../zakhy/pages/MiamiExperiences";
import MiamiInquiries from "../zakhy/pages/MiamiInquiries";
import { AtlantaHome, AtlantaMedia, AtlantaNeighborhoods } from "../zakhy/pages/Atlanta";
import { CrunkFitHome, CrunkFitContent, CrunkFitInquiries } from "../zakhy/pages/CrunkFit";
import { zakhyDemoSite } from "../zakhy/config";
import CreatorsAutomationHomepage from "../zakhy/CreatorsAutomationHomepage";

export function ZakhyBuildsAIHub() {
  return <CreatorsAutomationHomepage />;
}

export default ZakhyBuildsAIHub;

export function ZakhyAutomationServicesRoute() {
  return <AutomationServicesPage />;
}

export function ZakhyServicesRoute() {
  return <ZakhyServicesPage />;
}

export function ZakhyPortfolioRoute() {
  return <PortfolioPage />;
}

export function ZakhyAboutRoute() {
  return <SimpleRoutePage eyebrow="THE ZAKHY BUILDS AI APPROACH" title={<>CULTURE FIRST.<br /><em>BUSINESS SECOND.</em></>} body="We build practical AI systems that help creators organize the business behind their creativity and grow with confidence." button="MAKE AN INQUIRY" onBooking={() => window.location.assign(zakhyDemoSite.creatorIntakeUrl)} />;
}

export function ZakhyProjectRoute({ sourcePath }: { sourcePath: string }) {
  switch (sourcePath) {
    case "/spillo": return <SpilloHome />;
    case "/spillo/content": return <SpilloContent />;
    case "/spillo/inquiries": return <SpilloInquiries />;
    case "/ralo": return <RaloDemoPage />;
    case "/ralo/content": return <RaloContentPage />;
    case "/ralo/inquiries": return <RaloInquiriesPage />;
    case "/ms-pop-it": return <MsPopItPage />;
    case "/ms-pop-it/content": return <MsPopItContentPage />;
    case "/ms-pop-it/inquiries": return <MsPopItInquiriesPage />;
    case "/miami": return <MiamiHome />;
    case "/miami/experiences": return <MiamiExperiences />;
    case "/miami/inquiries": return <MiamiInquiries />;
    case "/atlanta": return <AtlantaHome />;
    case "/atlanta/neighborhoods": return <AtlantaNeighborhoods />;
    case "/atlanta/media": return <AtlantaMedia />;
    case "/crunk-fit": return <CrunkFitHome />;
    case "/crunk-fit/content": return <CrunkFitContent />;
    case "/crunk-fit/inquiries": return <CrunkFitInquiries />;
    default: return <PortfolioPage />;
  }
}
