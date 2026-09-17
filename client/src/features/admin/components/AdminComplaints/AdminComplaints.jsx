import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getComplaints, resolveComplaint } from '../../adminApi';

const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
];

/**
 * Complaints management with real data.
 */
const AdminComplaints = () => {
  const [filterId, setFilterId] = useState('open');
  const [drafts, setDrafts] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      console.log('📞 [ADMIN-COMPLAINTS] Fetching complaints...');
      const response = await getComplaints();
      setComplaints(response.data.complaints);
      console.log(`✅ [ADMIN-COMPLAINTS] Loaded ${response.data.complaints.length} complaints`);
    } catch (error) {
      console.error('❌ [ADMIN-COMPLAINTS] Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rows = complaints.filter((complaint) => complaint.status === filterId);

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: complaints.filter((complaint) => complaint.status === filter.id).length,
  }));

  const handleResolve = async (id) => {
    const resolution = drafts[id];

    if (!resolution || resolution.trim() === '') {
      alert('Please enter what was done about this complaint.');
      return;
    }

    try {
      console.log('✅ [ADMIN-COMPLAINTS] Resolving complaint:', id);
      await resolveComplaint(id, resolution.trim());
      console.log('✅ [ADMIN-COMPLAINTS] Complaint marked as resolved');

      // Clear draft
      setDrafts((current) => ({ ...current, [id]: '' }));

      // Refresh list
      await fetchComplaints();
    } catch (error) {
      console.error('❌ [ADMIN-COMPLAINTS] Failed to resolve:', error);
      alert('Failed to resolve complaint. Please try again.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading complaints...</div>;
  }

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter complaints" />

      {rows.length === 0 ? (
        <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · 0`}>
          <Empty
            icon="phone"
            title="Nothing here"
            text="Complaints raised by citizens against a request or an agent appear in this list."
          />
        </Panel>
      ) : (
        <div className="ca-panels">
          {rows.map((complaint) => (
            <Panel
              key={complaint.id}
              title={complaint.subject}
              action={
                <span
                  className={`ca-status ca-status--${
                    complaint.status === 'open' ? 'warn' : 'done'
                  }`}
                >
                  <span className="ca-status__dot" />
                  {complaint.status === 'open' ? 'Open' : 'Resolved'}
                </span>
              }
            >
              <ul className="ca-rows">
                <li className="ca-row">
                  <span className="ca-row__body">
                    <span className="ca-row__meta">
                      <span data-numeric>{complaint.reference}</span>
                      <span>
                        Request <span data-numeric>{complaint.requestRef}</span>
                      </span>
                      <span>From {complaint.citizen}</span>
                      <span>{complaint.against ? `Against ${complaint.against}` : 'No agent named'}</span>
                      <span>{complaint.raisedAt}</span>
                    </span>

                    <span className="ca-row__note">{complaint.detail}</span>
                  </span>
                </li>
              </ul>

              {complaint.status === 'open' ? (
                <div className="ca-form">
                  <div className="ca-field">
                    <label className="ca-field__label" htmlFor={`res-${complaint.id}`}>
                      What was done about it
                    </label>
                    <textarea
                      id={`res-${complaint.id}`}
                      className="ca-field__area"
                      placeholder="Record the action taken, so the outcome can be checked later."
                      value={drafts[complaint.id] ?? ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [complaint.id]: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="ca-form__actions">
                    <button
                      type="button"
                      className="ca-row__yes"
                      onClick={() => handleResolve(complaint.id)}
                      aria-disabled={!drafts[complaint.id]}
                      disabled={!drafts[complaint.id]}
                    >
                      <Icon name="check" size={13} />
                      Mark resolved
                    </button>

                    <span className="ca-field__hint">
                      A resolution note is required — closing without one leaves no record.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="ca-field">
                  <span className="ca-field__label">Resolution</span>
                  <p className="ca-row__note">{complaint.resolution}</p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminComplaints;
