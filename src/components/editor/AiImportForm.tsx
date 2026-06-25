import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CVData } from '../../types/cv';

interface AiImportFormProps {
  currentSettings: CVData['settings'];
  onChange: (newData: CVData) => void;
  onClose: () => void;
}

export const AiImportForm: React.FC<AiImportFormProps> = ({
  currentSettings,
  onChange,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key_cv_builder') || '');
  const [resumeText, setResumeText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setAiError('El archivo seleccionado debe ser un PDF válido.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAiError('El archivo es demasiado grande. El límite es 10MB.');
      return;
    }
    setPdfFile(file);
    setAiError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setPdfBase64(base64);
    };
    reader.onerror = () => {
      setAiError('Error al leer el archivo PDF.');
    };
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setPdfBase64(null);
  };

  const handleAiParse = async () => {
    if (!apiKey.trim()) {
      setAiError('Por favor ingresa tu API Key de Gemini.');
      return;
    }
    if (!resumeText.trim() && !pdfBase64) {
      setAiError('Por favor pega el texto de tu currículum o selecciona un archivo PDF.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      localStorage.setItem('gemini_api_key_cv_builder', apiKey.trim());
      const genAI = new GoogleGenerativeAI(apiKey.trim());

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const prompt = `
        Toma el currículum ${pdfBase64 ? 'del archivo PDF adjunto' : 'del siguiente texto'} y extrae toda su información para estructurarla en un objeto JSON que cumpla exactamente con el siguiente esquema de TypeScript.

        Esquema de TypeScript:
        interface PersonalInfo {
          name: string;
          location: string;
          email: string;
          phone: string;
          website: string;
          linkedin: string;
        }

        interface ExperienceEntry {
          id: string; // Genera un ID único corto como "exp-1", "exp-2", etc.
          company: string;
          location: string;
          title: string;
          dates: string;
          bullets: string[]; // Viñetas de logros o responsabilidades
          references: string; // Nombre, puesto y contacto de la referencia si existe
        }

        interface EducationEntry {
          id: string; // Genera un ID único corto como "edu-1", "edu-2", etc.
          institution: string;
          location: string;
          degree: string; // Título o grado académico
          dates: string; // Periodo de fechas
          thesis?: string; // Tesis o mención si existe
          courses?: string[]; // Lista de cursos relevantes o certificaciones asociadas a esta institución
        }

        interface SkillCategory {
          id: string; // Genera un ID único corto como "skill-1", "skill-2", etc.
          categoryName: string; // e.g. "Front-End", "Back-End", "Idiomas", "General"
          skills: string[]; // Lista de habilidades individuales
        }

        interface CVData {
          personalInfo: PersonalInfo;
          summary: string; // Breve descripción o resumen profesional
          experience: ExperienceEntry[];
          education: EducationEntry[];
          skills: SkillCategory[];
        }

        Reglas importantes:
        1. No añadas introducciones, explicaciones, ni etiquetas de código markdown (como \`\`\`json). Devuelve únicamente la cadena de texto JSON pura.
        2. Mantén los textos de los logros y viñetas en el idioma original en el que están en el currículum del usuario.
        3. Si falta algún campo (como el sitio web o las referencias), déjalo como una cadena vacía "".
        4. Asegúrate de estructurar adecuadamente las viñetas en arrays.
        ${pdfBase64 ? '' : `\n        Texto del Currículum:\n        ${resumeText}`}
      `;

      let payload: any = prompt;
      if (pdfBase64) {
        payload = [
          { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } },
          { text: prompt }
        ];
      }

      const result = await model.generateContent(payload);
      const response = await result.response;
      const jsonText = response.text();
      const parsedData = JSON.parse(jsonText);

      if (parsedData && typeof parsedData === 'object') {
        const fullData: CVData = {
          personalInfo: {
            name: parsedData.personalInfo?.name || '',
            location: parsedData.personalInfo?.location || '',
            email: parsedData.personalInfo?.email || '',
            phone: parsedData.personalInfo?.phone || '',
            website: parsedData.personalInfo?.website || '',
            linkedin: parsedData.personalInfo?.linkedin || '',
          },
          summary: parsedData.summary || '',
          experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((exp: any, i: number) => ({
            id: exp.id || `exp-${Date.now()}-${i}`,
            company: exp.company || '',
            location: exp.location || '',
            title: exp.title || '',
            dates: exp.dates || '',
            bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
            references: exp.references || '',
          })) : [],
          education: Array.isArray(parsedData.education) ? parsedData.education.map((edu: any, i: number) => ({
            id: edu.id || `edu-${Date.now()}-${i}`,
            institution: edu.institution || '',
            location: edu.location || '',
            degree: edu.degree || '',
            dates: edu.dates || '',
            thesis: edu.thesis || '',
            courses: Array.isArray(edu.courses) ? edu.courses : [],
          })) : [],
          skills: Array.isArray(parsedData.skills) ? parsedData.skills.map((skill: any, i: number) => ({
            id: skill.id || `skill-${Date.now()}-${i}`,
            categoryName: skill.categoryName || '',
            skills: Array.isArray(skill.skills) ? skill.skills : [],
          })) : [],
          settings: currentSettings // Preserve typography and margins
        };

        onChange(fullData);
        setResumeText('');
        setPdfFile(null);
        setPdfBase64(null);
        onClose();
      } else {
        throw new Error('La respuesta de la IA no contiene una estructura estructurada legible.');
      }
    } catch (err: any) {
      console.error('Error al analizar el CV con Gemini:', err);
      let errMsg = 'Ocurrió un error al analizar el texto o el archivo. Asegúrate de ingresar una API Key válida.';
      if (err.message?.includes('API_KEY_INVALID') || err.status === 403) {
        errMsg = 'La API Key de Gemini ingresada no es válida. Por favor, verifícala.';
      } else if (err instanceof SyntaxError) {
        errMsg = 'No se pudo parsear el resultado de la IA como JSON. Por favor intenta de nuevo.';
      }
      setAiError(errMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3 text-start">
      <div className="alert alert-info border-secondary border-opacity-15 bg-dark bg-opacity-25 py-2 px-3 rounded text-muted mb-2" style={{ fontSize: '0.85rem' }}>
        <strong>¿Cómo obtener tu API Key?</strong> Ingresa a{' '}
        <a
          href="https://aistudio.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary fw-semibold"
        >
          Google AI Studio
        </a>{' '}
        para obtener una clave de API gratuita en un par de clics. La clave se guardará localmente en tu navegador de forma segura.
      </div>

      <div className="form-group mb-2">
        <label htmlFor="ai-key" className="form-label mb-1">Gemini API Key</label>
        <input
          id="ai-key"
          type="password"
          className="form-control"
          placeholder="Pega tu API Key de Gemini aquí..."
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          disabled={isAiLoading}
        />
      </div>

      <div className="row g-3">
        <div className="col-12 form-group">
          <label className="form-label mb-1">Cargar Archivo PDF</label>
          {!pdfFile ? (
            <div className="pdf-upload-dropzone border border-dashed border-secondary border-opacity-25 rounded-3 p-4 text-center cursor-pointer position-relative hover-glow" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <input
                type="file"
                accept=".pdf"
                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                onChange={handlePdfChange}
                disabled={isAiLoading}
              />
              <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '28px' }}>auto_awesome</span>
              <h5 className="fs-6 mb-1 text-white">Arrastra aquí tu CV en PDF o haz clic para buscar</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Máx. 10MB. Gemini analizará el documento con OCR si es necesario.</p>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between p-3 border border-secondary border-opacity-20 rounded-3" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <span className="material-symbols-outlined text-indigo flex-shrink-0" style={{ fontSize: '20px' }}>description</span>
                <div className="overflow-hidden">
                  <p className="mb-0 text-white text-truncate fw-medium" style={{ fontSize: '0.85rem' }}>{pdfFile.name}</p>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.72rem' }}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-danger px-2 py-1"
                onClick={removePdfFile}
                disabled={isAiLoading}
              >
                Remover
              </button>
            </div>
          )}
        </div>

        {!pdfFile && (
          <div className="col-12 form-group">
            <div className="d-flex align-items-center my-2">
              <hr className="flex-grow-1 border-secondary border-opacity-15" />
              <span className="px-2 text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>O pega el texto</span>
              <hr className="flex-grow-1 border-secondary border-opacity-15" />
            </div>

            <label htmlFor="ai-text" className="form-label mb-1">Texto de tu Currículum</label>
            <textarea
              id="ai-text"
              className="form-control"
              rows={6}
              placeholder="Copia el texto completo de tu currículum actual y pégalo aquí..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              disabled={isAiLoading}
            />
          </div>
        )}
      </div>

      {aiError && (
        <div className="alert alert-danger border-danger border-opacity-15 py-2 px-3 rounded text-danger mb-0" style={{ fontSize: '0.85rem' }}>
          {aiError}
        </div>
      )}

      {isAiLoading && (
        <div className="d-flex align-items-center justify-content-center gap-3 my-2 text-primary">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span style={{ fontSize: '0.88rem' }} className="fw-medium text-indigo">Analizando y estructurando datos con Gemini Flash...</span>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-2 border-top border-secondary border-opacity-10 pt-3">
        <button
          type="button"
          className="btn btn-secondary px-3"
          onClick={() => {
            removePdfFile();
            setAiError(null);
            onClose();
          }}
          disabled={isAiLoading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary px-4 d-flex align-items-center gap-2"
          onClick={handleAiParse}
          disabled={isAiLoading}
        >
          {isAiLoading ? 'Analizando...' : 'Analizar Currículum'}
        </button>
      </div>
    </div>
  );
};
