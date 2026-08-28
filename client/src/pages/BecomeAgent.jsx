import PageShell from '../components/common/PageShell/PageShell';
import AgentForm from '../features/agent/components/AgentForm/AgentForm';

const BecomeAgent = () => (
  <PageShell backTo="/" backLabel="Back to site">
    <AgentForm />
  </PageShell>
);

export default BecomeAgent;
