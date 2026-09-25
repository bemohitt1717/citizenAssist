import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import AdminShell from '../features/admin/components/AdminShell/AdminShell';
import { ADMIN_SECTIONS } from '../features/admin/adminData';

const AdminHome = lazy(() => import('../features/admin/components/AdminHome/AdminHome'));
const AdminRequests = lazy(() => import('../features/admin/components/AdminRequests/AdminRequests'));
const AdminAgents = lazy(() => import('../features/admin/components/AdminAgents/AdminAgents'));
const AdminServices = lazy(() => import('../features/admin/components/AdminServices/AdminServices'));
const AdminComplaints = lazy(() => import('../features/admin/components/AdminComplaints/AdminComplaints'));
const AdminProfile = lazy(() => import('../features/admin/components/AdminProfile/AdminProfile'));

/** Each section, keyed by the URL segment that selects it. */
const SECTIONS = {
  dashboard: AdminHome,
  requests: AdminRequests,
  agents: AdminAgents,
  services: AdminServices,
  complaints: AdminComplaints,
  profile: AdminProfile,
};

/**
 * The administrator dashboard.
 *
 * Separate from the agent dashboard: its own shell, its own sections, its own
 * data file. Nothing here branches on a role, so a change to one dashboard cannot
 * reach the other.
 */
const AdminDashboard = () => {
  const { section } = useParams();

  const activeId = SECTIONS[section] ? section : ADMIN_SECTIONS[0].id;
  const Section = SECTIONS[activeId];

  return (
    <AdminShell activeId={activeId}>
      <Suspense fallback={<p role="status" aria-live="polite">Loading section…</p>}>
        <Section />
      </Suspense>
    </AdminShell>
  );
};

export default AdminDashboard;
