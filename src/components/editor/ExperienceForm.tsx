import React from 'react';
import type { ExperienceEntry } from '../../types/cv';

interface ExperienceFormProps {
  experience: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onChange,
}) => {
  const updateExperience = (index: number, updatedEntry: ExperienceEntry) => {
    const newExp = [...experience];
    newExp[index] = updatedEntry;
    onChange(newExp);
  };

  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      company: '',
      location: '',
      title: '',
      dates: '',
      bullets: [''],
      references: ''
    };
    onChange([...experience, newEntry]);
  };

  const removeExperience = (index: number) => {
    const newExp = experience.filter((_, i) => i !== index);
    onChange(newExp);
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experience.length - 1) return;

    const newExp = [...experience];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newExp[index];
    newExp[index] = newExp[targetIndex];
    newExp[targetIndex] = temp;

    onChange(newExp);
  };

  const handleExpBulletChange = (expIdx: number, bulletIdx: number, value: string) => {
    const entry = experience[expIdx];
    const newBullets = [...entry.bullets];
    newBullets[bulletIdx] = value;
    updateExperience(expIdx, { ...entry, bullets: newBullets });
  };

  const addExpBullet = (expIdx: number) => {
    const entry = experience[expIdx];
    updateExperience(expIdx, { ...entry, bullets: [...entry.bullets, ''] });
  };

  const removeExpBullet = (expIdx: number, bulletIdx: number) => {
    const entry = experience[expIdx];
    const newBullets = entry.bullets.filter((_, idx) => idx !== bulletIdx);
    updateExperience(expIdx, { ...entry, bullets: newBullets.length > 0 ? newBullets : [''] });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {experience.length === 0 ? (
        <p className="text-muted text-center py-4">No hay experiencias registradas aún.</p>
      ) : (
        experience.map((job, idx) => (
          <div key={job.id} className="nested-card border border-secondary border-opacity-10 rounded-3 p-3 position-relative">
            <div className="nested-card-header d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom border-secondary border-opacity-10">
              <span className="item-title-badge px-2 py-1 rounded">Puesto #{idx + 1}</span>
              <div className="card-actions d-flex gap-1">
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveExperience(idx, 'up')}
                  disabled={idx === 0}
                  title="Subir orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_upward</span>
                </button>
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveExperience(idx, 'down')}
                  disabled={idx === experience.length - 1}
                  title="Bajar orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_downward</span>
                </button>
                <button
                  className="action-btn delete-btn border border-secondary border-opacity-10 rounded text-danger"
                  onClick={() => removeExperience(idx)}
                  title="Eliminar experiencia"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                </button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Empresa</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CERVECERÍA NACIONAL DOMINICANA"
                  value={job.company}
                  onChange={e => updateExperience(idx, { ...job, company: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Santo Domingo, RD."
                  value={job.location}
                  onChange={e => updateExperience(idx, { ...job, location: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Puesto / Cargo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Desarrollador Full-Stack"
                  value={job.title}
                  onChange={e => updateExperience(idx, { ...job, title: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Fechas (Inicio – Fin)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Febrero 2026 – Presente"
                  value={job.dates}
                  onChange={e => updateExperience(idx, { ...job, dates: e.target.value })}
                />
              </div>

              {/* Bullet points subeditor */}
              <div className="col-12 form-group">
                <label className="sub-label mb-1 d-block fw-semibold text-muted">Logros / Responsabilidades (Viñetas)</label>
                <div className="bullets-subeditor d-flex flex-column gap-2 mt-2">
                  {job.bullets.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="bullet-row d-flex align-items-center gap-2">
                      <span className="bullet-dot text-primary fw-bold">•</span>
                      <input
                        type="text"
                        className="form-control flex-grow-1"
                        placeholder="Describa un logro..."
                        value={bullet}
                        onChange={e => handleExpBulletChange(idx, bulletIdx, e.target.value)}
                      />
                      <button
                        className="icon-btn-danger border-0 bg-transparent"
                        onClick={() => removeExpBullet(idx, bulletIdx)}
                        title="Eliminar viñeta"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-outline btn-sm d-inline-flex align-items-center gap-1 mt-1 py-1"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => addExpBullet(idx)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>add</span>
                    <span>Añadir Viñeta</span>
                  </button>
                </div>
              </div>

              <div className="col-12 form-group">
                <label className="form-label mb-1">Referencia (Nombre, Puesto y Contacto)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sabrina Rodriguez (BEES Owner) - Raphy Mesa (Creador)"
                  value={job.references}
                  onChange={e => updateExperience(idx, { ...job, references: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))
      )}
      <button className="btn btn-outline w-100 d-flex justify-content-center align-items-center gap-2" onClick={addExperience}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
        <span>Agregar Nueva Experiencia</span>
      </button>
    </div>
  );
};
