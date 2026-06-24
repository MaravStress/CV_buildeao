import React from 'react';
import type { CVData } from '../types/cv';

interface PreviewProps {
  data: CVData;
  hoveredSection: string | null;
  setHoveredSection: (section: string | null) => void;
  currentLang: 'es' | 'en';
  isTranslating: boolean;
  onLanguageChange: (lang: 'es' | 'en') => void;
  onTranslate: () => void;
  onOpenSettings: () => void;
}

export const Preview: React.FC<PreviewProps> = ({
  data,
  hoveredSection,
  setHoveredSection,
  currentLang,
  isTranslating,
  onLanguageChange,
  onTranslate,
  onOpenSettings
}) => {
  const { personalInfo, summary, experience, education, skills, settings } = data;

  // Dynamically set @page print size matching the exact content height of the CV
  React.useEffect(() => {
    const updatePrintSize = () => {
      const element = document.getElementById('cv-print-sheet');
      if (element) {
        // Measure exact width and height of the CV sheet on screen in pixels
        const widthPx = element.offsetWidth || 820;
        const heightPx = element.scrollHeight;

        // Convert pixels to mm: 1px = 25.4 / 96 = 0.264583 mm
        const widthMm = (widthPx * 25.4) / 96;
        const heightMm = (heightPx * 25.4) / 96;

        // We add a tiny 1mm height buffer to the page size to prevent rounding issues from causing a 2nd blank page,
        // while maintaining the original unscaled content dimensions for the CV itself.
        const pageHeightMm = heightMm + 1;

        let styleTag = document.getElementById('dynamic-print-sheet-size');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'dynamic-print-sheet-size';
          document.head.appendChild(styleTag);
        }

        styleTag.innerHTML = `
          @media print {
            @page {
              size: ${widthMm}mm ${pageHeightMm}mm !important;
              margin: 0 !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: ${widthMm}mm !important;
              height: ${pageHeightMm}mm !important;
              min-height: ${pageHeightMm}mm !important;
              max-height: ${pageHeightMm}mm !important;
            }
            .preview-panel, .preview-container {
              padding: 0 !important;
              margin: 0 !important;
              width: ${widthMm}mm !important;
              max-width: ${widthMm}mm !important;
            }
            .cv-sheet {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              width: ${widthMm}mm !important;
              min-width: ${widthMm}mm !important;
              max-width: ${widthMm}mm !important;
              height: ${heightMm}mm !important;
              min-height: ${heightMm}mm !important;
              max-height: ${heightMm}mm !important;
              box-sizing: border-box !important;
            }
          }
        `;
      }
    };

    // Initial update
    updatePrintSize();

    // Set up ResizeObserver to update size whenever content changes
    const element = document.getElementById('cv-print-sheet');
    let resizeObserver: ResizeObserver | null = null;
    
    if (element) {
      resizeObserver = new ResizeObserver(() => {
        updatePrintSize();
      });
      resizeObserver.observe(element);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      const styleTag = document.getElementById('dynamic-print-sheet-size');
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, [data]); // Re-run when data changes just to be safe, though ResizeObserver handles it


  // Custom inline styles based on page settings
  const containerStyle = {
    fontFamily: settings.fontFamily || 'Georgia, serif',
    fontSize: settings.fontSize || '10.5pt',
    lineHeight: settings.lineSpacing || 1.25,
    padding: settings.margins || '0.6in',
  };

  const getHighlightClass = (sectionId: string) => {
    return hoveredSection === sectionId ? 'preview-highlighted' : '';
  };

  // Build contact details dynamically to avoid empty separators
  const contactItems: React.ReactNode[] = [];
  if (personalInfo.location?.trim()) {
    contactItems.push(<span key="loc">{personalInfo.location.trim()}</span>);
  }
  if (personalInfo.email?.trim()) {
    contactItems.push(
      <a key="email" href={`mailto:${personalInfo.email.trim()}`} className="contact-link text-decoration-none text-muted">
        {personalInfo.email.trim()}
      </a>
    );
  }
  if (personalInfo.phone?.trim()) {
    contactItems.push(
      <a key="phone" href={`tel:${personalInfo.phone.trim()}`} className="contact-link text-decoration-none text-muted">
        {personalInfo.phone.trim()}
      </a>
    );
  }
  if (personalInfo.website?.trim()) {
    contactItems.push(
      <a key="web" href={personalInfo.website.trim()} target="_blank" rel="noopener noreferrer" className="contact-link text-decoration-none text-muted">
        {personalInfo.website.trim().replace(/^https?:\/\/(www\.)?/, '')}
      </a>
    );
  }

  // Filter sections to hide items that are completely blank
  const activeExperience = experience.filter(job =>
    job.company?.trim() ||
    job.location?.trim() ||
    job.title?.trim() ||
    job.dates?.trim() ||
    job.bullets?.some(b => b?.trim()) ||
    job.references?.trim()
  );

  const activeEducation = education.filter(edu =>
    edu.institution?.trim() ||
    edu.location?.trim() ||
    edu.degree?.trim() ||
    edu.dates?.trim() ||
    edu.thesis?.trim() ||
    edu.courses?.some(c => c?.trim())
  );

  const activeSkills = skills.filter(skillCat => {
    const activeCatSkills = (skillCat.skills || []).filter(s => s && s.trim() !== '');
    return skillCat.categoryName?.trim() && activeCatSkills.length > 0;
  });

  return (
    <div className="preview-container w-100 d-flex flex-column gap-3" style={{ maxWidth: '820px' }}>
      {/* Page indicator & switcher for non-print mode */}
      <div className="preview-page-header no-print d-flex justify-content-between align-items-center px-1 text-muted" style={{ fontSize: '0.85rem' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center bg-dark bg-opacity-25 rounded-pill p-1 border border-secondary border-opacity-10" style={{ gap: '2px' }}>
            <button
              type="button"
              className={`btn btn-sm rounded-pill py-0.5 px-3 border-0 transition-all ${currentLang === 'es' ? 'btn-primary text-white' : 'text-secondary bg-transparent'}`}
              style={{ fontSize: '0.75rem', fontWeight: 500 }}
              onClick={() => onLanguageChange('es')}
              disabled={isTranslating}
            >
              Original (Español)
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill py-0.5 px-3 border-0 transition-all ${currentLang === 'en' ? 'btn-primary text-white' : 'text-secondary bg-transparent'}`}
              style={{ fontSize: '0.75rem', fontWeight: 500 }}
              onClick={() => onLanguageChange('en')}
              disabled={isTranslating}
            >
              Inglés
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {currentLang === 'en' && !isTranslating && (
            <button
              type="button"
              className="btn btn-sm btn-outline-warning border-warning border-opacity-20 d-flex align-items-center gap-1 py-1 px-2 rounded-3 transition-all"
              style={{ fontSize: '0.75rem' }}
              onClick={onTranslate}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>translate</span>
              <span>Traducir</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-secondary p-1 d-flex align-items-center justify-content-center rounded-circle transition-all"
            style={{ width: '30px', height: '30px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={onOpenSettings}
            title="Configurar Gemini API Key"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
          </button>
        </div>
      </div>

      <div className="position-relative w-100">
        {/* Glassmorphic Loading Overlay */}
        {isTranslating && (
          <div className="translation-overlay">
            <div className="translation-card">
              <div className="spinner-border translation-spinner mb-3" role="status">
                <span className="visually-hidden">Traduciendo...</span>
              </div>
              <h5 className="text-white fw-bold mb-2">Traduciendo Currículum</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                Por favor espera mientras Gemini traduce tu información profesional al inglés...
              </p>
            </div>
          </div>
        )}

        <div
          id="cv-print-sheet"
          className="cv-sheet shadow"
          style={containerStyle}
        >
          {/* Personal Header */}
          <header
            className={`cv-header text-center p-2 section-hover-trigger ${getHighlightClass('personal')}`}
            onMouseEnter={() => setHoveredSection('personal')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <h1 className="candidate-name fw-bold m-0 text-dark" style={{ fontSize: '24pt', letterSpacing: '-0.5px' }}>
              {personalInfo.name || 'Tu Nombre'}
            </h1>
            {contactItems.length > 0 && (
              <div className="contact-info d-flex justify-content-center align-items-center flex-wrap gap-2 mt-2 text-muted" style={{ fontSize: '9pt' }}>
                {contactItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="separator text-muted text-opacity-25 px-1">|</span>}
                    {item}
                  </React.Fragment>
                ))}
              </div>
            )}
          </header>

          <hr className="header-divider border-dark border-opacity-70 my-3" style={{ height: '1px' }} />

          {/* Professional Summary */}
          {summary && summary.trim() && (
            <section
              className={`cv-section p-2 mb-3 section-hover-trigger ${getHighlightClass('summary')}`}
              onMouseEnter={() => setHoveredSection('summary')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <p className="summary-text text-justify m-0 text-muted" style={{ lineHeight: 'inherit' }}>{summary.trim()}</p>
            </section>
          )}

          {/* Experience Section */}
          {activeExperience.length > 0 && (
            <section
              className={`cv-section mb-3 p-2 ${getHighlightClass('experience')}`}
              onMouseEnter={() => setHoveredSection('experience')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="section-title fw-bold m-0 text-dark" style={{ fontSize: '11pt', letterSpacing: '0.8px' }}>EXPERIENCIA</h2>
              <hr className="section-divider border-secondary border-opacity-25 my-1" style={{ height: '1px' }} />
              <div className="experience-list d-flex flex-column gap-3 mt-2">
                {activeExperience.map((job) => {
                  const activeBullets = (job.bullets || []).filter(b => b && b.trim() !== '');
                  return (
                    <div
                      key={job.id}
                      className={`experience-entry entry-block p-1 section-hover-trigger ${getHighlightClass(job.id)}`}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredSection(job.id);
                      }}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      {(job.company?.trim() || job.location?.trim()) && (
                        <div className="entry-header d-flex justify-content-between align-items-baseline fw-bold text-dark" style={{ fontSize: '10pt' }}>
                          <span className="company-name text-uppercase">{job.company?.trim() || ''}</span>
                          <span className="entry-location fw-normal text-muted" style={{ fontSize: '9.5pt' }}>{job.location?.trim() || ''}</span>
                        </div>
                      )}
                      {(job.title?.trim() || job.dates?.trim()) && (
                        <div className="entry-subheader d-flex justify-content-between align-items-baseline mb-1">
                          <span className="job-title fw-bold text-secondary" style={{ fontSize: '9.5pt' }}>{job.title?.trim() || ''}</span>
                          <span className="entry-dates fst-italic text-muted" style={{ fontSize: '9.5pt' }}>{job.dates?.trim() || ''}</span>
                        </div>
                      )}

                      {activeBullets.length > 0 && (
                        <ul className="bullets-list ps-3 mb-2" style={{ listStyleType: 'disc' }}>
                          {activeBullets.map((bullet, idx) => (
                            <li key={idx} className="bullet-item text-justify mb-1 text-muted" style={{ lineHeight: 'inherit' }}>{bullet.trim()}</li>
                          ))}
                        </ul>
                      )}

                      {job.references && job.references.trim() && (
                        <div className="reference-line fst-italic text-muted mt-2 ps-2 border-start border-2 border-light" style={{ fontSize: '9pt' }}>
                          Referencia: <span className="reference-text fw-semibold text-dark">{job.references.trim()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education Section */}
          {activeEducation.length > 0 && (
            <section
              className={`cv-section mb-3 p-2 ${getHighlightClass('education')}`}
              onMouseEnter={() => setHoveredSection('education')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="section-title fw-bold m-0 text-dark" style={{ fontSize: '11pt', letterSpacing: '0.8px' }}>EDUCACIÓN</h2>
              <hr className="section-divider border-secondary border-opacity-25 my-1" style={{ height: '1px' }} />
              <div className="education-list d-flex flex-column gap-3 mt-2">
                {activeEducation.map((edu) => {
                  const activeCourses = (edu.courses || []).filter(c => c && c.trim() !== '');
                  return (
                    <div
                      key={edu.id}
                      className={`education-entry entry-block p-1 section-hover-trigger ${getHighlightClass(edu.id)}`}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredSection(edu.id);
                      }}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      {(edu.institution?.trim() || edu.location?.trim()) && (
                        <div className="entry-header d-flex justify-content-between align-items-baseline fw-bold text-dark" style={{ fontSize: '10pt' }}>
                          <span className="institution-name text-uppercase">{edu.institution?.trim() || ''}</span>
                          <span className="entry-location fw-normal text-muted" style={{ fontSize: '9.5pt' }}>{edu.location?.trim() || ''}</span>
                        </div>
                      )}
                      {(edu.degree?.trim() || edu.dates?.trim()) && (
                        <div className="entry-subheader d-flex justify-content-between align-items-baseline mb-1">
                          <span className="degree-title fw-normal text-secondary" style={{ fontSize: '9.5pt' }}>{edu.degree?.trim() || ''}</span>
                          <span className="entry-dates fst-italic text-muted" style={{ fontSize: '9.5pt' }}>{edu.dates?.trim() || ''}</span>
                        </div>
                      )}

                      {edu.thesis && edu.thesis.trim() && (
                        <p className="thesis-text text-muted mb-2">
                          Tesis: <span className="thesis-title fst-italic">{edu.thesis.trim()}</span>
                        </p>
                      )}

                      {activeCourses.length > 0 && (
                        <div className="courses-wrapper mt-2">
                          <span className="courses-header fw-semibold text-dark" style={{ fontSize: '9.5pt' }}>Cursos Relevantes y Certificaciones:</span>
                          <ul className="bullets-list courses-list ps-3 mb-0 mt-1" style={{ listStyleType: 'disc' }}>
                            {activeCourses.map((course, idx) => (
                              <li key={idx} className="bullet-item text-justify mb-1 text-muted" style={{ lineHeight: 'inherit' }}>{course.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {activeSkills.length > 0 && (
            <section
              className={`cv-section mb-3 p-2 skills-section ${getHighlightClass('skills')}`}
              onMouseEnter={() => setHoveredSection('skills')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="section-title fw-bold m-0 text-dark" style={{ fontSize: '11pt', letterSpacing: '0.8px' }}>HABILIDADES</h2>
              <hr className="section-divider border-secondary border-opacity-25 my-1" style={{ height: '1px' }} />
              <div className="skills-grid d-flex flex-column gap-1 mt-2">
                {activeSkills.map((skillCat) => {
                  const activeCatSkills = (skillCat.skills || []).filter(s => s && s.trim() !== '');
                  return (
                    <div
                      key={skillCat.id}
                      className={`skills-row p-1 section-hover-trigger ${getHighlightClass(skillCat.id)}`}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredSection(skillCat.id);
                      }}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <span className="skill-category-label fw-bold text-dark">{skillCat.categoryName.trim()}:</span>{' '}
                      <span className="skills-list-text text-muted">{activeCatSkills.join(', ')}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
