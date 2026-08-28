import { useState } from 'react';
import { Field, Panel, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { DOCUMENTS } from '../../../../constants/documents';
import { SERVICES } from '../../../../constants/services';
import { ADMIN_SERVICE_VOLUME } from '../../adminData';

/**
 * Service management.
 *
 * The six services, one card each. Editable: the charge range, the timeline, and
 * the summary a citizen reads. Not editable here: the required document list —
 * changing which papers a service needs affects every open request for it, so it
 * belongs behind its own considered change rather than a text field on a
 * settings page.
 *
 * Volume is shown next to each service because a charge is easier to judge with
 * the demand for it in view.
 */
const AdminServices = () => {
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      SERVICES.map((service) => [
        service.id,
        { charge: service.charge, timeline: service.timeline, summary: service.summary },
      ]),
    ),
  );
  const [savedId, setSavedId] = useState(null);

  const setField = (serviceId, key) => (event) => {
    setDrafts((current) => ({
      ...current,
      [serviceId]: { ...current[serviceId], [key]: event.target.value },
    }));
    setSavedId(null);
  };

  const save = (serviceId) => {
    // TODO(api): PATCH /api/admin/services/:id  body: drafts[serviceId]
    setSavedId(serviceId);
  };

  return (
    <div className="ca-panels">
      {SERVICES.map((service) => {
        const draft = drafts[service.id];
        const volume = ADMIN_SERVICE_VOLUME.find((entry) => entry.serviceId === service.id);
        const documents = service.documents.map((key) => DOCUMENTS[key]?.name).filter(Boolean);

        return (
          <Panel
            key={service.id}
            title={service.name}
            action={
              <span className="ca-panel__more" role="presentation">
                <span data-numeric>{volume?.requests ?? 0}</span> requests
              </span>
            }
          >
            <div className="ca-form">
              <div className="ca-form__row">
                <Field
                  id={`charge-${service.id}`}
                  label="Assistance charge"
                  value={draft.charge}
                  onChange={setField(service.id, 'charge')}
                  hint="Shown as a range. The agent confirms the exact figure."
                />

                <Field
                  id={`time-${service.id}`}
                  label="Usual timeline"
                  value={draft.timeline}
                  onChange={setField(service.id, 'timeline')}
                  hint="What a citizen should expect, not a promise."
                />
              </div>

              <Field
                id={`summary-${service.id}`}
                label="What a citizen reads"
                as="textarea"
                value={draft.summary}
                onChange={setField(service.id, 'summary')}
              />

              <div className="ca-field">
                <span className="ca-field__label">
                  Required documents · {documents.length}
                </span>
                <div className="ca-chips">
                  {documents.map((name) => (
                    <span className="ca-chip" key={name}>
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
