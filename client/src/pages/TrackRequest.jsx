import PageShell from '../components/common/PageShell/PageShell';
import TrackPanel from '../features/track/components/TrackPanel/TrackPanel';

const TrackRequest = () => (
  <PageShell backTo="/" backLabel="Back to site">
    <TrackPanel />
  </PageShell>
);

export default TrackRequest;
