import React from 'react';

interface SummaryFormProps {
  summary: string;
  onChange: (value: string) => void;
}

export const SummaryForm: React.FC<SummaryFormProps> = ({
  summary,
  onChange,
}) => {
  const charCount = summary.length;
  const wordCount = summary.split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-100">
      <label htmlFor="pf-summary" className="form-label mb-1">Perfil Profesional</label>
      <textarea
        id="pf-summary"
        className="form-control"
        rows={6}
        placeholder="Redacta un resumen corto de tus años de experiencia, áreas de enfoque, y principales cualidades..."
        value={summary}
        onChange={e => onChange(e.target.value)}
      />
      <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
        <span>{charCount} caracteres</span>
        <span>{wordCount} palabras</span>
      </div>
    </div>
  );
};
