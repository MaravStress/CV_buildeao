import React from 'react';
import type { CVSettings } from '../../types/cv';
import { FONT_OPTIONS } from '../../constants/fonts';

interface SettingsFormProps {
  settings: CVSettings;
  onChange: (field: keyof CVSettings, value: string | number) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="row g-3">
      <div className="col-6 form-group">
        <label htmlFor="opt-font" className="form-label mb-1">Tipografía</label>
        <select
          id="opt-font"
          className="form-select"
          value={settings.fontFamily}
          onChange={e => onChange('fontFamily', e.target.value)}
        >
          <optgroup label="Serif (Elegante)">
            {FONT_OPTIONS.filter(f => f.category === 'Serif').map(f => (
              <option key={f.name} value={f.cssValue}>{f.name}</option>
            ))}
          </optgroup>
          <optgroup label="Sans-Serif (Moderno)">
            {FONT_OPTIONS.filter(f => f.category === 'Sans-Serif').map(f => (
              <option key={f.name} value={f.cssValue}>{f.name}</option>
            ))}
          </optgroup>
          <optgroup label="Monospace (Código)">
            {FONT_OPTIONS.filter(f => f.category === 'Monospace').map(f => (
              <option key={f.name} value={f.cssValue}>{f.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="col-6 form-group">
        <label htmlFor="opt-size" className="form-label mb-1">Tamaño Fuente</label>
        <select
          id="opt-size"
          className="form-select"
          value={settings.fontSize}
          onChange={e => onChange('fontSize', e.target.value)}
        >
          <option value="9.5pt">9.5pt (Compacto)</option>
          <option value="10pt">10pt</option>
          <option value="10.5pt">10.5pt (Recomendado)</option>
          <option value="11pt">11pt</option>
          <option value="12pt">12pt</option>
        </select>
      </div>

      <div className="col-6 form-group">
        <label htmlFor="opt-spacing" className="form-label mb-1">Interlineado</label>
        <select
          id="opt-spacing"
          className="form-select"
          value={settings.lineSpacing}
          onChange={e => onChange('lineSpacing', parseFloat(e.target.value))}
        >
          <option value="1.1">1.1 (Compacto)</option>
          <option value="1.2">1.2</option>
          <option value="1.25">1.25 (Recomendado)</option>
          <option value="1.35">1.35</option>
          <option value="1.5">1.5</option>
        </select>
      </div>

      <div className="col-6 form-group">
        <label htmlFor="opt-margins" className="form-label mb-1">Márgenes</label>
        <select
          id="opt-margins"
          className="form-select"
          value={settings.margins}
          onChange={e => onChange('margins', e.target.value)}
        >
          <option value="0.4in">0.4 pulg</option>
          <option value="0.5in">0.5 pulg</option>
          <option value="0.6in">0.6 pulg (Recomendado)</option>
          <option value="0.75in">0.75 pulg</option>
          <option value="1in">1 pulg</option>
        </select>
      </div>
    </div>
  );
};
