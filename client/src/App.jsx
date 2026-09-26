import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar, { TOP_SENTINEL_ID } from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";
import LoginPrompt from "./components/common/LoginPrompt/LoginPrompt";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import ScrollToHash from "./routes/ScrollToHash";
import RequestFlowProvider from "./features/request/RequestFlowProvider";
import RequestFlowHost from "./features/request/RequestFlowHost";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute, RoleRoute } from "./routes/ProtectedRoute";
import { useRequestFlow } from "./features/request/requestFlowContext";
import { useAuth } from "./context/authContext";
import HomeIntroGate, { useMarkHomeReady } from "./components/ui/LoadingStates/HomeIntroGate";
import { RouteLoading } from "./components/ui/LoadingStates/LoadingStates";

const Home = lazy(() => import("./pages/Home"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Login = lazy(() => import("./pages/Login"));
const BecomeAgent = lazy(() => import("./pages/BecomeAgent"));
const TrackRequest = lazy(() => import("./pages/TrackRequest"));
const CitizenDashboard = lazy(() => import("./pages/CitizenDashboard"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Suppress Google OAuth warnings in production
if (import.meta.env.PROD) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0]?.includes?.("GSI_LOGGER") ||
      args[0]?.includes?.("google.accounts.id")
    ) {
      return; // Suppress Google OAuth warnings
    }
    originalWarn.apply(console, args);
  };
}

/**
 * Login prompt wrapper component - only shows when user tries to request without login
 */
const LoginPromptWrapper = () => {
  const { showLoginPrompt, handleLoginRedirect, closeLoginPrompt } =
    useRequestFlow();
  const { user } = useAuth();

  return (
    <LoginPrompt
      isOpen={showLoginPrompt}
      onClose={closeLoginPrompt}
      onLogin={handleLoginRedirect}
      requiresCitizen={Boolean(user && user.role !== "citizen")}
    />
  );
};

const HomeReadySignal = () => {
  const markHomeReady = useMarkHomeReady();

  useEffect(() => {
    markHomeReady();
  }, [markHomeReady]);

  return null;
};

/**
 * The landing page carries the full chrome. The service detail route
 * deliberately carries none — it is a single-viewport decision surface with its
 * own compact bar, so a navbar and footer would push its content out of view.
 */
const HomeLayout = () => (
  <>
    {/* Watched by the navbar so it can condense without a scroll listener. */}
    <div
      id={TOP_SENTINEL_ID}
      aria-hidden="true"
      style={{ position: "absolute", top: 0, height: 1, width: 1 }}
    />
    <Navbar />
    <main>
      <Home />
      <HomeReadySignal />
    </main>
    <Footer />
  </>
);

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <HomeIntroGate>
        <AuthProvider>
          <RequestFlowProvider>
            <ScrollToHash />

            {/* Login prompt shown when user clicks "Start request" without login */}
            <LoginPromptWrapper />

            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<HomeLayout />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/become-an-agent" element={<BecomeAgent />} />

                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/citizen/:section?"
                    element={
                      <RoleRoute allowedRoles={["citizen"]}>
                        <CitizenDashboard />
                      </RoleRoute>
                    }
                  />

                  <Route
                    path="/track"
                    element={
                      <RoleRoute allowedRoles={["citizen"]}>
                        <TrackRequest />
                      </RoleRoute>
                    }
                  />

                  {/* The section is a URL segment, so each dashboard needs one route
                      rather than one route per section. */}
                  <Route
                    path="/agent/:section?"
                    element={
                      <RoleRoute allowedRoles={["agent"]}>
                        <AgentDashboard />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/:section?"
                    element={
                      <RoleRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </RoleRoute>
                    }
                  />
                </Route>

                {/* A real 404. This previously rendered the home page, which meant a
                    broken link looked like it had worked. */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            {/* Mounted once, above the routes, so the flow survives whichever surface
                opened it. */}
            <RequestFlowHost />
          </RequestFlowProvider>
        </AuthProvider>
      </HomeIntroGate>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
