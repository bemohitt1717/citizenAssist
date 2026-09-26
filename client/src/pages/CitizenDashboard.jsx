import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import CitizenShell from '../features/citizen/components/CitizenShell/CitizenShell';
import { SectionLoading } from '../components/ui/LoadingStates/LoadingStates';

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

  const loadingVariant = section === 'profile' ? 'profile' : section === 'track' ? 'track' : 'dashboard';

  return (
    <CitizenShell activeId={section}>
      <Suspense fallback={<SectionLoading variant={loadingVariant} />}>
        {renderSection()}
      </Suspense>
    </CitizenShell>
  );
};

export default CitizenDashboard;
