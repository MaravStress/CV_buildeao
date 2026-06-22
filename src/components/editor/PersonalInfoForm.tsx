import React from 'react';
import type { PersonalInfo } from '../../types/cv';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (field: keyof PersonalInfo, value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  personalInfo,
  onChange,
}) => {
  return (
    <div className="row g-3">
      <div className="col-12 col-md-6 form-group">
        <label htmlFor="pf-name" className="form-label mb-1">Nombre Completo</label>
        <input
          id="pf-name"
          type="text"
          className="form-control"
          placeholder="Eliam"
          value={personalInfo.name}
          onChange={e => onChange('name', e.target.value)}
        />
      </div>
      <div className="col-12 col-md-6 form-group">
        <label htmlFor="pf-location" className="form-label mb-1">Ubicación</label>
        <div className="input-with-icon position-relative">
          <span className="material-symbols-outlined input-icon position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style={{ fontSize: '1rem' }}>location_on</span>
          <input
            id="pf-location"
            type="text"
            className="form-control ps-4"
            placeholder="Santo Domingo, RD"
            value={personalInfo.location}
            onChange={e => onChange('location', e.target.value)}
          />
        </div>
      </div>
      <div className="col-12 col-md-6 form-group">
        <label htmlFor="pf-email" className="form-label mb-1">Correo Electrónico</label>
        <div className="input-with-icon position-relative">
          <span className="material-symbols-outlined input-icon position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style={{ fontSize: '1rem' }}>mail</span>
          <input
            id="pf-email"
            type="email"
            className="form-control ps-4"
            placeholder="alanbusinessnin@gmail.com"
            value={personalInfo.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
      </div>
      <div className="col-12 col-md-6 form-group">
        <label htmlFor="pf-phone" className="form-label mb-1">Teléfono</label>
        <div className="input-with-icon position-relative">
          <span className="material-symbols-outlined input-icon position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style={{ fontSize: '1rem' }}>call</span>
          <input
            id="pf-phone"
            type="tel"
            className="form-control ps-4"
            placeholder="+1 (809) 433-5578"
            value={personalInfo.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </div>
      </div>
      <div className="col-12 form-group">
        <label htmlFor="pf-web" className="form-label mb-1">Sitio Web / Portfolio (URL)</label>
        <div className="input-with-icon position-relative">
          <span className="material-symbols-outlined input-icon position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style={{ fontSize: '1rem' }}>public</span>
          <input
            id="pf-web"
            type="url"
            className="form-control ps-4"
            placeholder="https://alannin.dev"
            value={personalInfo.website}
            onChange={e => onChange('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
