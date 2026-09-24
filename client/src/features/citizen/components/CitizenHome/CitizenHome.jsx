import { useEffect, useState } from 'react';
import { Stats, Stat } from '../../../../components/ui/DataKit/DataKit';
import { getMyRequests } from '../../../request/requestApi';

/**
 * Citizen dashboard home - simple overview
 */
const CitizenHome = () => {
  const [stats, setStats] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let current = true;
    getMyRequests()
      .then((response) => {
        if (!current) return;
        const requests = response.data?.requests || [];
        setStats({
          totalRequests: requests.length,
          pending: requests.filter((request) => !['completed', 'cancelled', 'rejected'].includes(request.status)).length,
          completed: requests.filter((request) => request.status === 'completed').length,
        });
      })
      .catch(() => {
        if (current) setHasError(true);
      });
    return () => { current = false; };
  }, []);

  const values = stats || { totalRequests: '—', pending: '—', completed: '—' };

  return (
    <>
      <Stats>
        <Stat
          icon="document"
          label="Total Requests"
          value={values.totalRequests}
          note={hasError ? 'Could not load' : stats ? 'All time' : 'Loading'}
        />
        <Stat
          icon="track"
          label="Pending"
          value={values.pending}
          note={hasError ? 'Could not load' : stats ? 'In progress' : 'Loading'}
          attention={Boolean(stats?.pending)}
        />
        <Stat
          icon="check"
          label="Completed"
          value={values.completed}
          note={hasError ? 'Could not load' : stats ? 'Successfully processed' : 'Loading'}
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
