import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar, { TOP_SENTINEL_ID } from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";
import LoginPrompt from "./components/common/LoginPrompt/LoginPrompt";
import Home from "./pages/Home";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";
import BecomeAgent from "./pages/BecomeAgent";
import TrackRequest from "./pages/TrackRequest";
import CitizenDashboard from "./pages/CitizenDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import ScrollToHash from "./routes/ScrollToHash";
import RequestFlowProvider from "./features/request/RequestFlowProvider";
import RequestFlowHost from "./features/request/RequestFlowHost";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute, RoleRoute } from "./routes/ProtectedRoute";
import { useRequestFlow } from "./features/request/requestFlowContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "214641340065-r8ohdaaalk4e347qucfip6crcicjma6s.apps.googleusercontent.com";

// Suppress Google OAuth warnings in production
if (import.meta.env.PROD) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('GSI_LOGGER') || 
        args[0]?.includes?.('google.accounts.id')) {
      return; // Suppress Google OAuth warnings
    }
    originalWarn.apply(console, args);
  };
}

/**
 * Login prompt wrapper component - only shows when user tries to request without login
 */
const LoginPromptWrapper = () => {
  const { showLoginPrompt, handleLoginRedirect, closeLoginPrompt } = useRequestFlow();

  return (
    <LoginPrompt 
      isOpen={showLoginPrompt}
      onClose={closeLoginPrompt}
      onLogin={handleLoginRedirect}
    />
  );
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
    </main>
    <Footer />
  </>
);

const App = () => (
  <ErrorBoundary>
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error('Failed to load Google OAuth script')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <BrowserRouter>
        <AuthProvider>
          <RequestFlowProvider>
            <ScrollToHash />

            {/* Login prompt shown when user clicks "Start request" without login */}
            <LoginPromptWrapper />

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

            {/* Mounted once, above the routes, so the flow survives whichever surface
                opened it. */}
            <RequestFlowHost />
          </RequestFlowProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </ErrorBoundary>
);

export default App;
