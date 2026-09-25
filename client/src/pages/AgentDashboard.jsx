import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import AgentShell from '../features/agent/components/AgentShell/AgentShell';
import { AGENT_SECTIONS } from '../features/agent/agentData';

const AgentHome = lazy(() => import('../features/agent/components/AgentHome/AgentHome'));
const AgentRequests = lazy(() => import('../features/agent/components/AgentRequests/AgentRequests'));
const AgentEarnings = lazy(() => import('../features/agent/components/AgentEarnings/AgentEarnings'));
const AgentProfile = lazy(() => import('../features/agent/components/AgentProfile/AgentProfile'));

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
      <Suspense fallback={<p role="status" aria-live="polite">Loading section…</p>}>
        <Section />
      </Suspense>
    </AgentShell>
  );
};

export default AgentDashboard;
