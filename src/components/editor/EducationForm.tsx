import React from 'react';
import type { EducationEntry } from '../../types/cv';

interface EducationFormProps {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onChange,
}) => {
  const updateEducation = (index: number, updatedEntry: EducationEntry) => {
    const newEdu = [...education];
    newEdu[index] = updatedEntry;
    onChange(newEdu);
  };

  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: `edu-${Date.now()}`,
      institution: '',
      location: '',
      degree: '',
      dates: '',
      thesis: '',
      courses: ['']
    };
    onChange([...education, newEntry]);
  };

  const removeEducation = (index: number) => {
    const newEdu = education.filter((_, i) => i !== index);
    onChange(newEdu);
  };

  const moveEducation = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === education.length - 1) return;

    const newEdu = [...education];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newEdu[index];
    newEdu[index] = newEdu[targetIndex];
    newEdu[targetIndex] = temp;

    onChange(newEdu);
  };

  const handleEduCourseChange = (eduIdx: number, courseIdx: number, value: string) => {
    const entry = education[eduIdx];
    const newCourses = [...(entry.courses || [])];
    newCourses[courseIdx] = value;
    updateEducation(eduIdx, { ...entry, courses: newCourses });
  };

  const addEduCourse = (eduIdx: number) => {
    const entry = education[eduIdx];
    updateEducation(eduIdx, { ...entry, courses: [...(entry.courses || []), ''] });
  };

  const removeEduCourse = (eduIdx: number, courseIdx: number) => {
    const entry = education[eduIdx];
    const newCourses = (entry.courses || []).filter((_, idx) => idx !== courseIdx);
    updateEducation(eduIdx, { ...entry, courses: newCourses });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {education.length === 0 ? (
        <p className="text-muted text-center py-4">No hay registros educativos agregados.</p>
      ) : (
        education.map((edu, idx) => (
          <div key={edu.id} className="nested-card border border-secondary border-opacity-10 rounded-3 p-3 position-relative">
            <div className="nested-card-header d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom border-secondary border-opacity-10">
              <span className="item-title-badge px-2 py-1 rounded">Educación #{idx + 1}</span>
              <div className="card-actions d-flex gap-1">
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveEducation(idx, 'up')}
                  disabled={idx === 0}
                  title="Subir orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_upward</span>
                </button>
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveEducation(idx, 'down')}
                  disabled={idx === education.length - 1}
                  title="Bajar orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_downward</span>
                </button>
                <button
                  className="action-btn delete-btn border border-secondary border-opacity-10 rounded text-danger"
                  onClick={() => removeEducation(idx)}
                  title="Eliminar educación"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                </button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Institución</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. INSTITUTO TECNOLÓGICO DE SANTO DOMINGO"
                  value={edu.institution}
                  onChange={e => updateEducation(idx, { ...edu, institution: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Santo Domingo, RD."
                  value={edu.location}
                  onChange={e => updateEducation(idx, { ...edu, location: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Título / Grado / Certificado</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Grado, Ingeniería de Software"
                  value={edu.degree}
                  onChange={e => updateEducation(idx, { ...edu, degree: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 form-group">
                <label className="form-label mb-1">Fecha Graduación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Enero 2026"
                  value={edu.dates}
                  onChange={e => updateEducation(idx, { ...edu, dates: e.target.value })}
                />
              </div>
              <div className="col-12 form-group">
                <label className="form-label mb-1">Detalle de Tesis / Mención Especial (Opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. WithYou, una plataforma digital..."
                  value={edu.thesis || ''}
                  onChange={e => updateEducation(idx, { ...edu, thesis: e.target.value })}
                />
              </div>

              {/* Course / Certification subeditor */}
              <div className="col-12 form-group">
                <label className="sub-label mb-1 d-block fw-semibold text-muted">Certificados / Cursos Relevantes (Opcional)</label>
                <div className="bullets-subeditor d-flex flex-column gap-2 mt-2">
                  {(edu.courses || []).map((course, courseIdx) => (
                    <div key={courseIdx} className="bullet-row d-flex align-items-center gap-2">
                      <span className="bullet-dot text-primary fw-bold">•</span>
                      <input
                        type="text"
                        className="form-control flex-grow-1"
                        placeholder="e.g. Fundamentos Certificados por Fortinet (FCF)"
                        value={course}
                        onChange={e => handleEduCourseChange(idx, courseIdx, e.target.value)}
                      />
                      <button
                        className="icon-btn-danger border-0 bg-transparent"
                        onClick={() => removeEduCourse(idx, courseIdx)}
                        title="Eliminar certificado"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-outline btn-sm d-inline-flex align-items-center gap-1 mt-1 py-1"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => addEduCourse(idx)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>add</span>
                    <span>Añadir Certificado</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      <button className="btn btn-outline w-100 d-flex justify-content-center align-items-center gap-2" onClick={addEducation}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
        <span>Agregar Nueva Educación / Curso</span>
      </button>
    </div>
  );
};
