import { useEffect, useState } from 'react';
import { Stats, Stat } from '../../../../components/ui/DataKit/DataKit';
import { getMyRequests } from '../../../request/requestApi';
import { StatsLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

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

  return (
    <>
      {stats ? (
        <Stats>
          <Stat icon="document" label="Requests" value={stats.totalRequests} note="All time" />
          <Stat icon="track" label="Pending" value={stats.pending} note="In progress" attention={Boolean(stats.pending)} />
          <Stat icon="check" label="Completed" value={stats.completed} note="All time" />
        </Stats>
      ) : hasError ? (
        <Stats>
          <Stat icon="document" label="Requests" value="—" note="Could not load" />
          <Stat icon="track" label="Pending" value="—" note="Could not load" />
          <Stat icon="check" label="Completed" value="—" note="Could not load" />
        </Stats>
      ) : <StatsLoading count={3} />}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-paper)', borderRadius: '12px', border: '1px solid var(--color-line)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>What would you like to do?</h2>
        <p style={{ color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>
          Start a request or check its updates from the menu.
        </p>
      </div>
    </>
  );
};

export default CitizenHome;
