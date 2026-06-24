import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CVData } from '../types/cv';

/**
 * Translates a complete CVData object from Spanish to English using Gemini.
 * @param cvData The Spanish CV data to translate.
 * @param apiKey The Gemini API Key.
 */
export const translateCVToEnglish = async (cvData: CVData, apiKey: string): Promise<CVData> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const prompt = `
    You are a professional CV and resume translator.
    Translate the following CV JSON data from Spanish (or original language) to English.
    
    Ensure that:
    1. The JSON structure matches the input exactly. Do not add or remove any keys.
    2. Proper nouns such as candidate name ("personalInfo.name"), email, phone, and website are NOT translated.
    3. Project titles, certificates, locations, work accomplishments/bullet points, summary, and skills are professionally translated to standard English terminology used in resume writing (e.g. use active verbs in past tense for past experience, etc.).
    4. University names, company names should remain in their original form unless they have a well-known English translation, but their locations (e.g., "Madrid, España" -> "Madrid, Spain") and descriptions must be translated.
    5. Maintain all ID values (like "id": "exp-1") exactly as they are in the input.

    Input JSON to translate:
    ${JSON.stringify(cvData, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let jsonText = response.text().trim();
  
  // Clean markdown blocks if present as safety backup
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  const parsedData = JSON.parse(jsonText);

  // Safely map values, ensuring correct types and preserving layout settings
  return {
    ...cvData, // Keep original settings
    personalInfo: {
      ...cvData.personalInfo,
      location: parsedData.personalInfo?.location || cvData.personalInfo.location,
    },
    summary: parsedData.summary || '',
    experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((exp: any, i: number) => {
      const originalExp = cvData.experience[i] || {};
      return {
        id: exp.id || originalExp.id || `exp-${Date.now()}-${i}`,
        company: exp.company || originalExp.company || '',
        location: exp.location || originalExp.location || '',
        title: exp.title || originalExp.title || '',
        dates: exp.dates || originalExp.dates || '',
        bullets: Array.isArray(exp.bullets) ? exp.bullets : (originalExp.bullets || []),
        references: exp.references || originalExp.references || '',
      };
    }) : cvData.experience,
    education: Array.isArray(parsedData.education) ? parsedData.education.map((edu: any, i: number) => {
      const originalEdu = cvData.education[i] || {};
      return {
        id: edu.id || originalEdu.id || `edu-${Date.now()}-${i}`,
        institution: edu.institution || originalEdu.institution || '',
        location: edu.location || originalEdu.location || '',
        degree: edu.degree || originalEdu.degree || '',
        dates: edu.dates || originalEdu.dates || '',
        thesis: edu.thesis || originalEdu.thesis || '',
        courses: Array.isArray(edu.courses) ? edu.courses : (originalEdu.courses || []),
      };
    }) : cvData.education,
    skills: Array.isArray(parsedData.skills) ? parsedData.skills.map((skill: any, i: number) => {
      const originalSkill = cvData.skills[i] || {};
      return {
        id: skill.id || originalSkill.id || `skill-${Date.now()}-${i}`,
        categoryName: skill.categoryName || originalSkill.categoryName || '',
        skills: Array.isArray(skill.skills) ? skill.skills : (originalSkill.skills || []),
      };
    }) : cvData.skills,
  };
};

/**
 * Tests if the given Gemini API key is valid by sending a minimal request.
 * @param apiKey The API key to test.
 */
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent("Responder únicamente con la palabra 'OK'");
    const response = await result.response;
    return response.text().trim().toUpperCase().includes('OK');
  } catch (error) {
    console.error('API Key Test failed:', error);
    return false;
  }
};

