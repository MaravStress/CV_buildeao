import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import type { CVData } from './types/cv';
import { DEMO_CV_DATA } from './constants/demoData';
import { FONT_OPTIONS } from './constants/fonts';
import { translateCVToEnglish } from './services/translator';

function App() {
  // Initialize with Spanish CV data as original
  const [cvDataEs, setCvDataEs] = useState<CVData>(() => {
    const saved = localStorage.getItem('professional_cv_builder_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved CV data (ES):', e);
      }
    }
    return DEMO_CV_DATA;
  });

  // Initialize with English CV data (starts as null if not translated yet)
  const [cvDataEn, setCvDataEn] = useState<CVData | null>(() => {
    const saved = localStorage.getItem('professional_cv_builder_data_en');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved CV data (EN):', e);
      }
    }
    return null;
  });

  // Active language state
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingLangChange, setPendingLangChange] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('gemini_api_key_cv_builder') || '');

  // Track hovered section for synchronized UI highlights
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    localStorage.setItem('professional_cv_builder_data', JSON.stringify(cvDataEs));
  }, [cvDataEs]);

  useEffect(() => {
    if (cvDataEn) {
      localStorage.setItem('professional_cv_builder_data_en', JSON.stringify(cvDataEn));
    }
  }, [cvDataEn]);

  // Set document title dynamically based on active applicant name
  useEffect(() => {
    const activeData = currentLang === 'es' ? cvDataEs : (cvDataEn || cvDataEs);
    if (activeData.personalInfo.name) {
      document.title = `CV - ${activeData.personalInfo.name}`;
    } else {
      document.title = 'Professional CV Builder';
    }
  }, [cvDataEs, cvDataEn, currentLang]);

  // Load selected Google Font dynamically for the active CV settings
  useEffect(() => {
    const activeData = currentLang === 'es' ? cvDataEs : (cvDataEn || cvDataEs);
    const selectedFont = FONT_OPTIONS.find(f => f.cssValue === activeData.settings.fontFamily);
    if (selectedFont && selectedFont.googleName) {
      const linkId = `google-font-${selectedFont.googleName}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.googleName}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [cvDataEs, cvDataEn, currentLang]);

  // Translation trigger handler
  const runTranslation = async (key: string) => {
    setIsTranslating(true);
    try {
      const translated = await translateCVToEnglish(cvDataEs, key);
      setCvDataEn(translated);
      setCurrentLang('en');
    } catch (err: any) {
      console.error('Translation error:', err);
      let errMsg = 'Ocurrió un error al traducir el currículum. Por favor, intenta de nuevo.';
      if (err.message?.includes('API_KEY_INVALID') || err.status === 403) {
        errMsg = 'La API Key de Gemini ingresada no es válida. Por favor, verifícala.';
      }
      alert(errMsg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
    if (lang === 'es') {
      setCurrentLang('es');
    } else {
      // User switched to English
      if (cvDataEn) {
        setCurrentLang('en');
      } else {
        // English version doesn't exist, trigger translation process
        const apiKey = localStorage.getItem('gemini_api_key_cv_builder');
        if (apiKey && apiKey.trim()) {
          runTranslation(apiKey.trim());
        } else {
          setPendingLangChange(true);
          setShowApiKeyModal(true);
        }
      }
    }
  };

  const handleForceTranslate = () => {
    const apiKey = localStorage.getItem('gemini_api_key_cv_builder');
    if (apiKey && apiKey.trim()) {
      runTranslation(apiKey.trim());
    } else {
      setPendingLangChange(true);
      setShowApiKeyModal(true);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert('Por favor, ingresa tu API Key de Gemini.');
      return;
    }
    localStorage.setItem('gemini_api_key_cv_builder', apiKeyInput.trim());
    setShowApiKeyModal(false);
    
    if (pendingLangChange) {
      runTranslation(apiKeyInput.trim());
      setPendingLangChange(false);
    }
  };

  const activeData = currentLang === 'es' ? cvDataEs : (cvDataEn || cvDataEs);

  return (
    <div className="container-fluid p-0 vh-lg-100 overflow-lg-hidden">
      <div className="row g-0 h-lg-100">
        <Editor
          data={activeData}
          onChange={(newData) => {
            if (currentLang === 'es') {
              setCvDataEs(newData);
            } else {
              setCvDataEn(newData);
            }
          }}
          hoveredSection={hoveredSection}
          setHoveredSection={setHoveredSection}
        />
        <main className="preview-panel col-12 col-lg-8 col-xl-9 h-lg-100 overflow-lg-auto py-5 px-3 d-flex justify-content-center align-items-start">
          <Preview
            data={activeData}
            hoveredSection={hoveredSection}
            setHoveredSection={setHoveredSection}
            currentLang={currentLang}
            isTranslating={isTranslating}
            onLanguageChange={handleLanguageChange}
            onTranslate={handleForceTranslate}
          />
        </main>
      </div>

      {/* RENDER API KEY CONFIGURE MODAL PORTAL */}
      {showApiKeyModal && createPortal(
        <>
          <div className="modal-backdrop fade show no-print" onClick={() => {
            setShowApiKeyModal(false);
            setPendingLangChange(false);
          }}></div>
          <div className="modal fade show d-block no-print" tabIndex={-1} role="dialog" onClick={() => {
            setShowApiKeyModal(false);
            setPendingLangChange(false);
          }}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={e => e.stopPropagation()}>
              <div className="modal-content border border-secondary border-opacity-15 bg-dark text-white rounded-3 shadow-lg">
                <div className="modal-header border-bottom border-secondary border-opacity-15 p-3 d-flex justify-content-between align-items-center">
                  <h5 className="modal-title d-flex align-items-center gap-2 m-0 fs-5 fw-semibold">
                    <span className="material-symbols-outlined text-warning fs-5">auto_awesome</span>
                    <span>Gemini API Key</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white border-0 bg-transparent p-1 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setPendingLangChange(false);
                    }}
                    aria-label="Close"
                    style={{ filter: 'invert(1)', opacity: 0.8, outline: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body p-4 text-start">
                  <div className="alert alert-info border-secondary border-opacity-15 bg-dark bg-opacity-25 py-2 px-3 rounded text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                    <strong>¿Por qué se requiere?</strong> Para traducir tu currículum al inglés, usamos la inteligencia artificial de Google Gemini. Necesitas una clave API gratuita.
                    <br />
                    Puedes obtenerla en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary fw-semibold">Google AI Studio</a> en un par de clics.
                  </div>
                  
                  <div className="form-group mb-2">
                    <label htmlFor="modal-gemini-key" className="form-label mb-1">Gemini API Key</label>
                    <input
                      id="modal-gemini-key"
                      type="password"
                      className="form-control"
                      placeholder="Pega tu API Key de Gemini aquí..."
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-15 p-3 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary px-3"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setPendingLangChange(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={handleSaveApiKey}
                  >
                    Guardar y Traducir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default App;

