import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getAgents, updateAgentStatus } from '../../adminApi';
import './AdminAgents.css';

const FILTERS = [
  { id: 'pending', label: 'To verify' },
  { id: 'active', label: 'Active' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
];

const TONE = { pending: 'warn', active: 'done', rejected: 'stop', suspended: 'stop' };
const LABEL = { pending: 'Pending', active: 'Active', rejected: 'Rejected', suspended: 'Suspended' };

/**
 * Agent management with real data from MongoDB.
 */
const AdminAgents = () => {
  const [filterId, setFilterId] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [issuedPin, setIssuedPin] = useState(null);
  const [busyAgentId, setBusyAgentId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Fetch all agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      console.log('🔍 [ADMIN-AGENTS] Fetching all agents...');
      const response = await getAgents(); // Get all agents (no filter)
      setAgents(response.data.agents);
      console.log(`✅ [ADMIN-AGENTS] Loaded ${response.data.agents.length} agents`);
    } catch (error) {
      console.error('❌ [ADMIN-AGENTS] Failed to fetch agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rows = agents.filter((agent) => agent.status === filterId);

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: agents.filter((agent) => agent.status === filter.id).length,
  }));

  const verify = async (agentId) => {
    if (busyAgentId) return;
    setBusyAgentId(agentId);
    setActionError('');
    try {
      console.log('✅ [ADMIN-AGENTS] Verifying agent:', agentId);
      const response = await updateAgentStatus(agentId, 'active');
      setIssuedPin(response.data?.pin ? { pin: response.data.pin, mobile: response.data.mobile } : null);
      console.log('✅ [ADMIN-AGENTS] Agent verified successfully');
      // Refresh list
      await fetchAgents();
    } catch (error) {
      console.error('❌ [ADMIN-AGENTS] Verification failed:', error);
      setActionError(error.response?.data?.message || 'Could not verify this agent. Refresh the list and try again.');
    } finally {
      setBusyAgentId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejecting || busyAgentId) return;

    setBusyAgentId(rejecting.id);
    setActionError('');
    try {
      console.log('🚫 [ADMIN-AGENTS] Rejecting agent:', rejecting.id);
      await updateAgentStatus(rejecting.id, 'rejected');
      console.log('✅ [ADMIN-AGENTS] Agent rejected successfully');
      setRejecting(null);
      // Refresh list
      await fetchAgents();
    } catch (error) {
      console.error('❌ [ADMIN-AGENTS] Rejection failed:', error);
      setActionError(error.response?.data?.message || 'Could not reject this agent. Try again.');
    } finally {
      setBusyAgentId(null);
    }
  };

  const suspend = async (agentId) => {
    if (busyAgentId) return;
    setBusyAgentId(agentId);
    setActionError('');
    try {
      console.log('⏸️  [ADMIN-AGENTS] Suspending agent:', agentId);
      await updateAgentStatus(agentId, 'suspended');
      console.log('✅ [ADMIN-AGENTS] Agent suspended successfully');
      // Refresh list
      await fetchAgents();
    } catch (error) {
      console.error('❌ [ADMIN-AGENTS] Suspension failed:', error);
      setActionError(error.response?.data?.message || 'Could not suspend this agent. Try again.');
    } finally {
      setBusyAgentId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading agents...</p>
      </div>
    );
  }

  return (
    <>
      {issuedPin && (
        <Panel title="Agent verified">
          <p style={{ padding: '1rem' }}>
            Share this login PIN with <strong data-numeric>+91 {issuedPin.mobile}</strong>:{' '}
            <strong data-numeric>{issuedPin.pin}</strong>
          </p>
        </Panel>
      )}
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter agents by status" />

      {actionError && <p className="ca-admin-agents__error" role="alert">{actionError}</p>}

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            icon="shieldCheck"
            title="Nobody here"
            text="Agents appear in this list once their application reaches this state."
          />
        ) : (
          <ul className="ca-rows">
            {rows.map((agent) => (
              <li className="ca-row" key={agent.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">
                    {agent.name}
                    <span className={`ca-status ca-status--${TONE[agent.status]}`}>
                      <span className="ca-status__dot" />
                      {LABEL[agent.status]}
                    </span>
                  </span>

                  {agent.accountAvailable === false && (
                    <span className="ca-admin-agents__account-warning" role="status">
                      Linked citizen account is missing. Verification actions are unavailable.
                    </span>
                  )}

                  <span className="ca-row__meta">
                    <span>{agent.district}</span>
                    <span data-numeric>{agent.mobile}</span>
                    <span className="ca-admin-agents__email">{agent.email}</span>
                    <span>{agent.experience}</span>
                    <span data-numeric>{agent.services} services</span>
                    {agent.status === 'active' && (
                      <>
                        <span data-numeric>{agent.completed} completed</span>
                        <span data-numeric>Rating {agent.rating}</span>
                      </>
                    )}
                    {agent.status !== 'active' && <span>{agent.appliedAt}</span>}
                  </span>
                </span>

                <span className="ca-row__actions">
                  {agent.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="ca-row__yes"
                        onClick={() => verify(agent.id)}
                        disabled={Boolean(busyAgentId) || agent.accountAvailable === false}
                      >
                        <Icon name="check" size={13} />
                        {busyAgentId === agent.id ? 'Verifying…' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        className="ca-row__no"
                        onClick={() => setRejecting(agent)}
                        disabled={Boolean(busyAgentId) || agent.accountAvailable === false}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {agent.status === 'active' && (
                    <button
                      type="button"
                      className="ca-row__no"
                      onClick={() => suspend(agent.id)}
                      disabled={Boolean(busyAgentId) || agent.accountAvailable === false}
                    >
                      {busyAgentId === agent.id ? 'Suspending…' : 'Suspend'}
                    </button>
                  )}

                  {agent.status === 'rejected' && (
                    <button
                      type="button"
                      className="ca-row__no"
                      onClick={() => verify(agent.id)}
                    >
                      Reconsider
                    </button>
                  )}

                  {agent.status === 'suspended' && (
                    <button
                      type="button"
                      className="ca-row__yes"
                      onClick={() => verify(agent.id)}
                    >
                      Reactivate
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {rejecting && (
        <ConfirmDialog
          destructive
          icon="shieldCheck"
          title={`Reject ${rejecting.name}?`}
          text={`Their application closes and they will not be able to take any citizen's file. You can reconsider it later from the Rejected list.`}
          confirmLabel="Reject application"
          onConfirm={confirmReject}
          onCancel={() => setRejecting(null)}
        />
      )}
    </>
  );
};

export default AdminAgents;
