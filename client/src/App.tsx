import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Inspirations from "./pages/Inspirations";
import InspirationDetail from "./pages/InspirationDetail";
import InspirationGallery from "./pages/InspirationGallery";
import Benchmarking from "./pages/Benchmarking";
import AdminInspirationProjects from "./pages/AdminInspirationProjects";
import GalleryStats from "./pages/GalleryStats";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/projetos"} component={Projects} />
      <Route path={"/projeto/:id"} component={ProjectDetail} />
      <Route path={"/novo-projeto"} component={NewProject} />
      <Route path="/galeria" component={InspirationGallery} />
      <Route path="/benchmarking" component={Benchmarking} />
      <Route path={"/galeria-inspiracao"} component={InspirationGallery} />
      <Route path={"/galeria-inspiracao/estatisticas"} component={GalleryStats} />
      <Route path={"/inspirations/:id"} component={InspirationDetail} />
      <Route path={"/admin/inspiracao"} component={AdminInspirationProjects} />
      <Route path={"/404"} component={NotFound} />
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
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
