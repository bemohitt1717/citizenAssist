import { useParams } from 'react-router-dom';
import AdminShell from '../features/admin/components/AdminShell/AdminShell';
import AdminHome from '../features/admin/components/AdminHome/AdminHome';
import AdminRequests from '../features/admin/components/AdminRequests/AdminRequests';
import AdminAgents from '../features/admin/components/AdminAgents/AdminAgents';
import AdminServices from '../features/admin/components/AdminServices/AdminServices';
import AdminComplaints from '../features/admin/components/AdminComplaints/AdminComplaints';
import AdminProfile from '../features/admin/components/AdminProfile/AdminProfile';
import { ADMIN_SECTIONS } from '../features/admin/adminData';

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
      <Section />
    </AdminShell>
  );
};

export default AdminDashboard;
