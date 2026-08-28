import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar, { TOP_SENTINEL_ID } from './components/common/Navbar/Navbar';
import Footer from './components/common/Footer/Footer';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';
import Login from './pages/Login';
import BecomeAgent from './pages/BecomeAgent';
import TrackRequest from './pages/TrackRequest';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import ScrollToHash from './routes/ScrollToHash';
import RequestFlowProvider from './features/request/RequestFlowProvider';
import RequestFlowHost from './features/request/RequestFlowHost';

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
      style={{ position: 'absolute', top: 0, height: 1, width: 1 }}
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
    <BrowserRouter>
      <RequestFlowProvider>
        <ScrollToHash />

        <Routes>
          <Route path="/" element={<HomeLayout />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/become-an-agent" element={<BecomeAgent />} />
          <Route path="/track" element={<TrackRequest />} />

          {/* Two separate dashboards. The section is a URL segment, so each needs
              one route rather than one per section. */}
          <Route path="/agent/:section?" element={<AgentDashboard />} />
          <Route path="/admin/:section?" element={<AdminDashboard />} />

          {/* A real 404. This previously rendered the home page, which meant a
              broken link looked like it had worked. */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Mounted once, above the routes, so the flow survives whichever surface
            opened it. */}
        <RequestFlowHost />
      </RequestFlowProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
