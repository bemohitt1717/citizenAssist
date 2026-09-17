import { useParams } from 'react-router-dom';
import CitizenShell from '../features/citizen/components/CitizenShell/CitizenShell';
import CitizenHome from '../features/citizen/components/CitizenHome/CitizenHome';
import CitizenProfile from '../features/citizen/components/CitizenProfile/CitizenProfile';
import TrackRequest from './TrackRequest';

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

  return <CitizenShell activeId={section}>{renderSection()}</CitizenShell>;
};

export default CitizenDashboard;
