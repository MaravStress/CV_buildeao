export interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  location: string;
  title: string;
  dates: string;
  bullets: string[];
  references: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  location: string;
  degree: string;
  dates: string;
  thesis?: string;
  courses?: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface CVSettings {
  fontFamily: string; // e.g. "Georgia, serif"
  fontSize: string;   // e.g. "11pt"
  lineSpacing: number; // e.g. 1.2
  margins: string;    // e.g. "0.6in"
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  settings: CVSettings;
}
