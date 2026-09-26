import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Button } from '../../../../components/ui/button';
import { Spinner } from '../../../../components/ui/spinner';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getComplaints, resolveComplaint } from '../../adminApi';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

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
  const [busyComplaintId, setBusyComplaintId] = useState(null);

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
    if (busyComplaintId) return;
    const resolution = drafts[id];

    if (!resolution || resolution.trim() === '') {
      alert('Add a note about how you handled this complaint.');
      return;
    }

    try {
      setBusyComplaintId(id);
      console.log('✅ [ADMIN-COMPLAINTS] Resolving complaint:', id);
      await resolveComplaint(id, resolution.trim());
      console.log('✅ [ADMIN-COMPLAINTS] Complaint marked as resolved');

      // Clear draft
      setDrafts((current) => ({ ...current, [id]: '' }));

      // Refresh list
      await fetchComplaints();
    } catch (error) {
      console.error('❌ [ADMIN-COMPLAINTS] Failed to resolve:', error);
      alert('Could not resolve the complaint. Try again.');
    } finally {
      setBusyComplaintId(null);
    }
  };

  if (isLoading) return <SectionLoading variant="list" />;

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter complaints" />

      {rows.length === 0 ? (
        <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · 0`}>
          <Empty
            icon="phone"
            title="No complaints here"
            text="There are no complaints in this group."
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
                      placeholder="What did you do to resolve this?"
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
                    <Button
                      type="button"
                      className="ca-row__yes"
                      variant="unstyled"
                      size="sm"
                      onClick={() => handleResolve(complaint.id)}
                      aria-disabled={!drafts[complaint.id]}
                      disabled={!drafts[complaint.id] || Boolean(busyComplaintId)}
                      aria-busy={busyComplaintId === complaint.id}
                    >
                      {busyComplaintId === complaint.id ? <Spinner data-icon="inline-start" /> : <Icon name="check" size={13} />}
                      {busyComplaintId === complaint.id ? 'Saving…' : 'Mark resolved'}
                    </Button>

                    <span className="ca-field__hint">
                      Add a note before marking this resolved.
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
