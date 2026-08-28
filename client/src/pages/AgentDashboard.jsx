import { useParams } from 'react-router-dom';
import AgentShell from '../features/agent/components/AgentShell/AgentShell';
import AgentHome from '../features/agent/components/AgentHome/AgentHome';
import AgentRequests from '../features/agent/components/AgentRequests/AgentRequests';
import AgentEarnings from '../features/agent/components/AgentEarnings/AgentEarnings';
import AgentProfile from '../features/agent/components/AgentProfile/AgentProfile';
import { AGENT_SECTIONS } from '../features/agent/agentData';

/** Each section, keyed by the URL segment that selects it. */
const SECTIONS = {
  dashboard: AgentHome,
  requests: AgentRequests,
  earnings: AgentEarnings,
  profile: AgentProfile,
};

/**
 * The agent dashboard.
 *
 * The section comes from the URL — /agent/requests, /agent/earnings — so
 * refreshing keeps you where you were and a section can be linked to directly.
 * One route entry, not one per section.
 */
const AgentDashboard = () => {
  const { section } = useParams();

  const activeId = SECTIONS[section] ? section : AGENT_SECTIONS[0].id;
  const Section = SECTIONS[activeId];

  return (
    <AgentShell activeId={activeId}>
      <Section />
    </AgentShell>
  );
};

export default AgentDashboard;
