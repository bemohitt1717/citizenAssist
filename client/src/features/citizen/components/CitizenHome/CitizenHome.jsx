import { Stats, Stat } from '../../../../components/ui/DataKit/DataKit';

/**
 * Citizen dashboard home - simple overview
 */
const CitizenHome = () => {
  // TODO: Fetch real stats from API
  const stats = {
    totalRequests: 2,
    pending: 1,
    completed: 1,
  };

  return (
    <>
      <Stats>
        <Stat
          icon="document"
          label="Total Requests"
          value={stats.totalRequests}
          note="All time"
        />
        <Stat
          icon="track"
          label="Pending"
          value={stats.pending}
          note="In progress"
          attention={stats.pending > 0}
        />
        <Stat
          icon="check"
          label="Completed"
          value={stats.completed}
          note="Successfully processed"
        />
      </Stats>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-paper)', borderRadius: '12px', border: '1px solid var(--color-line)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Actions</h2>
        <p style={{ color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>
          Request a new service or track your existing requests from the sidebar.
        </p>
      </div>
    </>
  );
};

export default CitizenHome;
