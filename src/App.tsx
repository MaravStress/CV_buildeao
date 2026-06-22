import { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import type { CVData } from './types/cv';
import { ALAN_NIN_CV } from './constants/demoData';
import { FONT_OPTIONS } from './constants/fonts';

function App() {
  // Initialize with Alan Nin's CV as default demo data
  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem('professional_cv_builder_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved CV data:', e);
      }
    }
    return ALAN_NIN_CV;
  });

  // Track hovered section for synchronized UI highlights
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    localStorage.setItem('professional_cv_builder_data', JSON.stringify(cvData));
  }, [cvData]);

  // Set document title dynamically based on applicant name
  useEffect(() => {
    if (cvData.personalInfo.name) {
      document.title = `CV - ${cvData.personalInfo.name}`;
    } else {
      document.title = 'Professional CV Builder';
    }
  }, [cvData.personalInfo.name]);

  // Load selected Google Font dynamically
  useEffect(() => {
    const selectedFont = FONT_OPTIONS.find(f => f.cssValue === cvData.settings.fontFamily);
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
  }, [cvData.settings.fontFamily]);

  return (
    <div className="container-fluid p-0 vh-lg-100 overflow-lg-hidden">
      <div className="row g-0 h-lg-100">
        <Editor
          data={cvData}
          onChange={setCvData}
          hoveredSection={hoveredSection}
          setHoveredSection={setHoveredSection}
        />
        <main className="preview-panel col-12 col-lg-8 col-xl-9 h-lg-100 overflow-lg-auto py-5 px-3 d-flex justify-content-center align-items-start">
          <Preview
            data={cvData}
            hoveredSection={hoveredSection}
            setHoveredSection={setHoveredSection}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
