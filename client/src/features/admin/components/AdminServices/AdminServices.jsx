import { useEffect, useState } from 'react';
import { Field, Panel, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { DOCUMENTS } from '../../../../constants/documents';
import { getAdminServices, updateService } from '../../../services/servicesApi';

/**
 * Service management with real data.
 *
 * The six services, one card each. Editable: the charge range, the timeline, and
 * the summary a citizen reads. Not editable here: the required document list —
 * changing which papers a service needs affects every open request for it, so it
 * belongs behind its own considered change rather than a text field on a
 * settings page.
 */
const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savedId, setSavedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('🛠️ [ADMIN-SERVICES] Fetching services...');
      const response = await getAdminServices();
      const servicesData = response.data.services;

      setServices(servicesData);

      // Initialize drafts from fetched data
      const initialDrafts = {};
      servicesData.forEach((service) => {
        initialDrafts[service.id] = {
          charge: service.charge,
          timeline: service.timeline,
          summary: service.summary,
        };
      });
      setDrafts(initialDrafts);

      console.log(`✅ [ADMIN-SERVICES] Loaded ${servicesData.length} services`);
    } catch (error) {
      console.error('❌ [ADMIN-SERVICES] Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setField = (serviceId, key) => (event) => {
    setDrafts((current) => ({
      ...current,
      [serviceId]: { ...current[serviceId], [key]: event.target.value },
    }));
    setSavedId(null);
  };

  const save = async (serviceId) => {
    const draft = drafts[serviceId];

    if (!draft.charge || !draft.timeline || !draft.summary) {
      alert('All fields are required.');
      return;
    }

    try {
      console.log('💾 [ADMIN-SERVICES] Updating service:', serviceId);
      await updateService(serviceId, {
        charge: draft.charge.trim(),
        timeline: draft.timeline.trim(),
        summary: draft.summary.trim(),
      });

      console.log('✅ [ADMIN-SERVICES] Service updated successfully');
      setSavedId(serviceId);

      // Refresh data to sync with backend
      await fetchServices();
    } catch (error) {
      console.error('❌ [ADMIN-SERVICES] Update failed:', error);
      alert('Failed to update service. Please try again.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading services...</div>;
  }

  if (services.length === 0) {
    return <div style={{ padding: '2rem' }}>No services found.</div>;
  }

  return (
    <div className="ca-panels">
      {services.map((service) => {
        const draft = drafts[service.id] || {};
        const documents = service.documents.map((key) => DOCUMENTS[key]?.name || key).filter(Boolean);

        return (
          <Panel
            key={service.id}
            title={service.name}
          >
            <div className="ca-form">
              <div className="ca-form__row">
                <Field
                  id={`charge-${service.id}`}
                  label="Assistance charge"
                  value={draft.charge || ''}
                  onChange={setField(service.id, 'charge')}
                  hint="Shown as a range. The agent confirms the exact figure."
                />

                <Field
                  id={`time-${service.id}`}
                  label="Usual timeline"
                  value={draft.timeline || ''}
                  onChange={setField(service.id, 'timeline')}
                  hint="What a citizen should expect, not a promise."
                />
              </div>

              <Field
                id={`summary-${service.id}`}
                label="What a citizen reads"
                as="textarea"
                value={draft.summary || ''}
                onChange={setField(service.id, 'summary')}
              />

              <div className="ca-field">
                <span className="ca-field__label">
                  Required documents · {documents.length}
                </span>
                <div className="ca-chips">
                  {documents.map((name, idx) => (
                    <span className="ca-chip" key={idx}>
                      {name}
                    </span>
                  ))}
                </div>
                <span className="ca-field__hint">
                  Changing this list affects every open request for this service, so it is not edited
                  from here.
                </span>
              </div>

              <SaveRow
                onSave={() => save(service.id)}
                isSaved={savedId === service.id}
                hint="Applies to new requests immediately."
              />
            </div>
          </Panel>
        );
      })}
    </div>
  );
};

export default AdminServices;
