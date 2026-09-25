import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import CitizenShell from '../features/citizen/components/CitizenShell/CitizenShell';

const CitizenHome = lazy(() => import('../features/citizen/components/CitizenHome/CitizenHome'));
const CitizenProfile = lazy(() => import('../features/citizen/components/CitizenProfile/CitizenProfile'));
const TrackRequest = lazy(() => import('./TrackRequest'));

/**
 * Citizen dashboard router
 * Maps URL sections to components
 */
const CitizenDashboard = () => {
  const { section = 'dashboard' } = useParams();

  const renderSection = () => {
    switch (section) {
      case 'dashboard':
        return <CitizenHome />;
      case 'track':
        return <TrackRequest />;
      case 'profile':
        return <CitizenProfile />;
      default:
        return <CitizenHome />;
    }
  };

  return (
    <CitizenShell activeId={section}>
      <Suspense fallback={<p role="status" aria-live="polite">Loading section…</p>}>
        {renderSection()}
      </Suspense>
    </CitizenShell>
  );
};

export default CitizenDashboard;
