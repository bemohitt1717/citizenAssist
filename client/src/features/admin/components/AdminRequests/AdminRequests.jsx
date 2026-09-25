import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getStatus } from '../../../../constants/requests';
import {
  assignAgent,
  getAdminRequests,
  getAgents,
  uploadAdminRequestDocument,
} from '../../adminApi';
import './AdminRequests.css';

const FILTERS = [
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'live', label: 'In progress' },
  { id: 'action', label: 'Stuck' },
  { id: 'completed', label: 'Completed' },
];

const matches = (request, filterId) => {
  if (filterId === 'unassigned') return request.status === 'pending';
  if (filterId === 'live') return ['assigned', 'review', 'processing'].includes(request.status);
  return request.status === filterId;
};

const toneFor = (status) => {
  if (status === 'completed') return 'done';
  if (status === 'action') return 'warn';
  if (status === 'pending') return 'warn';
  return 'open';
};

/**
 * Request management with real data.
 */
const AdminRequests = () => {
  const [filterId, setFilterId] = useState('unassigned');
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingRequestId, setUploadingRequestId] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('📋 [ADMIN-REQUESTS] Fetching requests and agents...');
      const [requestsData, agentsData] = await Promise.all([
        getAdminRequests(),
        getAgents('active'), // Only active agents can be assigned
      ]);

      setRequests(requestsData.data.requests);
      setAgents(agentsData.data.agents);
      console.log(`✅ [ADMIN-REQUESTS] Loaded ${requestsData.data.requests.length} requests, ${agentsData.data.agents.length} active agents`);
    } catch (error) {
      console.error('❌ [ADMIN-REQUESTS] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (requestId, agentId) => {
    if (!agentId) return; // "Not assigned" selected

    try {
      console.log('🔗 [ADMIN-REQUESTS] Assigning agent:', { requestId, agentId });
      await assignAgent(requestId, agentId);
      console.log('✅ [ADMIN-REQUESTS] Agent assigned successfully');
      // Refresh requests
      await fetchData();
    } catch (error) {
      console.error('❌ [ADMIN-REQUESTS] Assignment failed:', error);
    }
  };

  const handleAttachDocument = async (requestId, event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingRequestId(requestId);
    setUploadFeedback(null);
    try {
      const response = await uploadAdminRequestDocument(requestId, file);
      setUploadFeedback({ requestId, type: 'success', text: response.message });
      await fetchData();
    } catch (error) {
      setUploadFeedback({
        requestId,
        type: 'error',
        text: error.response?.data?.message || 'Could not attach the final document. Try again.',
      });
    } finally {
      setUploadingRequestId(null);
      input.value = '';
    }
  };

  const rows = requests.filter((request) => matches(request, filterId));

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: requests.filter((request) => matches(request, filter.id)).length,
  }));

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading requests...</div>;
  }

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter requests by state" />

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            title="Nothing here"
            text="Requests appear in this list once they reach this state."
          />
        ) : (
          <ul className="ca-rows">
            {rows.map((request) => (
              <li className="ca-row" key={request.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">
                    {getServiceById(request.serviceId)?.name}
                    <span className={`ca-status ca-status--${toneFor(request.status)}`}>
                      <span className="ca-status__dot" />
                      {getStatus(request.status).label}
                    </span>
                  </span>

                  <span className="ca-row__meta">
                    <span data-numeric>{request.reference}</span>
                    <span>{request.citizen}</span>
                    <span>{request.district}</span>
                    <span data-numeric>{request.charge}</span>
                    <span data-numeric>{request.createdAt}</span>
                  </span>
                </span>

                <span className="ca-row__actions">
                  {request.status === 'pending' && (
                    <>
                      <label className="ca-sr-only" htmlFor={`assign-${request.id}`}>
                        Agent for {request.reference}
                      </label>
                      <select
                        id={`assign-${request.id}`}
                        className="ca-field__select"
                        defaultValue=""
                        onChange={(e) => handleAssign(request.id, e.target.value)}
                      >
                        <option value="">Assign agent...</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} · {agent.district}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {request.agentName && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>
                      Agent: {request.agentName}
                    </span>
                  )}

                  {request.status === 'completed' && (
                    <div className="ca-admin__document-actions">
                      <input
                        className="ca-admin__document-input ca-sr-only"
                        id={`final-document-${request.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        aria-label={`Attach final document for ${request.reference}`}
                        disabled={uploadingRequestId === request.id}
                        onChange={(event) => handleAttachDocument(request.id, event)}
                      />
                      <label
                        className="ca-pill ca-pill--outline ca-admin__document-button"
                        htmlFor={`final-document-${request.id}`}
                        aria-disabled={uploadingRequestId === request.id}
                      >
                        {uploadingRequestId === request.id
                          ? 'Attaching…'
                          : request.hasCompletedDocument
                            ? 'Replace final document'
                            : 'Attach final document'}
                      </label>
                      {request.hasCompletedDocument && (
                        <span className="ca-admin__document-ready">Available in citizen Track Request</span>
                      )}
                      {uploadFeedback?.requestId === request.id && (
                        <span
                          className={`ca-admin__upload-feedback ca-admin__upload-feedback--${uploadFeedback.type}`}
                          role={uploadFeedback.type === 'error' ? 'alert' : 'status'}
                        >
                          {uploadFeedback.text}
                        </span>
                      )}
                    </div>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
};

export default AdminRequests;
