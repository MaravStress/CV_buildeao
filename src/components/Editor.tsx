import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { CVData } from '../types/cv';
import { DEMO_CV_DATA } from '../constants/demoData';
import { PersonalInfoForm } from './editor/PersonalInfoForm';
import { SummaryForm } from './editor/SummaryForm';
import { ExperienceForm } from './editor/ExperienceForm';
import { EducationForm } from './editor/EducationForm';
import { SkillsForm } from './editor/SkillsForm';
import { SettingsForm } from './editor/SettingsForm';
import { AiImportForm } from './editor/AiImportForm';

interface EditorProps {
  data: CVData;
  onChange: (newData: CVData) => void;
  hoveredSection: string | null;
  setHoveredSection: (section: string | null) => void;
}

type ModalType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'settings' | 'ai-import' | null;

export const Editor: React.FC<EditorProps> = ({
  data,
  onChange,
  hoveredSection,
  setHoveredSection
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to update personal info
  const handlePersonalInfoChange = (field: keyof CVData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  // Helper to update summary
  const handleSummaryChange = (value: string) => {
    onChange({
      ...data,
      summary: value
    });
  };

  // Helper to update settings
  const handleSettingChange = (field: keyof CVData['settings'], value: string | number) => {
    onChange({
      ...data,
      settings: {
        ...data.settings,
        [field]: value
      }
    });
  };

  // --- GLOBAL DOCUMENT OPERATIONS ---
  const loadDemoData = () => {
    onChange(DEMO_CV_DATA);
  };

  const clearAllData = () => {
    onChange({
      personalInfo: { name: '', location: '', email: '', phone: '', website: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      settings: {
        fontFamily: 'Georgia, serif',
        fontSize: '11pt',
        lineSpacing: 1.25,
        margins: '0.6in'
      }
    });
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.personalInfo.name.replace(/\s+/g, '_') || 'CV'}_Data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target?.result as string);
          if (parsedData.personalInfo && Array.isArray(parsedData.experience)) {
            onChange(parsedData);
          } else {
            alert("Formato de archivo inválido. Asegúrese de que sea un JSON exportado por esta aplicación.");
          }
        } catch (error) {
          alert("Error al leer el archivo JSON.");
        }
      };
    }
  };

  const downloadPDF = () => {
    // We now use native browser printing to preserve text as vectors.
    // The Preview component uses a ResizeObserver to dynamically inject an @page CSS rule
    // so that the printed page exactly matches the dimensions of the CV content,
    // avoiding pagination and showing everything on a single page.
    window.print();
  };

  // --- RENDERING MODAL HELPERS ---
  const getModalHeaderIcon = (type: ModalType) => {
    switch (type) {
      case 'personal': return <span className="material-symbols-outlined text-primary fs-5">person</span>;
      case 'summary': return <span className="material-symbols-outlined text-primary fs-5">description</span>;
      case 'experience': return <span className="material-symbols-outlined text-primary fs-5">work</span>;
      case 'education': return <span className="material-symbols-outlined text-primary fs-5">school</span>;
      case 'skills': return <span className="material-symbols-outlined text-primary fs-5">build</span>;
      case 'settings': return <span className="material-symbols-outlined text-primary fs-5">settings</span>;
      case 'ai-import': return <span className="material-symbols-outlined text-warning fs-5">auto_awesome</span>;
      default: return null;
    }
  };

  const getModalHeaderTitle = (type: ModalType) => {
    switch (type) {
      case 'personal': return 'Información Personal';
      case 'summary': return 'Resumen Profesional';
      case 'experience': return 'Experiencia Laboral';
      case 'education': return 'Educación y Cursos';
      case 'skills': return 'Habilidades';
      case 'settings': return 'Configuración de Página';
      case 'ai-import': return 'Cargar desde Texto con IA';
      default: return '';
    }
  };

  const renderModalContent = (type: ModalType) => {
    switch (type) {
      case 'personal':
        return (
          <PersonalInfoForm
            personalInfo={data.personalInfo}
            onChange={handlePersonalInfoChange}
          />
        );
      case 'summary':
        return (
          <SummaryForm
            summary={data.summary}
            onChange={handleSummaryChange}
          />
        );
      case 'experience':
        return (
          <ExperienceForm
            experience={data.experience}
            onChange={(newExp) => onChange({ ...data, experience: newExp })}
          />
        );
      case 'education':
        return (
          <EducationForm
            education={data.education}
            onChange={(newEdu) => onChange({ ...data, education: newEdu })}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            skills={data.skills}
            onChange={(newSkills) => onChange({ ...data, skills: newSkills })}
          />
        );
      case 'settings':
        return (
          <SettingsForm
            settings={data.settings}
            onChange={handleSettingChange}
          />
        );
      case 'ai-import':
        return (
          <AiImportForm
            currentSettings={data.settings}
            onChange={onChange}
            onClose={() => setActiveModal(null)}
          />
        );
      default:
        return null;
    }
  };

  const sectionNavs = [
    {
      id: 'personal' as const,
      title: 'Información Personal',
      desc: data.personalInfo.name || 'Sin nombre registrado',
      sub: data.personalInfo.email || data.personalInfo.phone || 'Establece tus datos de contacto',
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>person</span>
    },
    {
      id: 'summary' as const,
      title: 'Resumen Profesional',
      desc: data.summary ? `${data.summary.substring(0, 45)}...` : 'Sin resumen redactado',
      sub: `${data.summary.split(/\s+/).filter(Boolean).length} palabras registradas`,
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>description</span>
    },
    {
      id: 'experience' as const,
      title: 'Experiencia Laboral',
      desc: `${data.experience.length} puestos registrados`,
      sub: data.experience.length > 0 ? data.experience.map(j => j.company).join(', ').substring(0, 40) : 'Registra tus trabajos anteriores',
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>work</span>
    },
    {
      id: 'education' as const,
      title: 'Educación y Cursos',
      desc: `${data.education.length} registros académicos`,
      sub: data.education.length > 0 ? data.education.map(e => e.institution).join(', ').substring(0, 40) : 'Registra tus grados y títulos',
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>school</span>
    },
    {
      id: 'skills' as const,
      title: 'Habilidades',
      desc: `${data.skills.length} categorías de habilidades`,
      sub: data.skills.length > 0 ? data.skills.map(s => s.categoryName).join(', ') : 'Registra tus habilidades técnicas',
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>build</span>
    },
    {
      id: 'settings' as const,
      title: 'Configuración de Página',
      desc: `Tipografía: ${data.settings.fontFamily.split(',')[0]}`,
      sub: `Márgenes: ${data.settings.margins} | Interlineado: ${data.settings.lineSpacing}`,
      icon: <span className="material-symbols-outlined text-indigo" style={{ fontSize: '18px' }}>settings</span>
    },
    {
      id: 'ai-import' as const,
      title: 'Cargar desde Texto (IA)',
      desc: 'Importa un currículum existente pegando su texto',
      sub: localStorage.getItem('gemini_api_key_cv_builder') ? '✓ API Key configurada' : '⚠️ Requiere API Key de Gemini',
      icon: <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>auto_awesome</span>
    }
  ];

  return (
    <div className="editor-panel col-12 col-lg-4 col-xl-3 h-lg-100 d-flex flex-column border-end border-secondary border-opacity-10 overflow-lg-hidden no-print">
      {/* Top Header Actions */}
      <div className="editor-topbar p-3 border-bottom d-flex justify-content-between align-items-center bg-dark bg-opacity-25">
        <h2 className="topbar-logo m-0">CV Buildeao</h2>
        <div className="topbar-actions d-flex gap-2">
          <button
            className="btn btn-secondary flex-btn py-1 px-2 d-flex align-items-center"
            onClick={loadDemoData}
            title="Cargar currículum de Eliam de ejemplo"
          >
            <span className="material-symbols-outlined me-1" style={{ fontSize: '14px' }}>restart_alt</span>
            <span className="d-none d-xl-inline">Eliam</span>
          </button>
          <button
            className="btn btn-danger flex-btn py-1 px-2 d-flex align-items-center"
            onClick={clearAllData}
            title="Limpiar todos los campos"
          >
            <span className="material-symbols-outlined me-1" style={{ fontSize: '14px' }}>delete</span>
            <span className="d-none d-xl-inline">Limpiar</span>
          </button>
        </div>
      </div>

      {/* Main navigation cards dashboard */}
      <div className="editor-scrollable flex-grow-1 overflow-lg-auto p-3 d-flex flex-column gap-2">
        <div className="mb-2">
          <span className="text-muted uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Secciones del Currículum</span>
        </div>

        {sectionNavs.map(nav => (
          <button
            key={nav.id}
            className={`section-nav-card p-3 text-start border border-secondary border-opacity-10 rounded-3 bg-dark bg-opacity-25 transition-all d-flex align-items-center gap-3 w-100 ${hoveredSection === nav.id ? 'active-nav-card' : ''}`}
            onClick={() => setActiveModal(nav.id)}
            onMouseEnter={() => setHoveredSection(nav.id)}
            onMouseLeave={() => setHoveredSection(null)}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <div className="nav-card-icon-wrapper p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-15">
              {nav.icon}
            </div>
            <div className="nav-card-details flex-grow-1 overflow-hidden">
              <h4 className="nav-card-title m-0 fs-6 fw-semibold text-white">{nav.title}</h4>
              <p className="nav-card-desc m-0 text-truncate text-muted mt-1" style={{ fontSize: '0.78rem' }}>{nav.desc}</p>
              <p className="nav-card-sub m-0 text-truncate text-secondary opacity-50 mt-0.5" style={{ fontSize: '0.7rem' }}>{nav.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Print & JSON Actions */}
      <div className="editor-footer p-3 border-top d-flex flex-column gap-2 bg-dark bg-opacity-25">
        <div className="data-transfer-row d-flex gap-2">
          <button className="btn btn-outline flex-btn-sm w-50 justify-content-center d-flex align-items-center gap-1" onClick={exportJSON}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>download</span>
            <span>Exportar JSON</span>
          </button>

          <label className="btn btn-outline flex-btn-sm cursor-pointer w-50 d-flex justify-content-center align-items-center gap-1 m-0">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>upload</span>
            <span>Importar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={importJSON}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <button
          className="btn btn-primary btn-lg w-100 d-flex justify-content-center align-items-center gap-2 mt-1"
          onClick={downloadPDF}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              <span>Descargar como PDF</span>
            </>
          )}
        </button>
      </div>

      {/* RENDER MODAL BOX */}
      {activeModal && createPortal(
        <>
          <div className="modal-backdrop fade show no-print" onClick={() => {
            if (activeModal !== 'ai-import') setActiveModal(null);
          }}></div>
          <div className="modal fade show d-block no-print" tabIndex={-1} role="dialog" onClick={() => {
            if (activeModal !== 'ai-import') setActiveModal(null);
          }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={e => e.stopPropagation()}>
              <div className="modal-content border border-secondary border-opacity-15 bg-dark text-white rounded-3 shadow-lg">
                <div className="modal-header border-bottom border-secondary border-opacity-15 p-3 d-flex justify-content-between align-items-center">
                  <h5 className="modal-title d-flex align-items-center gap-2 m-0 fs-5 fw-semibold">
                    {getModalHeaderIcon(activeModal)}
                    <span>{getModalHeaderTitle(activeModal)}</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white border-0 bg-transparent p-1 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setActiveModal(null);
                    }}
                    aria-label="Close"
                    style={{ filter: 'invert(1)', opacity: 0.8, outline: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '65vh' }}>
                  {renderModalContent(activeModal)}
                </div>
                {activeModal !== 'ai-import' && (
                  <div className="modal-footer border-top border-secondary border-opacity-15 p-3 d-flex justify-content-end">
                    <button type="button" className="btn btn-primary px-4" onClick={() => setActiveModal(null)}>
                      Listo / Guardar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
