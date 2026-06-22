import React from 'react';
import type { SkillCategory } from '../../types/cv';

interface SkillsFormProps {
  skills: SkillCategory[];
  onChange: (skills: SkillCategory[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  onChange,
}) => {
  const handleSkillCategoryChange = (index: number, field: keyof SkillCategory, value: any) => {
    const newSkills = [...skills];
    newSkills[index] = {
      ...newSkills[index],
      [field]: value
    };
    onChange(newSkills);
  };

  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      categoryName: '',
      skills: []
    };
    onChange([...skills, newCat]);
  };

  const removeSkillCategory = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  const moveSkillCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === skills.length - 1) return;

    const newSkills = [...skills];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSkills[index];
    newSkills[index] = newSkills[targetIndex];
    newSkills[targetIndex] = temp;

    onChange(newSkills);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {skills.length === 0 ? (
        <p className="text-muted text-center py-4">No hay categorías de habilidades registradas.</p>
      ) : (
        skills.map((skillCat, idx) => (
          <div key={skillCat.id} className="nested-card border border-secondary border-opacity-10 rounded-3 p-3 position-relative">
            <div className="nested-card-header d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom border-secondary border-opacity-10">
              <span className="item-title-badge px-2 py-1 rounded">Categoría #{idx + 1}</span>
              <div className="card-actions d-flex gap-1">
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveSkillCategory(idx, 'up')}
                  disabled={idx === 0}
                  title="Subir orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_upward</span>
                </button>
                <button
                  className="action-btn border border-secondary border-opacity-10 rounded"
                  onClick={() => moveSkillCategory(idx, 'down')}
                  disabled={idx === skills.length - 1}
                  title="Bajar orden"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_downward</span>
                </button>
                <button
                  className="action-btn delete-btn border border-secondary border-opacity-10 rounded text-danger"
                  onClick={() => removeSkillCategory(idx)}
                  title="Eliminar categoría"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                </button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 form-group">
                <label className="form-label mb-1">Nombre de Categoría</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Front-End, Back-End, DevOps"
                  value={skillCat.categoryName}
                  onChange={e => handleSkillCategoryChange(idx, 'categoryName', e.target.value)}
                />
              </div>
              <div className="col-12 form-group">
                <label className="form-label mb-1">Habilidades (Separadas por comas)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, NextJS, Astro, TailwindCSS"
                  value={skillCat.skills.join(', ')}
                  onChange={e => {
                    const list = e.target.value.split(',').map(s => s.trim());
                    handleSkillCategoryChange(idx, 'skills', list);
                  }}
                />
              </div>
            </div>
          </div>
        ))
      )}
      <button className="btn btn-outline w-100 d-flex justify-content-center align-items-center gap-2" onClick={addSkillCategory}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
        <span>Agregar Categoría de Habilidades</span>
      </button>
    </div>
  );
};
