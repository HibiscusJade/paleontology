import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

// Tree-shaken at build time: when VITE_HASH_ROUTING is not set,
// the entire hash-routing code path is dead-code eliminated.
const USE_HASH = import.meta.env.VITE_HASH_ROUTING === "true";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MembershipProvider } from "./contexts/MembershipContext";

// Party Sub-system Page Imports
import Home from "./pages/Home";
import Announcements from "./pages/Announcements";
import Organizations from "./pages/Organizations";
import Committees from "./pages/Committees";
import Work from "./pages/Work";
import Activities from "./pages/Activities";
import TeamBuilding from "./pages/TeamBuilding";
import TheoryStudy from "./pages/TheoryStudy";
import Dynamics from "./pages/Dynamics";
import SpecialTopics from "./pages/SpecialTopics";
import Exemplars from "./pages/Exemplars";
import Reporting from "./pages/Reporting";
import Downloads from "./pages/Downloads";

// Academic Services Page Import
import Services from "./pages/Services";
import Branches from "./pages/Branches";

// Society Main Page Imports
import SocietyHome from "./pages/SocietyHome";
import Intro from "./pages/Intro";
import Structure from "./pages/Structure";
import History from "./pages/History";
import Gallery from "./pages/Gallery";
import SocietyAnnouncements from "./pages/SocietyAnnouncements";
import International from "./pages/International";
import DownloadsCenter from "./pages/DownloadsCenter";
import Regulations from "./pages/Regulations";
import PersonalCenter from "./pages/PersonalCenter";

function AppRouter() {
  const routes = (
    <Switch>
      {/* Society Main Portal Routes */}
      <Route path="/" component={SocietyHome} />
      <Route path="/intro" component={Intro} />
      <Route path="/structure" component={Structure} />
      <Route path="/history" component={History} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/society-announcements" component={SocietyAnnouncements} />
      <Route path="/international" component={International} />
      <Route path="/downloads-center" component={DownloadsCenter} />
      <Route path="/regulations" component={Regulations} />

      {/* Academic Services Route */}
      <Route path="/services" component={Services} />
      <Route path="/branches" component={Branches} />
      <Route path="/personal-center" component={PersonalCenter} />

      {/* Party Sub-system Routes */}
      <Route path="/party" component={Home} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/organizations" component={Organizations} />
      <Route path="/committees" component={Committees} />
      <Route path="/work" component={Work} />
      <Route path="/activities" component={Activities} />
      <Route path="/team-building" component={TeamBuilding} />
      <Route path="/theory-study" component={TheoryStudy} />
      <Route path="/dynamics" component={Dynamics} />
      <Route path="/special-topics" component={SpecialTopics} />
      <Route path="/exemplars" component={Exemplars} />
      <Route path="/reporting" component={Reporting} />
      <Route path="/downloads" component={Downloads} />

      {/* Final fallback route */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );

  // Hash routing for file:// protocol (singlefile build).
  // USE_HASH is a compile-time constant — the unused branch is tree-shaken.
  if (USE_HASH) {
    return <Router hook={useHashLocation}>{routes}</Router>;
  }

  // Default: pushState-based routing (normal build, no Router wrapper needed)
  return routes;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <MembershipProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </MembershipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
